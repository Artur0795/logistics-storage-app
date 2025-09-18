from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'full_name', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            full_name=validated_data['full_name'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        user.storage_path = f"{user.username}/"
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ['password', 'user_permissions', 'groups']

    def to_representation(self, user):
        if not user:
            raise serializers.ValidationError("Неверные данные")
        return {
            'id': user.id,
            'username': user.username,
            'is_admin': user.is_admin
        }


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ['password', 'user_permissions', 'groups']
