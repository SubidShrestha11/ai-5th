from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from . import services
from .serializers import LoginSerializer, RegisterSerializer, UserProfileSerializer


class RegisterView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(
        tags=["Auth"],
        summary="Register a new user",
        request=RegisterSerializer,
        responses={
            201: UserProfileSerializer,
            400: OpenApiResponse(description="Validation error"),
        },
    )
    def post(self, request: Request) -> Response:
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = services.register_user(serializer.validated_data)
        return Response(
            {
                "user": UserProfileSerializer(result["user"]).data,
                "access": result["access"],
                "refresh": result["refresh"],
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(
        tags=["Auth"],
        summary="Login with email and password",
        request=LoginSerializer,
        responses={
            200: UserProfileSerializer,
            400: OpenApiResponse(description="Invalid credentials"),
        },
    )
    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = services.login_user(serializer.validated_data["user"])
        return Response(
            {
                "user": UserProfileSerializer(result["user"]).data,
                "access": result["access"],
                "refresh": result["refresh"],
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        tags=["Auth"],
        summary="Logout — invalidate refresh token",
        request=None,
        responses={
            204: OpenApiResponse(description="Logged out successfully"),
            400: OpenApiResponse(description="Invalid or missing refresh token"),
        },
    )
    def post(self, request: Request) -> Response:
        services.logout_user(request.data.get("refresh"))
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserProfileView(RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserProfileSerializer
    http_method_names = ("get", "patch")

    @extend_schema(
        tags=["Users"],
        summary="Get own profile",
    )
    def get(self, request: Request, *args, **kwargs) -> Response:
        return super().get(request, *args, **kwargs)

    @extend_schema(
        tags=["Users"],
        summary="Update own profile (bio, profile image)",
    )
    def patch(self, request: Request, *args, **kwargs) -> Response:
        return super().patch(request, *args, **kwargs)

    def get_object(self):
        return self.request.user
