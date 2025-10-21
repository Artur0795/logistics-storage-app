from django.urls import path
from django.http import JsonResponse

from .views import (LoginView, LogoutView, RegisterView, delete_user,
                    toggle_admin_status, user_list, file_list, file_upload,
                    file_delete, file_rename, file_comment, file_download,
                    file_special_download, index, profile_view)

urlpatterns = [
    path('', index, name='index'),
    path('health-check/', lambda request: JsonResponse({'status': 'ok'}), name='health_check'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('users/', user_list, name='user_list'),
    path('users/<int:user_id>/', delete_user, name='delete_user'),
    path('users/<int:user_id>/toggle_admin/', toggle_admin_status, name='toggle_admin_status'),
    path('files/', file_list, name='file_list'),
    path('files/upload/', file_upload),
    path('files/<int:file_id>/delete/', file_delete),
    path('files/<int:file_id>/rename/', file_rename),
    path('files/<int:file_id>/comment/', file_comment),
    path('files/<int:file_id>/download/', file_download),
    path('files/special/<uuid:special_link>/', file_special_download),
    path('profile/', profile_view, name='profile'),
]
