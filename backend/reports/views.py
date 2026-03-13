from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from .export_services import generate_attendance_csv, generate_attendance_excel, generate_attendance_pdf


class ReportListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'reports': []})


class ReportDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        return Response({'id': pk, 'message': 'Report detail'})


class DownloadReportView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        return Response({'message': 'Report download', 'id': pk})


class DeleteReportView(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request, pk):
        return Response({'message': 'Report deleted', 'id': pk})


class GenerateAttendanceReportView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        return Response({'message': 'Attendance report generated'})


class GenerateExamClearanceReportView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        return Response({'message': 'Exam clearance report generated'})


class GenerateSessionReportView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        return Response({'message': 'Session report generated'})


class GenerateStudentReportView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        return Response({'message': 'Student report generated'})


class GenerateCourseReportView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        return Response({'message': 'Course report generated'})


class GenerateDepartmentReportView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        return Response({'message': 'Department report generated'})


class ScheduledReportListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'scheduled_reports': []})


class CreateScheduledReportView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        return Response({'message': 'Scheduled report created'})


class ScheduledReportDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        return Response({'id': pk, 'message': 'Scheduled report detail'})


class ToggleScheduledReportView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        return Response({'message': 'Scheduled report toggled', 'id': pk})


class QuickExportAttendanceView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        return Response({'message': 'Attendance exported'})


class QuickExportStudentsView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        return Response({'message': 'Students exported'})


class ExportAttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format):
        course_id = request.query_params.get('course_id')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        if not course_id:
            return Response({'error': 'course_id is required'}, status=400)

        try:
            if format == 'csv':
                content = generate_attendance_csv(course_id, date_from, date_to)
                response = HttpResponse(content, content_type='text/csv')
                response['Content-Disposition'] = f'attachment; filename="attendance_{course_id}.csv"'
                return response
            
            elif format == 'excel':
                content = generate_attendance_excel(course_id, date_from, date_to)
                response = HttpResponse(content, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                response['Content-Disposition'] = f'attachment; filename="attendance_{course_id}.xlsx"'
                return response
            
            elif format == 'pdf':
                content = generate_attendance_pdf(course_id, date_from, date_to)
                response = HttpResponse(content, content_type='application/pdf')
                response['Content-Disposition'] = f'attachment; filename="attendance_{course_id}.pdf"'
                return response
            
            else:
                return Response({'error': 'Invalid format'}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
