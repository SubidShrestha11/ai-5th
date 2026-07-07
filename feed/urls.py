from django.urls import path

from .views import FriendActivityFeedView

urlpatterns = [
    path("feed/", FriendActivityFeedView.as_view(), name="friend-activity-feed"),
]
