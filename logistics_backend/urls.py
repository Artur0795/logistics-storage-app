from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    # ...existing code...
]

from django.http import JsonResponse


def index(request):
    return JsonResponse({"message": "Добро пожаловать в логистическое приложение!"})
