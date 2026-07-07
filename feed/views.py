from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from . import services
from .serializers import FeedActivitySerializer


class FriendActivityFeedView(ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = FeedActivitySerializer

    @extend_schema(
        tags=["Feed"],
        summary="Friend activity feed",
        description=(
            "Chronological feed of movie logs from your friends, "
            "ordered by most recently posted activity."
        ),
        responses={200: FeedActivitySerializer(many=True)},
    )
    def get(self, request: Request, *args, **kwargs) -> Response:
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        return services.get_friend_activity_feed(self.request.user)
