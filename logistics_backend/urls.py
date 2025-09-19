from django.contrib import admin
from django.urls import path
from django.views.generic import TemplateView
from django.http import JsonResponse

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
]


def index(request):
    return JsonResponse({"message": "Добро пожаловать в логистическое приложение!"})
