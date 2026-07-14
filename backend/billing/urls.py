from django.urls import path
from . import views, admin_views

urlpatterns = [
    path('checkout/', views.checkout_view, name='billing-checkout'),
    path('webhook/', views.webhook_view, name='billing-webhook'),
    path('me/', views.me_view, name='billing-me'),
    path('department/<int:department_id>/subscribe/', views.department_subscribe_view, name='billing-dept-subscribe'),
    path('department/<int:department_id>/seats/', views.department_assign_seat_view, name='billing-dept-assign-seat'),
    path('department/<int:department_id>/seats/<uuid:user_id>/', views.department_revoke_seat_view, name='billing-dept-revoke-seat'),
    path('admin/plans/', admin_views.admin_plans_view, name='billing-admin-plans'),
    path('admin/plans/<int:plan_id>/', admin_views.admin_plan_detail_view, name='billing-admin-plan-detail'),
    path('admin/subscriptions/', admin_views.admin_subscriptions_view, name='billing-admin-subs'),
    path('admin/subscriptions/<int:sub_id>/override/', admin_views.admin_subscription_override_view, name='billing-admin-sub-override'),
    path('admin/payments/', admin_views.admin_payments_view, name='billing-admin-payments'),
    path('admin/seats/', admin_views.admin_seats_view, name='billing-admin-seats'),
    path('admin/credits/', admin_views.admin_credits_view, name='billing-admin-credits'),
    path('admin/stats/', admin_views.admin_billing_stats_view, name='billing-admin-stats'),
]
