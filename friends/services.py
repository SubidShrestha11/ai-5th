from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

from .constants import (
    ERROR_REQUEST_NOT_PENDING,
    FriendRequestAction,
    FriendRequestStatus,
)
from .models import FriendRequest

User = get_user_model()


def send_friend_request(sender: User, receiver_id) -> FriendRequest:
    receiver = get_object_or_404(User, id=receiver_id, is_active=True)
    declined = FriendRequest.objects.filter(
        sender=sender,
        receiver=receiver,
        status=FriendRequestStatus.DECLINED,
    ).first()
    if declined:
        declined.status = FriendRequestStatus.PENDING
        declined.save(update_fields=["status", "updated_at"])
        return declined
    return FriendRequest.objects.create(sender=sender, receiver=receiver)


def respond_to_friend_request(request_id, actor: User, action: str) -> FriendRequest:
    friend_request = get_object_or_404(
        FriendRequest.objects.select_related("sender", "receiver"),
        id=request_id,
    )
    if friend_request.receiver_id != actor.id:
        raise PermissionDenied("Only the receiver can respond to this friend request.")
    if friend_request.status != FriendRequestStatus.PENDING:
        raise ValidationError(
            {"non_field_errors": ["This friend request is no longer pending."]},
            code=ERROR_REQUEST_NOT_PENDING,
        )
    if action == FriendRequestAction.ACCEPT:
        friend_request.status = FriendRequestStatus.ACCEPTED
    else:
        friend_request.status = FriendRequestStatus.DECLINED
    friend_request.save(update_fields=["status", "updated_at"])
    return friend_request


def list_friends(user: User):
    return FriendRequest.objects.friends_of(user)


def get_friend_user_ids(user: User) -> list:
    friendships = list_friends(user)
    return [friendship.other_user(user).id for friendship in friendships]


def get_friend_users(user: User):
    return User.objects.filter(id__in=get_friend_user_ids(user)).order_by("email")


def list_pending_requests(user: User, direction: str | None = None):
    return FriendRequest.objects.pending_for(user, direction)


def remove_friend(user: User, friend_user_id) -> None:
    friend = get_object_or_404(User, id=friend_user_id, is_active=True)
    friendship = FriendRequest.objects.accepted_between(user, friend).first()
    if friendship is None:
        raise NotFound("You are not friends with this user.")
    friendship.delete()


def are_friends(user_a: User, user_b: User) -> bool:
    return FriendRequest.objects.accepted_between(user_a, user_b).exists()


def get_friend_movie_logs(viewer: User, friend_user_id):
    friend = get_object_or_404(User, id=friend_user_id, is_active=True)
    if not are_friends(viewer, friend):
        raise PermissionDenied("You can only view movie logs of your friends.")
    from movies import services as movie_services

    return movie_services.get_user_movie_logs(friend.id)
