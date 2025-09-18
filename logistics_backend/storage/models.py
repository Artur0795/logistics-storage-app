import uuid

from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models


class User(AbstractUser):
    full_name = models.CharField(max_length=150)
    is_admin = models.BooleanField(default=False)
    storage_path = models.CharField(max_length=255, blank=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['full_name', 'email']
    objects = UserManager()


class UserFile(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='files'
    )
    original_name = models.CharField(max_length=255)
    stored_name = models.CharField(max_length=255, unique=True)
    comment = models.TextField(blank=True)
    size = models.BigIntegerField()
    upload_date = models.DateTimeField(auto_now_add=True)
    last_download = models.DateTimeField(null=True, blank=True)
    special_link = models.UUIDField(default=uuid.uuid4, unique=True)

    def __str__(self):
        return f"{self.user.username} — {self.original_name}"
