from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from friends.constants import FriendRequestStatus
from friends.models import FriendRequest

User = get_user_model()


class InfiniteScrollPaginationTests(APITestCase):
    url = reverse("friend-list")

    def setUp(self) -> None:
        self.user = User.objects.create_user(
            email="alice@example.com",
            password="SecurePass123!",
        )
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

        for index in range(25):
            friend = User.objects.create_user(
                email=f"friend{index}@example.com",
                password="SecurePass123!",
            )
            FriendRequest.objects.create(
                sender=self.user,
                receiver=friend,
                status=FriendRequestStatus.ACCEPTED,
            )

    def test_first_page_includes_next_url(self) -> None:
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 20)
        self.assertIsNotNone(response.data["next"])
        self.assertIn("page=2", response.data["next"])

    def test_last_page_next_url_is_null(self) -> None:
        response = self.client.get(self.url, {"page": 2})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 5)
        self.assertIsNone(response.data["next"])

    def test_page_size_query_param(self) -> None:
        response = self.client.get(self.url, {"page_size": 10})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 10)
        self.assertIsNotNone(response.data["next"])
