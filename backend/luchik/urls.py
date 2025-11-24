"""
URL configuration for luchik project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def root_view(request):
    """Root endpoint that redirects to API info"""
    return JsonResponse({
        'message': 'Luchik Backend API',
        'endpoints': {
            'home': '/api/home/',
            'courses': '/api/courses/',
            'contacts': '/api/contacts/',
            'admin': '/admin/',
        }
    })

urlpatterns = [
    path('', root_view, name='root'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

