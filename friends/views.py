from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from . import services
from .serializers import (
    FriendRequestActionSerializer,
    FriendRequestCreateSerializer,
    FriendRequestListQuerySerializer,
    FriendRequestSerializer,
    FriendUserSerializer,
)


class FriendRequestCreateView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=["Friends"],
        summary="Send a friend request",
        request=FriendRequestCreateSerializer,
        responses={
            201: FriendRequestSerializer,
            400: OpenApiResponse(description="Validation error"),
        },
    )
    def post(self, request: Request) -> Response:
        serializer = FriendRequestCreateSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        friend_request = services.send_friend_request(
            sender=request.user,
            receiver_id=serializer.validated_data["receiver_id"],
        )
        return Response(
            FriendRequestSerializer(friend_request).data,
            status=status.HTTP_201_CREATED,
        )


class FriendRequestRespondView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=["Friends"],
        summary="Accept or decline a friend request",
        request=FriendRequestActionSerializer,
        responses={
            200: FriendRequestSerializer,
            400: OpenApiResponse(description="Validation error"),
            403: OpenApiResponse(description="Only the receiver may respond"),
            404: OpenApiResponse(description="Friend request not found"),
        },
    )
    def patch(self, request: Request, request_id) -> Response:
        serializer = FriendRequestActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        friend_request = services.respond_to_friend_request(
            request_id=request_id,
            actor=request.user,
            action=serializer.validated_data["action"],
        )
        return Response(FriendRequestSerializer(friend_request).data)


class FriendRequestListView(ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = FriendRequestSerializer

    @extend_schema(
        tags=["Friends"],
        summary="List pending friend requests",
        parameters=[
            OpenApiParameter(
                name="direction",
                type=str,
                enum=["incoming", "outgoing"],
                description="Filter by request direction",
            ),
        ],
        responses={200: FriendRequestSerializer(many=True)},
    )
    def get(self, request: Request, *args, **kwargs) -> Response:
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        query = FriendRequestListQuerySerializer(data=self.request.query_params)
        query.is_valid(raise_exception=True)
        return services.list_pending_requests(
            user=self.request.user,
            direction=query.validated_data.get("direction"),
        )


class FriendListView(ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = FriendUserSerializer

    @extend_schema(
        tags=["Friends"],
        summary="List all friends",
        responses={200: FriendUserSerializer(many=True)},
    )
    def get(self, request: Request, *args, **kwargs) -> Response:
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        return services.get_friend_users(self.request.user)


class FriendRemoveView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=["Friends"],
        summary="Remove a friend",
        responses={
            204: OpenApiResponse(description="Friend removed"),
            404: OpenApiResponse(description="Friend not found"),
        },
    )
    def delete(self, request: Request, user_id) -> Response:
        services.remove_friend(user=request.user, friend_user_id=user_id)
        return Response(status=status.HTTP_204_NO_CONTENT)
