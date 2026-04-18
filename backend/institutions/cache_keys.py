def _normalized_query_fragment(query_params) -> str:
    parts = []
    for key in sorted(query_params.keys()):
        values = query_params.getlist(key)
        parts.append(f"{key}={'|'.join(values)}")
    return '&'.join(parts) if parts else 'default'


def institutions_list_cache_key(request) -> str:
    role_key = 'admin' if request.user.is_authenticated and getattr(request.user, 'role', None) == 'ADMIN' else 'active'
    return f"institutions_list_v1::{role_key}::{_normalized_query_fragment(request.query_params)}"


def colleges_list_cache_key(request) -> str:
    role_key = 'admin' if request.user.is_authenticated and getattr(request.user, 'role', None) == 'ADMIN' else 'active'
    return f"colleges_list_v1::{role_key}::{_normalized_query_fragment(request.query_params)}"


def departments_list_cache_key(request) -> str:
    role_key = 'admin' if request.user.is_authenticated and getattr(request.user, 'role', None) == 'ADMIN' else 'active'
    return f"departments_list_v1::{role_key}::{_normalized_query_fragment(request.query_params)}"
