"""
Utility functions for Django Unfold admin configuration
"""
import re
from django.http import HttpResponsePermanentRedirect


class RemoveWWWMiddleware:
    """
    Middleware to redirect www.* URLs to non-www URLs (SEO: canonical redirect).
    Helps maintain consistent canonical URLs and improves SEO rankings.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host().lower()
        
        # If the host starts with www., redirect to non-www version
        if host.startswith('www.'):
            # Build new URL without www
            new_host = host[4:]  # Remove 'www.'
            new_url = request.build_absolute_uri().replace(f'://{host}', f'://{new_host}')
            return HttpResponsePermanentRedirect(new_url)
        
        response = self.get_response(request)
        return response


def environment_callback(request):
    """
    Callback to display environment badge in the admin
    """
    return ["Development", "warning"]  # Can be "success", "info", "warning", "danger"


def dashboard_callback(request, context):
    """
    Callback to customize the admin dashboard
    """
    # You can add custom dashboard widgets here
    return context
