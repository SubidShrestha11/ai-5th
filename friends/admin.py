from django.contrib import admin

from .models import FriendRequest


@admin.register(FriendRequest)
class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "sender", "receiver", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("sender__email", "receiver__email")
    readonly_fields = ("id", "created_at", "updated_at")
