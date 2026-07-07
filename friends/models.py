import uuid

from django.conf import settings
from django.db import models
from django.db.models import Q

from .constants import FriendRequestStatus


class FriendRequestQuerySet(models.QuerySet):
    def pending(self) -> "FriendRequestQuerySet":
        return self.filter(status=FriendRequestStatus.PENDING)

    def accepted(self) -> "FriendRequestQuerySet":
        return self.filter(status=FriendRequestStatus.ACCEPTED)

    def involving(self, user) -> "FriendRequestQuerySet":
        return self.filter(Q(sender=user) | Q(receiver=user))

    def between(self, user_a, user_b) -> "FriendRequestQuerySet":
        return self.filter(
            (Q(sender=user_a) & Q(receiver=user_b))
            | (Q(sender=user_b) & Q(receiver=user_a))
        )

    def accepted_between(self, user_a, user_b) -> "FriendRequestQuerySet":
        return self.accepted().between(user_a, user_b)

    def friends_of(self, user) -> "FriendRequestQuerySet":
        return self.accepted().involving(user).select_related("sender", "receiver")

    def pending_for(self, user, direction: str | None = None) -> "FriendRequestQuerySet":
        queryset = self.pending().select_related("sender", "receiver")
        if direction == "incoming":
            return queryset.filter(receiver=user)
        if direction == "outgoing":
            return queryset.filter(sender=user)
        return queryset.involving(user)


class FriendRequestManager(models.Manager.from_queryset(FriendRequestQuerySet)):
    pass


class FriendRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_friend_requests",
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_friend_requests",
    )
    status = models.CharField(
        max_length=20,
        choices=FriendRequestStatus.choices,
        default=FriendRequestStatus.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = FriendRequestManager()

    class Meta:
        db_table = "friend_requests"
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(
                fields=("sender", "receiver"),
                name="unique_friend_request_pair",
            ),
            models.CheckConstraint(
                check=~models.Q(sender=models.F("receiver")),
                name="no_self_friend_request",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.sender.email} -> {self.receiver.email} ({self.status})"

    def other_user(self, user):
        return self.receiver if self.sender_id == user.id else self.sender
