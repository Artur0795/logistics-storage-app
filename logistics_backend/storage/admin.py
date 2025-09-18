from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserFile

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'full_name', 'email', 'is_admin', 'is_active', 'is_superuser')
    list_filter = ('is_admin', 'is_active', 'is_superuser')
    search_fields = ('username', 'full_name', 'email')
    ordering = ('username',)
    filter_horizontal = ('groups', 'user_permissions')

@admin.register(UserFile)
class UserFileAdmin(admin.ModelAdmin):
    list_display = ('user', 'original_name', 'size', 'upload_date')
    search_fields = ('original_name', 'user__username')
