from django.urls import path
from . import views

urlpatterns = [
    path('checkout/', views.checkout_view, name='billing-checkout'),
    path('webhook/', views.webhook_view, name='billing-webhook'),
    path('me/', views.me_view, name='billing-me'),
]
