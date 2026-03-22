from django.db.models import F
from django.db.models import Q
from django.db.models.query import QuerySet
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, NewsletterSubscriber, Post, Tag
from .serializers import (
    CategorySerializer,
    NewsletterSerializer,
    PostDetailSerializer,
    PostListSerializer,
    TagSerializer,
)


class BlogPostPagination(PageNumberPagination):
    page_size = 10


class PostListView(generics.ListAPIView):
    serializer_class = PostListSerializer
    pagination_class = BlogPostPagination

    def get_queryset(self) -> QuerySet[Post]:
        queryset = (
            Post.objects.filter(status=Post.STATUS_PUBLISHED)
            .select_related('category')
            .prefetch_related('tags')
            .order_by('-is_featured', '-published_at', '-created_at')
        )

        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        tag_slug = self.request.query_params.get('tag')
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)

        featured = self.request.query_params.get('featured')
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(excerpt__icontains=search))

        return queryset.distinct()


class PostDetailView(generics.RetrieveAPIView):
    serializer_class = PostDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self) -> QuerySet[Post]:
        return Post.objects.filter(status=Post.STATUS_PUBLISHED).select_related('category').prefetch_related('tags')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Post.objects.filter(pk=instance.pk).update(views=F('views') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class TagListView(generics.ListAPIView):
    serializer_class = TagSerializer
    queryset = Tag.objects.all().order_by('name')
    pagination_class = None


class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    queryset = Category.objects.all().order_by('name')
    pagination_class = None


class NewsletterSubscribeView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        serializer = NewsletterSerializer(data=request.data)
        if not serializer.is_valid():
            message = serializer.errors.get('email', ['Invalid payload'])[0]
            status_code = status.HTTP_400_BAD_REQUEST
            if str(message) == 'Already subscribed':
                return Response({'error': 'Already subscribed'}, status=status_code)
            return Response({'error': str(message)}, status=status_code)

        source = serializer.validated_data.get('source') or 'blog'
        subscriber = NewsletterSubscriber.objects.create(
            email=serializer.validated_data['email'],
            source=source,
            is_active=True,
        )
        if not subscriber.subscribed_at:
            subscriber.subscribed_at = timezone.now()
            subscriber.save(update_fields=['subscribed_at'])

        return Response({'success': True}, status=status.HTTP_201_CREATED)
