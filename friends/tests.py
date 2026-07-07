from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .constants import FriendRequestStatus
from .models import FriendRequest
from . import services

User = get_user_model()


class FriendsAPITestMixin:
    def setUp(self) -> None:
        self.user_a = User.objects.create_user(
            email="alice@example.com",
            password="SecurePass123!",
        )
        self.user_b = User.objects.create_user(
            email="bob@example.com",
            password="SecurePass123!",
        )
        self.user_c = User.objects.create_user(
            email="carol@example.com",
            password="SecurePass123!",
        )

    def authenticate(self, user: User) -> None:
        token = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")


class SendFriendRequestTests(FriendsAPITestMixin, APITestCase):
    url = reverse("friend-request-create")

    def test_send_friend_request_success(self) -> None:
        self.authenticate(self.user_a)
        response = self.client.post(self.url, {"receiver_id": str(self.user_b.id)}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], FriendRequestStatus.PENDING)
        self.assertEqual(response.data["receiver"]["id"], str(self.user_b.id))

    def test_send_friend_request_unauthenticated(self) -> None:
        response = self.client.post(self.url, {"receiver_id": str(self.user_b.id)}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_send_friend_request_to_self_fails(self) -> None:
        self.authenticate(self.user_a)
        response = self.client.post(self.url, {"receiver_id": str(self.user_a.id)}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("receiver_id", response.data)

    def test_send_friend_request_already_friends_fails(self) -> None:
        FriendRequest.objects.create(
            sender=self.user_a,
            receiver=self.user_b,
            status=FriendRequestStatus.ACCEPTED,
        )
        self.authenticate(self.user_a)
        response = self.client.post(self.url, {"receiver_id": str(self.user_b.id)}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_send_friend_request_duplicate_pending_fails(self) -> None:
        FriendRequest.objects.create(sender=self.user_a, receiver=self.user_b)
        self.authenticate(self.user_a)
        response = self.client.post(self.url, {"receiver_id": str(self.user_b.id)}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_resend_after_decline_reopens_request(self) -> None:
        FriendRequest.objects.create(
            sender=self.user_a,
            receiver=self.user_b,
            status=FriendRequestStatus.DECLINED,
        )
        self.authenticate(self.user_a)
        response = self.client.post(self.url, {"receiver_id": str(self.user_b.id)}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FriendRequest.objects.count(), 1)
        self.assertEqual(
            FriendRequest.objects.first().status,
            FriendRequestStatus.PENDING,
        )


class RespondFriendRequestTests(FriendsAPITestMixin, APITestCase):
    def setUp(self) -> None:
        super().setUp()
        self.friend_request = FriendRequest.objects.create(
            sender=self.user_a,
            receiver=self.user_b,
        )
        self.url = reverse("friend-request-respond", kwargs={"request_id": self.friend_request.id})

    def test_accept_friend_request_success(self) -> None:
        self.authenticate(self.user_b)
        response = self.client.patch(self.url, {"action": "accept"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], FriendRequestStatus.ACCEPTED)

    def test_decline_friend_request_success(self) -> None:
        self.authenticate(self.user_b)
        response = self.client.patch(self.url, {"action": "decline"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], FriendRequestStatus.DECLINED)

    def test_respond_unauthenticated(self) -> None:
        response = self.client.patch(self.url, {"action": "accept"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_respond_invalid_action(self) -> None:
        self.authenticate(self.user_b)
        response = self.client.patch(self.url, {"action": "maybe"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_only_receiver_can_respond(self) -> None:
        self.authenticate(self.user_a)
        response = self.client.patch(self.url, {"action": "accept"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ListPendingRequestsTests(FriendsAPITestMixin, APITestCase):
    url = reverse("friend-request-list")

    def setUp(self) -> None:
        super().setUp()
        FriendRequest.objects.create(sender=self.user_a, receiver=self.user_b)
        FriendRequest.objects.create(sender=self.user_c, receiver=self.user_a)

    def test_list_pending_requests_success(self) -> None:
        self.authenticate(self.user_a)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)

    def test_list_incoming_pending_requests(self) -> None:
        self.authenticate(self.user_a)
        response = self.client.get(self.url, {"direction": "incoming"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["sender"]["id"], str(self.user_c.id))

    def test_list_pending_requests_unauthenticated(self) -> None:
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ListFriendsTests(FriendsAPITestMixin, APITestCase):
    url = reverse("friend-list")

    def setUp(self) -> None:
        super().setUp()
        FriendRequest.objects.create(
            sender=self.user_a,
            receiver=self.user_b,
            status=FriendRequestStatus.ACCEPTED,
        )
        FriendRequest.objects.create(
            sender=self.user_c,
            receiver=self.user_a,
            status=FriendRequestStatus.ACCEPTED,
        )

    def test_list_friends_success(self) -> None:
        self.authenticate(self.user_a)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        friend_ids = {item["id"] for item in response.data["results"]}
        self.assertEqual(friend_ids, {str(self.user_b.id), str(self.user_c.id)})

    def test_list_friends_unauthenticated(self) -> None:
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class RemoveFriendTests(FriendsAPITestMixin, APITestCase):
    def setUp(self) -> None:
        super().setUp()
        FriendRequest.objects.create(
            sender=self.user_a,
            receiver=self.user_b,
            status=FriendRequestStatus.ACCEPTED,
        )
        self.url = reverse("friend-remove", kwargs={"user_id": self.user_b.id})

    def test_remove_friend_success(self) -> None:
        self.authenticate(self.user_a)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(services.are_friends(self.user_a, self.user_b))

    def test_remove_friend_unauthenticated(self) -> None:
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_remove_non_friend_returns_404(self) -> None:
        self.authenticate(self.user_a)
        url = reverse("friend-remove", kwargs={"user_id": self.user_c.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class FriendServicesTests(FriendsAPITestMixin, APITestCase):
    def test_are_friends_returns_true_for_accepted_request(self) -> None:
        FriendRequest.objects.create(
            sender=self.user_a,
            receiver=self.user_b,
            status=FriendRequestStatus.ACCEPTED,
        )
        self.assertTrue(services.are_friends(self.user_a, self.user_b))
        self.assertTrue(services.are_friends(self.user_b, self.user_a))

    def test_are_friends_returns_false_without_accepted_request(self) -> None:
        self.assertFalse(services.are_friends(self.user_a, self.user_b))
