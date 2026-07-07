from django.contrib.auth import get_user_model
from rest_framework import serializers

from .constants import ERROR_ALREADY_FRIENDS, ERROR_CANNOT_FRIEND_SELF, ERROR_REQUEST_ALREADY_PENDING
from .models import FriendRequest

User = get_user_model()


def validate_not_self(sender, receiver_id) -> None:
    if sender.id == receiver_id:
        raise serializers.ValidationError(
            {"receiver_id": "You cannot send a friend request to yourself."},
            code=ERROR_CANNOT_FRIEND_SELF,
        )


def validate_not_already_friends(sender, receiver_id) -> None:
    receiver = User.objects.filter(id=receiver_id).first()
    if receiver is None:
        return
    if FriendRequest.objects.accepted_between(sender, receiver).exists():
        raise serializers.ValidationError(
            {"receiver_id": "You are already friends with this user."},
            code=ERROR_ALREADY_FRIENDS,
        )


def validate_no_pending_request(sender, receiver_id) -> None:
    receiver = User.objects.filter(id=receiver_id).first()
    if receiver is None:
        return
    if FriendRequest.objects.pending().between(sender, receiver).exists():
        raise serializers.ValidationError(
            {"receiver_id": "A friend request is already pending between you and this user."},
            code=ERROR_REQUEST_ALREADY_PENDING,
        )
