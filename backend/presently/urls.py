from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView
from presently.api_urls import health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health-root'),
    path('api/', include('presently.api_urls')),
    path('', RedirectView.as_view(url='/api/', permanent=False), name='index'),
]
