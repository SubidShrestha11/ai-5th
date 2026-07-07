from django.urls import path

from .views import (
    FriendListView,
    FriendRemoveView,
    FriendRequestCreateView,
    FriendRequestListView,
    FriendRequestRespondView,
)

urlpatterns = [
    path("friends/request/", FriendRequestCreateView.as_view(), name="friend-request-create"),
    path(
        "friends/request/<uuid:request_id>/",
        FriendRequestRespondView.as_view(),
        name="friend-request-respond",
    ),
    path("friends/requests/", FriendRequestListView.as_view(), name="friend-request-list"),
    path("friends/", FriendListView.as_view(), name="friend-list"),
    path("friends/<uuid:user_id>/", FriendRemoveView.as_view(), name="friend-remove"),
]
