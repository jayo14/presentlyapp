from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminCategoryViewSet,
    AdminPostViewSet,
    AdminSubscriberViewSet,
    AdminTagViewSet,
    CategoryListView,
    NewsletterSubscribeView,
    PostDetailView,
    PostListView,
    TagListView,
)

router = DefaultRouter()
router.register(r'admin/posts', AdminPostViewSet, basename='admin-post')
router.register(r'admin/categories', AdminCategoryViewSet, basename='admin-category')
router.register(r'admin/tags', AdminTagViewSet, basename='admin-tag')
router.register(r'admin/subscribers', AdminSubscriberViewSet, basename='admin-subscriber')

urlpatterns = [
    path('', include(router.urls)),
    path('posts/', PostListView.as_view(), name='blog-post-list'),
    path('posts/<slug:slug>/', PostDetailView.as_view(), name='blog-post-detail'),
    path('tags/', TagListView.as_view(), name='blog-tag-list'),
    path('categories/', CategoryListView.as_view(), name='blog-category-list'),
    path('newsletter/subscribe/', NewsletterSubscribeView.as_view(), name='blog-newsletter-subscribe'),
]
