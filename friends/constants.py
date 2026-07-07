from django.db import models


class FriendRequestStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    ACCEPTED = "accepted", "Accepted"
    DECLINED = "declined", "Declined"


class FriendRequestAction(models.TextChoices):
    ACCEPT = "accept", "Accept"
    DECLINE = "decline", "Decline"


class FriendRequestDirection(models.TextChoices):
    INCOMING = "incoming", "Incoming"
    OUTGOING = "outgoing", "Outgoing"


ERROR_CANNOT_FRIEND_SELF = "CANNOT_FRIEND_SELF"
ERROR_ALREADY_FRIENDS = "ALREADY_FRIENDS"
ERROR_REQUEST_ALREADY_PENDING = "REQUEST_ALREADY_PENDING"
ERROR_NOT_REQUEST_RECEIVER = "NOT_REQUEST_RECEIVER"
ERROR_REQUEST_NOT_PENDING = "REQUEST_NOT_PENDING"
ERROR_NOT_FRIENDS = "NOT_FRIENDS"
