from django.contrib.auth import authenticate
from rest_framework import serializers
import re
import logging
from .models import User

logger = logging.getLogger(__name__)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        min_length=6,
        error_messages={
            'min_length': 'Пароль должен содержать минимум 6 символов',
            'required': 'Поле "Пароль" обязательно для заполнения'
        }
    )
    full_name = serializers.CharField(
        max_length=150,
        error_messages={
            'required': 'Поле "Полное имя" обязательно для заполнения',
            'blank': 'Поле "Полное имя" не может быть пустым'
        }
    )

    class Meta:
        model = User
        fields = ['username', 'full_name', 'email', 'password']
        extra_kwargs = {
            'username': {
                'error_messages': {
                    'required': 'Поле "Имя пользователя" обязательно для заполнения',
                    'unique': 'Пользователь с таким именем уже существует'
                }
            },
            'email': {
                'error_messages': {
                    'required': 'Поле "Email" обязательно для заполнения',
                    'invalid': 'Введите корректный email адрес',
                    'unique': 'Пользователь с таким email уже существует'
                }
            }
        }

    def validate_username(self, value):
        logger.info(f"Validating username: {value}")
        if not value or not value.strip():
            raise serializers.ValidationError('Поле "Имя пользователя" не может быть пустым')
        
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise serializers.ValidationError('Имя пользователя может содержать только латинские буквы, цифры и символ подчеркивания')
        
        return value.strip()

    def validate_email(self, value):
        logger.info(f"Validating email: {value}")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Пользователь с таким email уже существует')
        return value

    def validate_full_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Поле "Полное имя" не может быть пустым')
        
        if len(value.strip()) < 2:
            raise serializers.ValidationError('Полное имя должно содержать минимум 2 символа')
        
        return value.strip()

    def validate(self, attrs):
        logger.info(f"Validating registration data: {list(attrs.keys())}")
        return attrs

    def create(self, validated_data):
        try:
            logger.info(f"Creating user with data: {list(validated_data.keys())}")
            full_name = validated_data.pop('full_name')
            
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password']
            )
            
            # Устанавливаем full_name
            if hasattr(user, 'full_name'):
                user.full_name = full_name
            
            user.storage_path = f"users/{user.id}_{user.username}/"
            user.save()
            logger.info(f"User created successfully: {user.username}")
            return user
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            raise serializers.ValidationError(f"Ошибка создания пользователя: {str(e)}")


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(
        error_messages={
            'required': 'Поле "Имя пользователя" обязательно для заполнения',
            'blank': 'Поле "Имя пользователя" не может быть пустым'
        }
    )
    password = serializers.CharField(
        write_only=True,
        error_messages={
            'required': 'Поле "Пароль" обязательно для заполнения',
            'blank': 'Поле "Пароль" не может быть пустым'
        }
    )

    def validate(self, attrs):
        logger.info(f"Validating login for user: {attrs.get('username', 'unknown')}")
        username = attrs.get('username')
        password = attrs.get('password')

        if not username or not password:
            raise serializers.ValidationError('Необходимо указать имя пользователя и пароль')

        user = authenticate(username=username, password=password)
        if not user:
            logger.warning(f"Authentication failed for user: {username}")
            raise serializers.ValidationError('Неверные учетные данные')
        
        if not user.is_active:
            logger.warning(f"Inactive user tried to login: {username}")
            raise serializers.ValidationError('Учетная запись отключена')
        
        attrs['user'] = user
        logger.info(f"Login successful for user: {username}")
        return attrs


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
            'full_name': getattr(user, 'full_name', ''),
            'email': user.email,
            'is_admin': user.is_admin,
            'is_active': user.is_active,
            'date_joined': user.date_joined.strftime('%Y-%m-%d %H:%M:%S') if user.date_joined else None
        }


class UserProfileSerializer(serializers.ModelSerializer):
    """Сериализатор для профиля пользователя"""
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'is_admin', 'date_joined']
        read_only_fields = ['id', 'username', 'is_admin', 'date_joined']

    def validate_full_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Поле "Полное имя" не может быть пустым')
        return value.strip()


class UserSerializer(serializers.ModelSerializer):
    """Совместимость - используйте RegisterSerializer для создания или UserProfileSerializer для профиля"""
    password = serializers.CharField(write_only=True, min_length=6, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'password', 'is_admin', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': True},
            'id': {'read_only': True},
            'date_joined': {'read_only': True},
            'is_admin': {'read_only': True}
        }

    def validate_username(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Поле "Имя пользователя" не может быть пустым')
        return value.strip()

    def validate_full_name(self, value):
        if value and not value.strip():
            raise serializers.ValidationError('Поле "Полное имя" не может быть пустым')
        return value.strip() if value else ''

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        full_name = validated_data.pop('full_name', '')
        
        if not password:
            raise serializers.ValidationError({'password': 'Пароль обязателен для создания пользователя'})
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=password
        )
        
        if hasattr(user, 'full_name'):
            user.full_name = full_name if full_name else validated_data['username']
        
        user.storage_path = f"users/{user.id}_{user.username}/"
        user.save()
        return user

    def update(self, instance, validated_data):
        # Обновление профиля (без пароля)
        validated_data.pop('password', None)  # Не обновляем пароль через этот метод
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance