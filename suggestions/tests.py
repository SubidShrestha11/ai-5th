from unittest.mock import patch

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


class SuggestionsAPITestMixin:
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
        self.url = reverse("movie-suggestions")

    def authenticate(self, user: User) -> None:
        token = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")


class FriendMovieSuggestionsTests(SuggestionsAPITestMixin, APITestCase):
    def setUp(self) -> None:
        super().setUp()
        FriendRequest.objects.create(
            sender=self.user_a,
            receiver=self.user_b,
            status=FriendRequestStatus.ACCEPTED,
        )
        self.movie_one = Movie.objects.create(tmdb_id=550, title="Fight Club")
        self.movie_two = Movie.objects.create(tmdb_id=680, title="Pulp Fiction")
        self.movie_three = Movie.objects.create(tmdb_id=13, title="Forrest Gump")
        MovieLog.objects.create(
            user=self.user_b,
            movie=self.movie_one,
            watched_date=timezone.localdate(),
        )
        MovieLog.objects.create(
            user=self.user_b,
            movie=self.movie_two,
            watched_date=timezone.localdate(),
        )
        MovieLog.objects.create(
            user=self.user_b,
            movie=self.movie_three,
            watched_date=timezone.localdate(),
        )

    def test_returns_friends_watched_movies(self) -> None:
        self.authenticate(self.user_a)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["source"], "friends")
        titles = {item["title"] for item in response.data["results"]}
        self.assertEqual(
            titles,
            {"Fight Club", "Pulp Fiction", "Forrest Gump"},
        )

    def test_friend_movies_are_shuffled_consistently_per_user(self) -> None:
        self.authenticate(self.user_a)
        first = self.client.get(self.url)
        second = self.client.get(self.url)
        self.assertEqual(
            [item["tmdb_id"] for item in first.data["results"]],
            [item["tmdb_id"] for item in second.data["results"]],
        )

    def test_pagination_includes_next_url(self) -> None:
        for index in range(18):
            movie = Movie.objects.create(tmdb_id=1000 + index, title=f"Movie {index}")
            MovieLog.objects.create(
                user=self.user_b,
                movie=movie,
                watched_date=timezone.localdate(),
            )

        self.authenticate(self.user_a)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["source"], "friends")
        self.assertEqual(len(response.data["results"]), 20)
        self.assertIsNotNone(response.data["next"])

        page_two = self.client.get(self.url, {"page": 2})
        self.assertEqual(len(page_two.data["results"]), 1)
        self.assertIsNone(page_two.data["next"])

    def test_unauthenticated_request_rejected(self) -> None:
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PopularFallbackSuggestionsTests(SuggestionsAPITestMixin, APITestCase):
    @patch("suggestions.services.movie_services.get_popular_movies")
    def test_falls_back_to_popular_when_friends_have_no_logs(self, mock_popular) -> None:
        FriendRequest.objects.create(
            sender=self.user_a,
            receiver=self.user_b,
            status=FriendRequestStatus.ACCEPTED,
        )
        mock_popular.return_value = {
            "page": 1,
            "total_pages": 10,
            "total_results": 200,
            "results": [
                {
                    "id": 27205,
                    "title": "Inception",
                    "overview": "A thief who steals secrets.",
                    "vote_average": 8.4,
                }
            ],
        }

        self.authenticate(self.user_a)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["source"], "popular")
        self.assertEqual(response.data["results"][0]["title"], "Inception")
        self.assertIsNotNone(response.data["next"])

    @patch("suggestions.services.movie_services.get_popular_movies")
    def test_falls_back_to_popular_when_user_has_no_friends(self, mock_popular) -> None:
        mock_popular.return_value = {
            "page": 1,
            "total_pages": 5,
            "total_results": 100,
            "results": [
                {
                    "id": 603,
                    "title": "The Matrix",
                    "overview": "A computer hacker learns the truth.",
                    "vote_average": 8.2,
                }
            ],
        }

        self.authenticate(self.user_a)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["source"], "popular")
        self.assertEqual(response.data["results"][0]["title"], "The Matrix")
        mock_popular.assert_called_once_with(page=1)
