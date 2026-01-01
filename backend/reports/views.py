from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


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
