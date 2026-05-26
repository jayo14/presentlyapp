from django.db import models
from django.conf import settings
import uuid

class AISummary(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resource = models.OneToOneField('summa_content.Resource', on_delete=models.CASCADE, related_name='summary', null=True, blank=True)
    topic = models.OneToOneField('summa_content.CourseTopic', on_delete=models.CASCADE, related_name='summary', null=True, blank=True)
    content = models.TextField()
    model_version = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'summa_ai_summaries'

class AIConversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_conversations')
    context_resource = models.ForeignKey('summa_content.Resource', on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=255, blank=True)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'summa_ai_conversations'

class AIMessage(models.Model):
    ROLE_CHOICES = [
        ('USER', 'User'),
        ('ASSISTANT', 'Assistant'),
        ('SYSTEM', 'System'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'summa_ai_messages'
        ordering = ['timestamp']

class Recommendation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recommendations')
    suggested_resource = models.ForeignKey('summa_content.Resource', on_delete=models.CASCADE, null=True, blank=True)
    reason = models.CharField(max_length=255)
    score = models.FloatField(default=0.0)
    is_seen = models.BooleanField(default=False)
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'summa_recommendations'
