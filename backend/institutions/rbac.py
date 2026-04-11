from __future__ import annotations

from typing import Dict, List

from institutions.models import RBACPermission, RolePermission, StaffRole, UserPermission

# Central permission config for both backend enforcement and frontend rendering.
PERMISSION_GROUPS: Dict[str, List[dict]] = {
    "venues_management": [
        {"codename": "venues.view", "name": "View Venues", "dangerous": False, "enabled": True},
        {"codename": "venues.create", "name": "Create Venues", "dangerous": False, "enabled": True},
        {"codename": "venues.edit", "name": "Edit Venues", "dangerous": False, "enabled": True},
        {"codename": "venues.delete", "name": "Delete Venues", "dangerous": True, "enabled": False},
    ],
    "map_geofencing": [
        {"codename": "map.access", "name": "Access Map", "dangerous": False, "enabled": True},
        {"codename": "map.geofence.create", "name": "Create Geofencing Areas", "dangerous": False, "enabled": True},
        {"codename": "map.geofence.edit", "name": "Edit Geofencing Areas", "dangerous": False, "enabled": True},
    ],
    "blog_management": [
        {"codename": "blog.view", "name": "View Posts", "dangerous": False, "enabled": True},
        {"codename": "blog.create", "name": "Create Posts", "dangerous": False, "enabled": True},
        {"codename": "blog.edit", "name": "Edit Posts", "dangerous": False, "enabled": True},
        {"codename": "blog.delete", "name": "Delete Posts", "dangerous": True, "enabled": False},
    ],
    "courses_management": [
        {"codename": "courses.view", "name": "View Courses", "dangerous": False, "enabled": True},
        {"codename": "courses.create", "name": "Create Courses", "dangerous": False, "enabled": True},
        {"codename": "courses.edit", "name": "Edit Courses", "dangerous": False, "enabled": True},
        {"codename": "courses.delete", "name": "Delete Courses", "dangerous": True, "enabled": False},
    ],
    "sessions_management": [
        {"codename": "sessions.view", "name": "View Sessions", "dangerous": False, "enabled": True},
        {"codename": "sessions.create", "name": "Create Sessions", "dangerous": False, "enabled": True},
        {"codename": "sessions.edit", "name": "Edit Sessions", "dangerous": False, "enabled": True},
        {"codename": "sessions.delete", "name": "Delete Sessions", "dangerous": True, "enabled": False},
    ],
    "attendance": [
        {"codename": "attendance.view", "name": "View Attendance", "dangerous": False, "enabled": True},
        {"codename": "attendance.export", "name": "Export Attendance", "dangerous": False, "enabled": True},
        {"codename": "attendance.modify", "name": "Modify Attendance", "dangerous": True, "enabled": False},
    ],
    "system": [
        {"codename": "system.analytics.view", "name": "View Analytics", "dangerous": False, "enabled": True},
        {"codename": "system.users.manage", "name": "Manage Users", "dangerous": True, "enabled": False},
        {"codename": "system.staff.manage", "name": "Manage Staff", "dangerous": True, "enabled": False},
        {"codename": "system.settings.manage", "name": "System Settings", "dangerous": True, "enabled": False},
    ],
}

SYSTEM_ROLE_PRESETS: Dict[str, List[str]] = {
    "admin": [perm["codename"] for group in PERMISSION_GROUPS.values() for perm in group],
    "manager": [
        "venues.view", "venues.create", "venues.edit",
        "map.access", "map.geofence.create", "map.geofence.edit",
        "blog.view", "blog.create", "blog.edit",
        "courses.view", "courses.create", "courses.edit",
        "sessions.view", "sessions.create", "sessions.edit",
        "attendance.view", "attendance.export",
        "system.analytics.view", "system.users.manage",
    ],
    "editor": [
        "blog.view", "blog.create", "blog.edit",
        "courses.view",
        "sessions.view",
        "attendance.view",
        "venues.view",
        "map.access",
    ],
    "custom": [],
}


def seed_permissions_and_roles() -> None:
    """Create/update baseline permissions and default role presets."""
    permission_by_code: Dict[str, RBACPermission] = {}

    for group, items in PERMISSION_GROUPS.items():
        for item in items:
            perm, _ = RBACPermission.objects.update_or_create(
                codename=item["codename"],
                defaults={
                    "name": item["name"],
                    "group": group,
                    "description": item["name"],
                    "is_dangerous": item["dangerous"],
                    "enabled_by_default": item["enabled"],
                },
            )
            permission_by_code[perm.codename] = perm

    for slug, permission_codes in SYSTEM_ROLE_PRESETS.items():
        role, _ = StaffRole.objects.get_or_create(
            slug=slug,
            defaults={
                "name": slug.capitalize(),
                "description": f"System preset: {slug}",
                "is_system": True,
                "is_active": True,
            },
        )

        RolePermission.objects.filter(role=role).exclude(permission__codename__in=permission_codes).delete()
        for code in permission_codes:
            perm = permission_by_code.get(code)
            if perm:
                RolePermission.objects.get_or_create(role=role, permission=perm)


from functools import lru_cache

@lru_cache(max_age=1)
def get_all_permission_codenames() -> List[str]:
    return sorted(RBACPermission.objects.values_list("codename", flat=True))

def get_user_effective_permissions(user) -> List[str]:
    """Resolve permissions as (role defaults + user overrides)."""
    if not user or not user.is_authenticated:
        return []

    # Super admins have unrestricted access to all permissions.
    if getattr(user, 'is_superuser', False):
        return get_all_permission_codenames()

    base_codes = set()

    # Optimized staff role check
    if hasattr(user, "staff_profile") and user.staff_profile and user.staff_profile.role_id:
        role_codes = user.staff_profile.role.role_permissions.all()
        base_codes.update(rp.permission.codename for rp in role_codes)
    elif getattr(user, "role", None) == "ADMIN":
        # Backward-compatible full access for legacy admins.
        base_codes = set(get_all_permission_codenames())

    # User-specific overrides
    overrides = UserPermission.objects.filter(user=user).select_related("permission")
    for override in overrides:
        code = override.permission.codename
        if override.allowed:
            base_codes.add(code)
        elif code in base_codes:
            base_codes.remove(code)

    return sorted(base_codes)


def user_has_permission(user, permission_codename: str) -> bool:
    return permission_codename in get_user_effective_permissions(user)
