from rest_framework import serializers

from .models import Category, NewsletterSubscriber, Post, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']


class PostListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(read_only=True, many=True)

    class Meta:
        model = Post
        fields = [
            'id',
            'title',
            'slug',
            'excerpt',
            'cover_image',
            'author_name',
            'author_avatar',
            'category',
            'tags',
            'reading_time',
            'published_at',
            'is_featured',
        ]


class PostDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(read_only=True, many=True)

    class Meta:
        model = Post
        fields = [
            'id',
            'title',
            'slug',
            'excerpt',
            'content',
            'cover_image',
            'author_name',
            'author_avatar',
            'category',
            'tags',
            'status',
            'is_featured',
            'reading_time',
            'views',
            'published_at',
            'created_at',
            'updated_at',
            'seo_title',
            'seo_description',
        ]


class NewsletterSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ['email', 'source']

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()
        if NewsletterSubscriber.objects.filter(email=email, is_active=True).exists():
            raise serializers.ValidationError('Already subscribed')
        return email
