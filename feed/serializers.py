from rest_framework import serializers

from friends.serializers import FriendUserSerializer
from movies.serializers import MovieSerializer


class FeedActivitySerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    user = FriendUserSerializer(read_only=True)
    movie = MovieSerializer(read_only=True)
    watched_date = serializers.DateField(read_only=True)
    rating = serializers.DecimalField(
        max_digits=3,
        decimal_places=1,
        read_only=True,
        allow_null=True,
    )
    review_text = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
