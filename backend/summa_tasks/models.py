from django.db import models
from django.conf import settings
import uuid

class BaseTask(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class UploadTask(BaseTask):
    file_name = models.CharField(max_length=255)
    progress = models.FloatField(default=0.0)
    resource = models.OneToOneField('summa_content.Resource', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'summa_upload_tasks'

class OCRTask(BaseTask):
    resource = models.ForeignKey('summa_content.Resource', on_delete=models.CASCADE)
    confidence_score = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = 'summa_ocr_tasks'

class EmbeddingTask(BaseTask):
    resource = models.ForeignKey('summa_content.Resource', on_delete=models.CASCADE)
    chunk_count = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'summa_embedding_tasks'

class ClassificationTask(BaseTask):
    resource = models.ForeignKey('summa_content.Resource', on_delete=models.CASCADE)
    predicted_tags = models.JSONField(default=list)

    class Meta:
        db_table = 'summa_classification_tasks'
