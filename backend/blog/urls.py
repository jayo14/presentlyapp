from django.urls import path

from .views import (
    CategoryListView,
    NewsletterSubscribeView,
    PostDetailView,
    PostListView,
    TagListView,
)

urlpatterns = [
    path('posts/', PostListView.as_view(), name='blog-post-list'),
    path('posts/<slug:slug>/', PostDetailView.as_view(), name='blog-post-detail'),
    path('tags/', TagListView.as_view(), name='blog-tag-list'),
    path('categories/', CategoryListView.as_view(), name='blog-category-list'),
    path('newsletter/subscribe/', NewsletterSubscribeView.as_view(), name='blog-newsletter-subscribe'),
]
