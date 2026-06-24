from django.urls import path

from .views import LoginView, LogoutView, RegisterView, UserProfileView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("users/me/", UserProfileView.as_view(), name="user-profile"),
]
