import os
import uuid
import logging

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.hashers import make_password
from django.http import FileResponse, HttpResponse, JsonResponse
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import LoginSerializer, RegisterSerializer, UserListSerializer, UserProfileSerializer
from rest_framework.parsers import MultiPartParser, FormParser

from .models import User, UserFile

User = get_user_model()

logger = logging.getLogger(__name__)


def index(request):
    return HttpResponse("<h1>Добро пожаловать в Logistics Storage App!</h1>")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    if not request.user.is_admin:
        return Response({"error": "Доступ запрещён"}, status=403)

    users = User.objects.all()
    users_data = []
    for user in users:
        file_count = user.files.count()
        file_size = round(sum(f.size for f in user.files.all()) / (1024 * 1024), 2)
        users_data.append({
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "is_admin": user.is_admin,
            "file_count": file_count,
            "file_size": file_size,
        })
    return Response(users_data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    if not request.user.is_admin:
        return Response({"error": "Доступ запрещён"}, status=403)

    try:
        user = User.objects.get(id=user_id)
        if user == request.user:
            return Response({"error": "Нельзя удалить себя"}, status=400)
        user_folder = os.path.join(settings.MEDIA_ROOT, user.storage_path)
        for user_file in user.files.all():
            file_path = os.path.join(user_folder, user_file.stored_name)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception:
                    pass
        try:
            if os.path.exists(user_folder) and not os.listdir(user_folder):
                os.rmdir(user_folder)
        except Exception:
            pass
        user.delete()
        return Response({"message": "Пользователь удалён"})
    except User.DoesNotExist:
        return Response({"error": "Пользователь не найден"}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_admin_status(request, user_id):
    if not request.user.is_admin:
        return Response({"error": "Доступ запрещён"}, status=403)

    try:
        user = User.objects.get(id=user_id)
        user.is_admin = not user.is_admin
        user.save()
        return Response({
            "message": "Права администратора изменены",
            "is_admin": user.is_admin
        })
    except User.DoesNotExist:
        return Response({"error": "Пользователь не найден"}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def file_list(request):
    if not request.user or not request.user.is_authenticated:
        return Response({"error": "Нет авторизации"}, status=401)

    user_id = request.GET.get('user_id')
    if user_id and request.user.is_admin:
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "Пользователь не найден"}, status=404)
    else:
        user = request.user
    files = UserFile.objects.filter(user=user)
    files_data = [
        {
            "id": f.id,
            "original_name": f.original_name,
            "stored_name": f.stored_name,
            "comment": f.comment,
            "size": f.size,
            "upload_date": f.upload_date,
            "last_download": f.last_download,
            "special_link": f.special_link,
        }
        for f in files
    ]
    data = {"files": files_data}
    if user_id and request.user.is_admin:
        data["owner"] = {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
        }
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def file_upload(request):

    if not request.user or not request.user.is_authenticated:
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if auth_header and auth_header.startswith('Bearer '):
            from rest_framework.authtoken.models import Token
            token_key = auth_header.split('Bearer ')[-1].strip()
            try:
                token = Token.objects.get(key=token_key)
                request.user = token.user
            except Token.DoesNotExist:
                return Response({"error": "Неверный токен авторизации"}, status=401)
        else:
            return Response({"error": "Нет авторизации"}, status=401)


    file = request.FILES.get('file')
    comment = request.data.get('comment', '')
    if not file:
        logger.error("Файл не выбран или не передан в запросе")
        return Response({"error": "Файл не выбран"}, status=400)
    stored_name = f"{uuid.uuid4().hex}_{file.name}"
    user_folder = os.path.join(settings.MEDIA_ROOT, request.user.storage_path)
    os.makedirs(user_folder, exist_ok=True)
    file_path = os.path.join(user_folder, stored_name)
    try:
        with open(file_path, 'wb+') as dest:
            for chunk in file.chunks():
                dest.write(chunk)
        user_file = UserFile.objects.create(
            user=request.user,
            original_name=file.name,
            stored_name=stored_name,
            comment=comment,
            size=file.size,
        )
    except Exception as e:
        logger.error(f"Ошибка сохранения файла: {str(e)}")
        return Response({"error": "Ошибка сохранения файла"}, status=500)
    return Response({"message": "Файл загружен", "id": user_file.id})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def file_delete(request, file_id):
    try:
        user_file = UserFile.objects.get(id=file_id)
    except UserFile.DoesNotExist:
        return Response({"error": "Файл не найден"}, status=404)
    if not (request.user.is_admin or user_file.user == request.user):
        return Response({"error": "Нет доступа"}, status=403)
    user_folder = os.path.join(settings.MEDIA_ROOT, user_file.user.storage_path)
    file_path = os.path.join(user_folder, user_file.stored_name)
    if os.path.exists(file_path):
        os.remove(file_path)
    user_file.delete()
    return Response({"message": "Файл удалён"})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def file_rename(request, file_id):
    new_name = request.data.get('new_name')
    if not new_name:
        return Response({"error": "Новое имя не указано"}, status=400)
    try:
        user_file = UserFile.objects.get(id=file_id)
    except UserFile.DoesNotExist:
        return Response({"error": "Файл не найден"}, status=404)
    if not (request.user.is_admin or user_file.user == request.user):
        return Response({"error": "Нет доступа"}, status=403)
    user_file.original_name = new_name
    user_file.save()
    return Response({"message": "Имя файла изменено"})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def file_comment(request, file_id):
    comment = request.data.get('comment', '')
    try:
        user_file = UserFile.objects.get(id=file_id)
    except UserFile.DoesNotExist:
        return Response({"error": "Файл не найден"}, status=404)
    if not (request.user.is_admin or user_file.user == request.user):
        return Response({"error": "Нет доступа"}, status=403)
    user_file.comment = comment
    user_file.save()
    return Response({"message": "Комментарий обновлён"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def file_download(request, file_id):
    try:
        user_file = UserFile.objects.get(id=file_id)
    except UserFile.DoesNotExist:
        return Response({"error": "Файл не найден"}, status=404)
    if not (request.user.is_admin or user_file.user == request.user):
        return Response({"error": "Нет доступа"}, status=403)
    user_folder = os.path.join(settings.MEDIA_ROOT, user_file.user.storage_path)
    file_path = os.path.join(user_folder, user_file.stored_name)
    if not os.path.exists(file_path):
        return Response({"error": "Файл не найден на сервере"}, status=404)
    user_file.last_download = timezone.now()
    user_file.save()
    return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=user_file.original_name)


@api_view(['GET'])
def file_special_download(request, special_link):
    try:
        user_file = UserFile.objects.get(special_link=special_link)
    except UserFile.DoesNotExist:
        return Response({"error": "Файл не найден"}, status=404)
    user_folder = os.path.join(settings.MEDIA_ROOT, user_file.user.storage_path)
    file_path = os.path.join(user_folder, user_file.stored_name)
    if not os.path.exists(file_path):
        return Response({"error": "Файл не найден на сервере"}, status=404)
    user_file.last_download = timezone.now()
    user_file.save()
    return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=user_file.original_name)


@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logger.info(f"Registration data received: {request.data}")
        
        required_fields = ['username', 'email', 'full_name', 'password']
        for field in required_fields:
            if field not in request.data or not str(request.data[field]).strip():
                logger.warning(f"Missing or empty field: {field}")
                return Response({
                    'error': f'Поле "{field}" обязательно для заполнения'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                logger.info(f"User {user.username} registered successfully")
                return Response({
                    'success': True,
                    'message': 'Пользователь успешно зарегистрирован'
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"User creation error: {str(e)}")
                return Response({
                    'error': 'Ошибка при создании пользователя'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            logger.warning(f"Validation errors: {serializer.errors}")
            return Response({
                'error': 'Ошибка валидации данных',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': 'Invalid data', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(
            username=serializer.validated_data.get('username'),
            password=serializer.validated_data.get('password')
        )
        if user and user.is_active:
            login(request, user)
            from rest_framework.authtoken.models import Token
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'success': True,
                'is_admin': getattr(user, 'is_admin', False),
                'full_name': getattr(user, 'full_name', ''),
                'username': user.username,
                'token': token.key
            })
        return Response({'error': 'Неверный логин или пароль'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'success': True})


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return JsonResponse({'status': 'ok', 'message': 'API работает'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'full_name': getattr(user, 'full_name', ''),
        'email': user.email,
        'is_admin': getattr(user, 'is_admin', False),
    })
