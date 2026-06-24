from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


def register_user(validated_data: dict) -> dict:
    """Create a new user and return JWT tokens."""
    user: User = User.objects.create_user(
        email=validated_data["email"],
        password=validated_data["password"],
    )
    tokens = _generate_tokens(user)
    return {"user": user, **tokens}


def login_user(user: User) -> dict:
    """Generate JWT tokens for an authenticated user."""
    return {"user": user, **_generate_tokens(user)}


def logout_user(refresh_token: str) -> None:
    """Blacklist the given refresh token to invalidate the session."""
    token = RefreshToken(refresh_token)
    token.blacklist()


def _generate_tokens(user: User) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }
