from django.contrib import admin
from django.urls import path, include
from rest_framework.documentation import include_docs_urls

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('user_management.urls')),  # Add user management URLs
    path('api/', include('music_logs.urls')),
    path('api/ratings/', include('music_ratings.urls')),
    path('api-auth/', include('rest_framework.urls')),  # For browsable API login
    #path('docs/', include_docs_urls(title='Music Vibe API')),  # API documentation
]
