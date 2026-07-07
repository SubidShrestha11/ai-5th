from django.contrib.auth import get_user_model
from rest_framework import serializers

from .constants import FriendRequestAction, FriendRequestDirection
from .models import FriendRequest
from .validators import validate_no_pending_request, validate_not_already_friends, validate_not_self

User = get_user_model()


class FriendUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "bio", "profile_image")
        read_only_fields = fields


class FriendRequestSerializer(serializers.ModelSerializer):
    sender = FriendUserSerializer(read_only=True)
    receiver = FriendUserSerializer(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ("id", "sender", "receiver", "status", "created_at", "updated_at")
        read_only_fields = fields


class FriendRequestCreateSerializer(serializers.Serializer):
    receiver_id = serializers.UUIDField()

    def validate_receiver_id(self, value):
        receiver = User.objects.filter(id=value, is_active=True).first()
        if receiver is None:
            raise serializers.ValidationError("No active user found with this ID.")
        return value

    def validate(self, attrs: dict) -> dict:
        sender = self.context["request"].user
        receiver_id = attrs["receiver_id"]
        validate_not_self(sender, receiver_id)
        validate_not_already_friends(sender, receiver_id)
        validate_no_pending_request(sender, receiver_id)
        return attrs


class FriendRequestActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=FriendRequestAction.choices)


class FriendRequestListQuerySerializer(serializers.Serializer):
    direction = serializers.ChoiceField(
        choices=FriendRequestDirection.choices,
        required=False,
        allow_null=True,
    )
