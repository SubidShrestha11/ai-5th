from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from friends.constants import FriendRequestStatus
from friends.models import FriendRequest
from movies.models import Movie, MovieLog

User = get_user_model()


class FeedAPITestMixin:
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
        self.url = reverse("friend-activity-feed")

    def authenticate(self, user: User) -> None:
        token = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")


class FriendActivityFeedTests(FeedAPITestMixin, APITestCase):
    def setUp(self) -> None:
        super().setUp()
        FriendRequest.objects.create(
            sender=self.user_a,
            receiver=self.user_b,
            status=FriendRequestStatus.ACCEPTED,
        )
        self.movie_b = Movie.objects.create(tmdb_id=550, title="Fight Club")
        self.movie_c = Movie.objects.create(tmdb_id=680, title="Pulp Fiction")
        self.log_b = MovieLog.objects.create(
            user=self.user_b,
            movie=self.movie_b,
            watched_date=timezone.localdate(),
            rating=4.5,
            review_text="Great film.",
        )
        self.log_c = MovieLog.objects.create(
            user=self.user_c,
            movie=self.movie_c,
            watched_date=timezone.localdate(),
            rating=3.0,
            review_text="Not in feed.",
        )

    def test_feed_returns_friend_activity(self) -> None:
        self.authenticate(self.user_a)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["id"], str(self.log_b.id))
        self.assertEqual(response.data["results"][0]["user"]["email"], self.user_b.email)
        self.assertEqual(response.data["results"][0]["movie"]["title"], "Fight Club")

    def test_feed_unauthenticated(self) -> None:
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_feed_empty_when_no_friends(self) -> None:
        self.authenticate(self.user_c)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"], [])

    def test_feed_ordered_by_most_recent_activity(self) -> None:
        movie_b2 = Movie.objects.create(tmdb_id=13, title="Forrest Gump")
        log_b_old = MovieLog.objects.create(
            user=self.user_b,
            movie=self.movie_b,
            watched_date=timezone.localdate().replace(year=2020),
            review_text="Older log.",
        )
        log_b_new = MovieLog.objects.create(
            user=self.user_b,
            movie=movie_b2,
            watched_date=timezone.localdate(),
            review_text="Newer log.",
        )
        MovieLog.objects.filter(id=log_b_old.id).update(
            created_at=timezone.now() - timezone.timedelta(days=2)
        )
        MovieLog.objects.filter(id=log_b_new.id).update(
            created_at=timezone.now() - timezone.timedelta(hours=1)
        )
        MovieLog.objects.filter(id=self.log_b.id).update(
            created_at=timezone.now() - timezone.timedelta(days=1)
        )

        self.authenticate(self.user_a)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result_ids = [item["id"] for item in response.data["results"]]
        self.assertEqual(result_ids, [str(log_b_new.id), str(self.log_b.id), str(log_b_old.id)])
