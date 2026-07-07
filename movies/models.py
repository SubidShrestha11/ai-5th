import uuid

from django.conf import settings
from django.db import models


class Movie(models.Model):
    """Cached TMDB movie metadata."""

    tmdb_id = models.PositiveIntegerField(unique=True, db_index=True)
    title = models.CharField(max_length=512)
    overview = models.TextField(blank=True)
    poster_path = models.CharField(max_length=512, blank=True)
    release_date = models.DateField(null=True, blank=True)
    vote_average = models.FloatField(default=0.0)
    runtime = models.PositiveIntegerField(null=True, blank=True)
    genres = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("title",)

    def __str__(self) -> str:
        return self.title


class MovieLog(models.Model):
    """A user's watched-movie diary entry."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="movie_logs",
    )
    movie = models.ForeignKey(
        Movie,
        on_delete=models.CASCADE,
        related_name="logs",
    )
    watched_date = models.DateField()
    rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    review_text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-watched_date", "-created_at")
        constraints = [
            models.UniqueConstraint(
                fields=("user", "movie", "watched_date"),
                name="unique_user_movie_watched_date",
            )
        ]

    def __str__(self) -> str:
        return f"{self.user.email} — {self.movie.title} ({self.watched_date})"
