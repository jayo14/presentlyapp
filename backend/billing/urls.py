from django.urls import path
from . import views

urlpatterns = [
    path('checkout/', views.checkout_view, name='billing-checkout'),
    path('webhook/', views.webhook_view, name='billing-webhook'),
    path('me/', views.me_view, name='billing-me'),
    path('department/<int:department_id>/subscribe/', views.department_subscribe_view, name='billing-dept-subscribe'),
    path('department/<int:department_id>/seats/', views.department_assign_seat_view, name='billing-dept-assign-seat'),
    path('department/<int:department_id>/seats/<uuid:user_id>/', views.department_revoke_seat_view, name='billing-dept-revoke-seat'),
]
