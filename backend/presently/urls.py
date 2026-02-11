from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('presently.api_urls')),
    path('', RedirectView.as_view(url='/api/', permanent=False), name='index'),
]
