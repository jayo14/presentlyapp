import re

with open('backend/institutions/views.py', 'r') as f:
    content = f.read()

# Replace AttendanceSessionViewSet.check_in
check_in_pattern = r'    @action\(detail=True, methods=\[\'post\'\]\)\s+def check_in\(self, request, pk=None\):.*?return Response\(response_data, status=status.HTTP_201_CREATED\)\s+else:\s+return Response\(\{\s+\'success\': False,\s+\'errors\': serializer.errors\s+\}, status=status.HTTP_400_BAD_REQUEST\)'
new_check_in = """    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        \"\"\"Student check-in with multi-sample verification\"\"\"
        session = self.get_object()
        return perform_attendance_check_in(request, session)"""

content = re.sub(check_in_pattern, new_check_in, content, flags=re.DOTALL)

# Replace public_check_in_view logic
public_view_pattern = r'def public_check_in_view\(request, session_code\):.*?elif request\.method == \'POST\':.*?return Response\(response_data, status=status.HTTP_201_CREATED\)\s+else:\s+return Response\(\{\s+\'success\': False,\s+\'errors\': serializer.errors\s+\}, status=status.HTTP_400_BAD_REQUEST\)'

new_public_view = """def public_check_in_view(request, session_code):
    \"\"\"Public check-in endpoint with multi-sample verification\"\"\"
    try:
        session = AttendanceSession.objects.get(session_code=session_code)
    except AttendanceSession.DoesNotExist:
        return Response({
            'status': 'error',
            'reason': 'Invalid session code'
        }, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AttendanceSessionSerializer(session)
        return Response({
            'success': True,
            'session': serializer.data
        })

    elif request.method == 'POST':
        return perform_attendance_check_in(request, session)"""

content = re.sub(public_view_pattern, new_public_view, content, flags=re.DOTALL)

with open('backend/institutions/views.py', 'w') as f:
    f.write(content)
