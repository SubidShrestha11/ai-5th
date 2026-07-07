from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class TMDBInfiniteScrollTests(APITestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(
            email="alice@example.com",
            password="SecurePass123!",
        )
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    @patch("movies.views.services.get_popular_movies")
    def test_popular_movies_includes_next_url(self, mock_get_popular) -> None:
        mock_get_popular.return_value = {
            "page": 1,
            "total_pages": 5,
            "total_results": 100,
            "results": [{"id": 1, "title": "Movie", "overview": "", "vote_average": 7.5}],
        }
        response = self.client.get(reverse("movies-popular"), {"page": 1})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data["next"])
        self.assertIn("page=2", response.data["next"])
        self.assertIsNone(response.data["previous"])

    @patch("movies.views.services.get_popular_movies")
    def test_popular_movies_last_page_next_url_is_null(self, mock_get_popular) -> None:
        mock_get_popular.return_value = {
            "page": 5,
            "total_pages": 5,
            "total_results": 100,
            "results": [],
        }
        response = self.client.get(reverse("movies-popular"), {"page": 5})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data["next"])
        self.assertIsNotNone(response.data["previous"])

    @patch("movies.views.services.browse_movies")
    def test_search_includes_next_url_with_query(self, mock_browse) -> None:
        mock_browse.return_value = {
            "status": "ready",
            "page": 2,
            "total_pages": 10,
            "total_results": 200,
            "results": [{"id": 2, "title": "Sequel", "overview": "", "vote_average": 8.0}],
        }
        response = self.client.get(reverse("movies-search"), {"q": "batman", "page": 2})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data["next"])
        self.assertIn("q=batman", response.data["next"])
        self.assertIn("page=3", response.data["next"])
        self.assertEqual(response.data["status"], "ready")

    @patch("movies.views.services.browse_movies")
    def test_pending_response_next_url_is_null(self, mock_browse) -> None:
        mock_browse.return_value = {
            "status": "pending",
            "page": 1,
            "total_pages": 0,
            "total_results": 0,
            "results": [],
        }
        response = self.client.get(reverse("movies-search"), {"page": 1})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data["next"])
        self.assertEqual(response.data["status"], "pending")
