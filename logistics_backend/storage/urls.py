from django.urls import path

from .views import (LoginView, LogoutView, RegisterView, delete_user,
                    file_comment, file_delete, file_download, file_list,
                    file_rename, file_special_download, file_upload,
                    toggle_admin_status, user_list)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('users/', user_list),
    path('users/<int:user_id>/delete/', delete_user),
    path('users/<int:user_id>/toggle-admin/', toggle_admin_status),
    path('files/', file_list),
    path('files/upload/', file_upload),
    path('files/<int:file_id>/delete/', file_delete),
    path('files/<int:file_id>/rename/', file_rename),
    path('files/<int:file_id>/comment/', file_comment),
    path('files/<int:file_id>/download/', file_download),
    path('files/special/<uuid:special_link>/', file_special_download),
]
