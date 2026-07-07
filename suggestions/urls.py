from django.urls import path

from .views import SuggestionListView

urlpatterns = [
    path("suggestions/", SuggestionListView.as_view(), name="movie-suggestions"),
]
