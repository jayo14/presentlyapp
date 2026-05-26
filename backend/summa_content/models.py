from django.db import models
from django.conf import settings
import uuid

class CourseTopic(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey('institutions.Course', on_delete=models.CASCADE, related_name='topics')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order_index = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order_index']
        db_table = 'summa_course_topics'

    def __str__(self):
        return f"{self.course.code}: {self.title}"

class Resource(models.Model):
    TYPE_CHOICES = [
        ('PDF', 'PDF Document'),
        ('VIDEO', 'Video'),
        ('LINK', 'External Link'),
        ('MARKDOWN', 'Markdown Note'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    topic = models.ForeignKey(CourseTopic, on_delete=models.CASCADE, related_name='resources', null=True, blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_resources')
    title = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    file_path = models.CharField(max_length=512, blank=True, help_text="S3 or Cloudinary path")
    url = models.URLField(blank=True)
    content = models.TextField(blank=True, help_text="Raw text or markdown content")
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'summa_resources'

    def __str__(self):
        return self.title

class ResourceChunk(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='chunks')
    content = models.TextField()
    page_number = models.PositiveIntegerField(null=True, blank=True)
    chunk_index = models.PositiveIntegerField()
    # Note: Vector embedding should be stored in a specialized field or separate Vector DB
    # If using pgvector: embedding = VectorField(dimensions=1536)

    class Meta:
        db_table = 'summa_resource_chunks'
        ordering = ['chunk_index']

class MarketplaceResource(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resource = models.OneToOneField(Resource, on_delete=models.CASCADE, related_name='marketplace_listing')
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='marketplace_listings')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'summa_marketplace_resources'

class PastQuestionSet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE)
    course = models.ForeignKey('institutions.Course', on_delete=models.CASCADE)
    year = models.PositiveIntegerField()
    semester = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'summa_past_question_sets'
        unique_together = ('institution', 'course', 'year', 'semester')

class PastQuestion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question_set = models.ForeignKey(PastQuestionSet, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    image_url = models.URLField(blank=True)
    explanation = models.TextField(blank=True)
    order_index = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'summa_past_questions'
        ordering = ['order_index']
