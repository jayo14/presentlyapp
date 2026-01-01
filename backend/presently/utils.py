"""
Utility functions for Django Unfold admin configuration
"""


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
