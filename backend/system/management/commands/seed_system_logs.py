from django.core.management.base import BaseCommand
from system.models import SystemLog
from institutions.models import User
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Seed system logs for testing'

    def handle(self, *args, **kwargs):
        users = User.objects.all()
        if not users.exists():
            self.stdout.write(self.style.WARNING('No users found. Please create some users first.'))
            return

        actions = [
            ('AUTH', 'info', 'User Login'),
            ('AUTH', 'warning', 'Failed Login Attempt'),
            ('CONFIG', 'success', 'System Config Update'),
            ('SYSTEM', 'info', 'Database Backup'),
            ('SECURITY', 'error', 'Unauthorized Access Detected'),
            ('SYSTEM', 'info', 'Cache Cleared'),
            ('AUTH', 'info', 'User Logout'),
        ]

        for i in range(20):
            event_type, level, action = random.choice(actions)
            user = random.choice(users) if event_type != 'SYSTEM' else None
            
            SystemLog.objects.create(
                event_type=event_type,
                level=level,
                action=action,
                user=user,
                ip_address=f"192.168.1.{random.randint(1, 255)}",
                details=f"Test log entry {i+1}",
                timestamp=timezone.now() - timezone.timedelta(hours=random.randint(0, 100))
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded 20 system logs'))
