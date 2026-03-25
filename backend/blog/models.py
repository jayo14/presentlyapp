from django.db import models
from django.utils import timezone
from utils.email import send_newsletter_welcome_email


class Tag(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self) -> str:
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Categories'

    def __str__(self) -> str:
        return self.name


class Post(models.Model):
    STATUS_DRAFT = 'draft'
    STATUS_PUBLISHED = 'published'
    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Draft'),
        (STATUS_PUBLISHED, 'Published'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    excerpt = models.TextField(max_length=300)
    content = models.TextField()
    cover_image = models.URLField(blank=True)
    author_name = models.CharField(max_length=100)
    author_avatar = models.URLField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    tags = models.ManyToManyField(Tag, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    is_featured = models.BooleanField(default=False)
    reading_time = models.PositiveIntegerField(default=5)
    views = models.PositiveIntegerField(default=0)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    seo_title = models.CharField(max_length=60, blank=True)
    seo_description = models.CharField(max_length=160, blank=True)

    class Meta:
        ordering = ['-published_at', '-created_at']

    def __str__(self) -> str:
        return self.title

    def publish(self) -> None:
        self.status = self.STATUS_PUBLISHED
        if self.published_at is None:
            self.published_at = timezone.now()
        self.save(update_fields=['status', 'published_at', 'updated_at'])

class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    source = models.CharField(max_length=100, default='blog')

    class Meta:
        ordering = ['-subscribed_at']

    def __str__(self) -> str:
        return self.email

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if not is_new:
            return

        first_name = self.email.split("@")[0]
        send_newsletter_welcome_email(
            to=self.email,
            first_name=first_name,
            edition_label="Launch Updates",
            featured_title="Presently Product Updates",
            featured_excerpt="Thanks for subscribing. We will share attendance insights and rollout news.",
            featured_url="https://getpresently.com.ng/blog",
            dashboard_url="https://getpresently.com.ng/dashboard",
            unsubscribe_url="https://getpresently.com.ng/unsubscribe",
        )
