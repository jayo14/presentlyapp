# Generated migration to add signature_image field to User model
# This field was defined in the model but missing from migrations

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('institutions', '0018_attendance_trust_score_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='signature_image',
            field=models.ImageField(blank=True, help_text="Student's digital signature", null=True, upload_to='signatures/'),
        ),
    ]
