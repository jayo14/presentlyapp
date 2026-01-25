# Backend Integration for Push Notifications

This document provides examples for integrating push notifications on the backend using Firebase Cloud Messaging.

## Table of Contents
1. [Overview](#overview)
2. [Setup](#setup)
3. [Python/Django Implementation](#pythondjango-implementation)
4. [Node.js/Express Implementation](#nodejsexpress-implementation)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [Sending Notifications](#sending-notifications)
8. [Testing](#testing)

## Overview

The backend is responsible for:
- Storing FCM tokens from client devices
- Managing device registrations
- Sending push notifications
- Handling token refresh/expiry
- Managing notification preferences

## Setup

### Prerequisites

**For Python/Django**:
- Python 3.8+
- Django 3.2+
- Firebase Admin SDK

**For Node.js/Express**:
- Node.js 14+
- Express 4+
- Firebase Admin SDK

### Firebase Admin SDK Setup

#### 1. Generate Service Account Key

1. Go to Firebase Console
2. Project Settings > Service Accounts
3. Click "Generate New Private Key"
4. Save the JSON file securely (e.g., `serviceAccountKey.json`)

**⚠️ Security Warning**: Never commit this file to version control!

Add to `.gitignore`:
```
serviceAccountKey.json
```

#### 2. Set Environment Variable

Add to your `.env` file:
```bash
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json
# or
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"..."}'
```

## Python/Django Implementation

### 1. Install Dependencies

```bash
pip install firebase-admin
```

Add to `requirements.txt`:
```
firebase-admin>=6.0.0
```

### 2. Initialize Firebase Admin

Create `notifications/firebase_config.py`:

```python
import os
import json
import firebase_admin
from firebase_admin import credentials, messaging
from django.conf import settings

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK if not already initialized."""
    if not firebase_admin._apps:
        # Try to load from file path
        service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
        
        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
        else:
            # Try to load from environment variable JSON
            service_account_json = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
            if service_account_json:
                service_account_dict = json.loads(service_account_json)
                cred = credentials.Certificate(service_account_dict)
            else:
                raise ValueError(
                    "Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT_PATH "
                    "or FIREBASE_SERVICE_ACCOUNT_JSON environment variable."
                )
        
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully")

# Initialize on module load
initialize_firebase()
```

### 3. Database Models

Create `notifications/models.py`:

```python
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Device(models.Model):
    """Store device information and FCM tokens."""
    
    DEVICE_TYPES = (
        ('web', 'Web'),
        ('android', 'Android'),
        ('ios', 'iOS'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='devices')
    fcm_token = models.CharField(max_length=255, unique=True)
    device_type = models.CharField(max_length=10, choices=DEVICE_TYPES, default='web')
    browser = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'devices'
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['fcm_token']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.device_type}"


class NotificationLog(models.Model):
    """Log sent notifications for tracking and debugging."""
    
    STATUS_CHOICES = (
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('pending', 'Pending'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notification_logs')
    device = models.ForeignKey(Device, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=255)
    body = models.TextField()
    data = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(blank=True, null=True)
    sent_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notification_logs'
        ordering = ['-sent_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.email} - {self.status}"
```

### 4. API Serializers

Create `notifications/serializers.py`:

```python
from rest_framework import serializers
from .models import Device

class DeviceSerializer(serializers.ModelSerializer):
    """Serializer for device registration."""
    
    class Meta:
        model = Device
        fields = ['id', 'fcm_token', 'device_type', 'browser', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
```

### 5. API Views

Create `notifications/views.py`:

```python
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Device, NotificationLog
from .serializers import DeviceSerializer
from .services import NotificationService

class DeviceViewSet(viewsets.ModelViewSet):
    """API endpoints for device management."""
    
    permission_classes = [IsAuthenticated]
    serializer_class = DeviceSerializer
    
    def get_queryset(self):
        """Return devices for the current user."""
        return Device.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Register a new device or update existing."""
        fcm_token = request.data.get('fcm_token')
        
        if not fcm_token:
            return Response(
                {'error': 'fcm_token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update or create device
        device, created = Device.objects.update_or_create(
            user=request.user,
            fcm_token=fcm_token,
            defaults={
                'device_type': request.data.get('device_type', 'web'),
                'browser': request.data.get('browser', ''),
                'is_active': True,
            }
        )
        
        serializer = self.get_serializer(device)
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        
        return Response(serializer.data, status=status_code)
    
    @action(detail=False, methods=['post'])
    def test_notification(self, request):
        """Send a test notification to the current user's devices."""
        devices = self.get_queryset().filter(is_active=True)
        
        if not devices.exists():
            return Response(
                {'error': 'No active devices found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Send test notification
        service = NotificationService()
        results = []
        
        for device in devices:
            success = service.send_to_device(
                device=device,
                title='Test Notification',
                body='This is a test notification from Presently',
                data={'url': '/dashboard'}
            )
            results.append({
                'device_id': device.id,
                'success': success
            })
        
        return Response({'results': results})
```

### 6. Notification Service

Create `notifications/services.py`:

```python
from firebase_admin import messaging
from .models import Device, NotificationLog
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    """Service for sending push notifications via FCM."""
    
    @staticmethod
    def send_to_device(device, title, body, data=None):
        """
        Send notification to a specific device.
        
        Args:
            device: Device instance
            title: Notification title
            body: Notification body
            data: Optional dictionary of data to send
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                data=data or {},
                token=device.fcm_token,
            )
            
            response = messaging.send(message)
            
            # Log successful notification
            NotificationLog.objects.create(
                user=device.user,
                device=device,
                title=title,
                body=body,
                data=data,
                status='sent'
            )
            
            logger.info(f"Notification sent successfully: {response}")
            return True
            
        except messaging.UnregisteredError:
            # Token is no longer valid
            logger.warning(f"Device token unregistered: {device.id}")
            device.is_active = False
            device.save()
            
            NotificationLog.objects.create(
                user=device.user,
                device=device,
                title=title,
                body=body,
                data=data,
                status='failed',
                error_message='Token unregistered'
            )
            return False
            
        except Exception as e:
            logger.error(f"Failed to send notification: {str(e)}")
            
            NotificationLog.objects.create(
                user=device.user,
                device=device,
                title=title,
                body=body,
                data=data,
                status='failed',
                error_message=str(e)
            )
            return False
    
    @staticmethod
    def send_to_user(user, title, body, data=None):
        """
        Send notification to all active devices of a user.
        
        Args:
            user: User instance
            title: Notification title
            body: Notification body
            data: Optional dictionary of data to send
        
        Returns:
            dict: Results with success count and failures
        """
        devices = Device.objects.filter(user=user, is_active=True)
        
        results = {
            'total': devices.count(),
            'sent': 0,
            'failed': 0
        }
        
        for device in devices:
            if NotificationService.send_to_device(device, title, body, data):
                results['sent'] += 1
            else:
                results['failed'] += 1
        
        return results
    
    @staticmethod
    def send_to_multiple_users(user_ids, title, body, data=None):
        """
        Send notification to multiple users.
        
        Args:
            user_ids: List of user IDs
            title: Notification title
            body: Notification body
            data: Optional dictionary of data to send
        
        Returns:
            dict: Aggregated results
        """
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        users = User.objects.filter(id__in=user_ids)
        
        total_results = {
            'users': 0,
            'total_devices': 0,
            'sent': 0,
            'failed': 0
        }
        
        for user in users:
            results = NotificationService.send_to_user(user, title, body, data)
            total_results['users'] += 1
            total_results['total_devices'] += results['total']
            total_results['sent'] += results['sent']
            total_results['failed'] += results['failed']
        
        return total_results
```

### 7. URL Configuration

Add to `notifications/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeviceViewSet

router = DefaultRouter()
router.register('devices', DeviceViewSet, basename='device')

urlpatterns = [
    path('', include(router.urls)),
]
```

Add to main `urls.py`:

```python
urlpatterns = [
    # ...
    path('api/notifications/', include('notifications.urls')),
]
```

### 8. Usage Examples

#### Send notification when attendance is marked

```python
from notifications.services import NotificationService

def mark_attendance(student, session):
    # ... mark attendance logic ...
    
    # Send notification
    NotificationService.send_to_user(
        user=student.user,
        title='Attendance Marked',
        body=f'Your attendance for {session.course.name} has been marked',
        data={
            'url': '/dashboard/attendance',
            'session_id': str(session.id)
        }
    )
```

#### Send notification to all students in a class

```python
def notify_session_start(session):
    # Get all students in the course
    students = session.course.students.all()
    student_user_ids = [s.user_id for s in students]
    
    # Send notification
    results = NotificationService.send_to_multiple_users(
        user_ids=student_user_ids,
        title='Class Starting Soon',
        body=f'{session.course.name} starts in 15 minutes',
        data={
            'url': f'/dashboard/sessions/{session.id}',
            'session_id': str(session.id)
        }
    )
    
    print(f"Sent to {results['sent']} devices, {results['failed']} failed")
```

## Node.js/Express Implementation

### 1. Install Dependencies

```bash
npm install firebase-admin
```

### 2. Initialize Firebase

Create `config/firebase.js`:

```javascript
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
function initializeFirebase() {
  if (admin.apps.length === 0) {
    let serviceAccount;
    
    // Try to load from file
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      serviceAccount = require(serviceAccountPath);
    } else {
      // Try to load from environment variable
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      if (serviceAccountJson) {
        serviceAccount = JSON.parse(serviceAccountJson);
      } else {
        throw new Error('Firebase credentials not found');
      }
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('Firebase Admin SDK initialized');
  }
}

initializeFirebase();

module.exports = admin;
```

### 3. Database Schema (Mongoose)

Create `models/Device.js`:

```javascript
const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fcmToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  deviceType: {
    type: String,
    enum: ['web', 'android', 'ios'],
    default: 'web'
  },
  browser: String,
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

deviceSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('Device', deviceSchema);
```

### 4. Notification Service

Create `services/notificationService.js`:

```javascript
const admin = require('../config/firebase');
const Device = require('../models/Device');

class NotificationService {
  /**
   * Send notification to a specific device
   */
  static async sendToDevice(device, title, body, data = {}) {
    try {
      const message = {
        notification: { title, body },
        data,
        token: device.fcmToken
      };
      
      const response = await admin.messaging().send(message);
      console.log('Notification sent:', response);
      return true;
      
    } catch (error) {
      console.error('Failed to send notification:', error);
      
      // Handle invalid token
      if (error.code === 'messaging/registration-token-not-registered') {
        device.isActive = false;
        await device.save();
      }
      
      return false;
    }
  }
  
  /**
   * Send notification to all devices of a user
   */
  static async sendToUser(userId, title, body, data = {}) {
    const devices = await Device.find({ user: userId, isActive: true });
    
    const results = {
      total: devices.length,
      sent: 0,
      failed: 0
    };
    
    for (const device of devices) {
      const success = await this.sendToDevice(device, title, body, data);
      if (success) {
        results.sent++;
      } else {
        results.failed++;
      }
    }
    
    return results;
  }
  
  /**
   * Send notification to multiple users
   */
  static async sendToMultipleUsers(userIds, title, body, data = {}) {
    const promises = userIds.map(userId =>
      this.sendToUser(userId, title, body, data)
    );
    
    const results = await Promise.all(promises);
    
    return results.reduce((acc, result) => ({
      users: acc.users + 1,
      total: acc.total + result.total,
      sent: acc.sent + result.sent,
      failed: acc.failed + result.failed
    }), { users: 0, total: 0, sent: 0, failed: 0 });
  }
}

module.exports = NotificationService;
```

### 5. API Routes

Create `routes/notifications.js`:

```javascript
const express = require('express');
const router = express.Router();
const Device = require('../models/Device');
const NotificationService = require('../services/notificationService');
const { authenticate } = require('../middleware/auth');

// Register device
router.post('/register-device', authenticate, async (req, res) => {
  try {
    const { fcm_token, device_type, browser } = req.body;
    
    if (!fcm_token) {
      return res.status(400).json({ error: 'fcm_token is required' });
    }
    
    const device = await Device.findOneAndUpdate(
      { user: req.user._id, fcmToken: fcm_token },
      {
        deviceType: device_type || 'web',
        browser: browser || '',
        isActive: true
      },
      { upsert: true, new: true }
    );
    
    res.json(device);
    
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

// Test notification
router.post('/test', authenticate, async (req, res) => {
  try {
    const results = await NotificationService.sendToUser(
      req.user._id,
      'Test Notification',
      'This is a test notification from Presently',
      { url: '/dashboard' }
    );
    
    res.json(results);
    
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

module.exports = router;
```

## API Endpoints

### Register Device
```
POST /api/notifications/register-device/
Authorization: Bearer {token}
Content-Type: application/json

{
  "fcm_token": "string",
  "device_type": "web|android|ios",
  "browser": "string" (optional)
}

Response: 201 Created
{
  "id": 1,
  "fcm_token": "...",
  "device_type": "web",
  "browser": "Chrome 120",
  "is_active": true,
  "created_at": "2026-01-04T10:00:00Z"
}
```

### Send Test Notification
```
POST /api/notifications/devices/test_notification/
Authorization: Bearer {token}

Response: 200 OK
{
  "results": [
    {
      "device_id": 1,
      "success": true
    }
  ]
}
```

## Testing

### Using cURL

```bash
# Register device
curl -X POST http://localhost:8000/api/notifications/register-device/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fcm_token": "YOUR_FCM_TOKEN",
    "device_type": "web",
    "browser": "Chrome 120"
  }'

# Send test notification
curl -X POST http://localhost:8000/api/notifications/devices/test_notification/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Python

```python
import requests

# Register device
response = requests.post(
    'http://localhost:8000/api/notifications/register-device/',
    headers={
        'Authorization': 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
    },
    json={
        'fcm_token': 'YOUR_FCM_TOKEN',
        'device_type': 'web',
        'browser': 'Chrome 120'
    }
)
print(response.json())
```

## Database Migrations

### Django

```bash
# Create migrations
python manage.py makemigrations notifications

# Apply migrations
python manage.py migrate

# Create superuser (if needed)
python manage.py createsuperuser
```

### Node.js/MongoDB

```javascript
// No migrations needed with MongoDB
// Indexes are created automatically from schema
```

## Security Considerations

1. **Never expose service account keys**: Keep in secure environment variables
2. **Validate FCM tokens**: Ensure tokens are valid before storing
3. **Rate limiting**: Implement rate limits on notification endpoints
4. **User permissions**: Only allow users to register their own devices
5. **Token rotation**: Handle expired/invalid tokens gracefully
6. **HTTPS only**: Always use HTTPS in production
7. **Audit logs**: Keep logs of sent notifications

## Best Practices

1. **Batch notifications**: Use multicast for multiple devices
2. **Handle errors**: Gracefully handle token errors
3. **Clean up**: Remove inactive devices periodically
4. **Test thoroughly**: Test on different devices/platforms
5. **Monitor**: Track delivery rates and failures
6. **Optimize**: Don't send unnecessary notifications
7. **Personalize**: Customize notifications for users

---

**Last Updated**: January 2026
**Tested With**:
- Django 4.2
- Node.js 18
- Firebase Admin SDK 11.0+
