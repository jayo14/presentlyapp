from functools import wraps

from django.http import JsonResponse
from rest_framework.request import Request

from .services import get_active_subscription_for_user


def enforce_plan_limit(limit_type):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped(view, request, *args, **kwargs):
            if isinstance(request, Request):
                user = request.user
            else:
                user = request.user

            if user.is_anonymous:
                return JsonResponse(
                    {'error': 'Authentication required.'},
                    status=401,
                )

            sub = get_active_subscription_for_user(user)
            plan = sub.plan if sub else None

            if plan and limit_type == 'course_limit' and plan.course_limit is not None:
                course_count = user.courses_taught.count() if hasattr(user, 'courses_taught') else 0
                if course_count >= plan.course_limit:
                    return JsonResponse(
                        {
                            'error': f'Course limit ({plan.course_limit}) reached. Upgrade your plan.',
                            'code': 'plan_limit_exceeded',
                            'limit': plan.course_limit,
                        },
                        status=402,
                    )
            elif not plan and limit_type == 'course_limit':
                from django.apps import apps
                Course = apps.get_model('institutions', 'Course')
                course_count = Course.objects.filter(
                    memberships__user=user,
                    memberships__role__in=['LECTURER', 'CO_LECTURER']
                ).count() if hasattr(Course, 'objects') else 0
                if course_count >= 1:
                    return JsonResponse(
                        {
                            'error': 'Free plan allows only 1 course. Upgrade to Pro.',
                            'code': 'plan_limit_exceeded',
                            'limit': 1,
                        },
                        status=402,
                    )

            return view_func(view, request, *args, **kwargs)
        return _wrapped
    return decorator
