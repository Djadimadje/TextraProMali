"""
Reports app views for TexPro AI
PDF and Excel export endpoints with comprehensive filtering
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
import logging
import traceback

from reports.permissions import (
    WorkflowReportsPermission, MachineReportsPermission,
    MaintenanceReportsPermission, QualityReportsPermission,
    AllocationReportsPermission, AnalyticsReportsPermission
)

from reports.report_generators import (
    generate_workflow_pdf, generate_workflow_excel,
    generate_machine_pdf, generate_machine_excel,
    generate_maintenance_pdf, generate_maintenance_excel
)

from reports.advanced_generators import (
    generate_quality_pdf, generate_quality_excel,
    generate_allocation_pdf, generate_allocation_excel,
    generate_analytics_pdf, generate_analytics_excel
)


class WorkflowReportPDFView(APIView):
    """
    Workflow batches PDF export
    GET /api/v1/reports/workflow/pdf/
    
    Query Parameters:
    - start_date: Filter from date (YYYY-MM-DD)
    - end_date: Filter to date (YYYY-MM-DD)
    - date_range: Predefined range (last_7_days, last_30_days, last_quarter)
    - status: Filter by batch status
    - product_type: Filter by product type
    - batch_number: Filter by batch number (partial match)
    """
    
    permission_classes = [WorkflowReportsPermission]
    
    def get(self, request):
        """Generate workflow PDF report"""
        try:
            return generate_workflow_pdf(request)
        except Exception as e:
            logging.exception('Workflow PDF generation failed')
            logging.error(traceback.format_exc())
            return Response({
                'error': f'Failed to generate workflow PDF report: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WorkflowReportExcelView(APIView):
    """
    Workflow batches Excel export
    GET /api/v1/reports/workflow/excel/
    """
    
    permission_classes = [WorkflowReportsPermission]
    
    def get(self, request):
        """Generate workflow Excel report"""
        try:
            return generate_workflow_excel(request)
        except Exception as e:
            logging.exception('Workflow Excel generation failed')
            logging.error(traceback.format_exc())
            return Response({
                'error': f'Failed to generate workflow Excel report: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MachineReportPDFView(APIView):
    """
    Machine status PDF export
    GET /api/v1/reports/machines/pdf/
    
    Query Parameters:
    - status: Filter by machine status
    - machine_type: Filter by machine type
    - location: Filter by location (partial match)
    """
    
    permission_classes = [MachineReportsPermission]
    
    def get(self, request):
        """Generate machine PDF report"""
        try:
            return generate_machine_pdf(request)
        except Exception as e:
            logging.exception('Machine PDF generation failed')
            logging.error(traceback.format_exc())
            return Response({
                'error': f'Failed to generate machine PDF report: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MachineReportExcelView(APIView):
    """
    Machine status Excel export
    GET /api/v1/reports/machines/excel/
    """
    
    permission_classes = [MachineReportsPermission]
    
    def get(self, request):
        """Generate machine Excel report"""
        try:
            return generate_machine_excel(request)
        except Exception as e:
            logging.exception('Machine Excel generation failed')
            logging.error(traceback.format_exc())
            return Response({
                'error': f'Failed to generate machine Excel report: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MaintenanceReportPDFView(APIView):
    """
    Maintenance logs PDF export
    GET /api/v1/reports/maintenance/pdf/
    
    Query Parameters:
    - start_date: Filter from date (YYYY-MM-DD)
    - end_date: Filter to date (YYYY-MM-DD)
    - date_range: Predefined range (last_7_days, last_30_days, last_quarter)
    - priority: Filter by maintenance priority
    - status: Filter by maintenance status
    - maintenance_type: Filter by maintenance type
    """
    
    permission_classes = [MaintenanceReportsPermission]
    
    def get(self, request):
        """Generate maintenance PDF report"""
        try:
            return generate_maintenance_pdf(request)
        except Exception as e:
            logging.exception('Maintenance PDF generation failed')
            logging.error(traceback.format_exc())
            return Response({
                'error': f'Failed to generate maintenance PDF report: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MaintenanceReportExcelView(APIView):
    """
    Maintenance logs Excel export
    GET /api/v1/reports/maintenance/excel/
    """
    
    permission_classes = [MaintenanceReportsPermission]
    
    def get(self, request):
        """Generate maintenance Excel report"""
        try:
            return generate_maintenance_excel(request)
        except Exception as e:
            logging.exception('Maintenance Excel generation failed')
            logging.error(traceback.format_exc())
            return Response({
                'error': f'Failed to generate maintenance Excel report: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class QualityReportPDFView(APIView):
    """
    Quality checks PDF export
    GET /api/v1/reports/quality/pdf/
    
    Query Parameters:
    - start_date: Filter from date (YYYY-MM-DD)
    - end_date: Filter to date (YYYY-MM-DD)
    - date_range: Predefined range (last_7_days, last_30_days, last_quarter)
    - status: Filter by quality check status
    - inspector: Filter by inspector username
    - defect_type: Filter by defect type (partial match)
    """
    
    permission_classes = [QualityReportsPermission]
    
    def get(self, request):
        """Generate quality PDF report"""
        try:
            return generate_quality_pdf(request)
        except Exception as e:
            logging.exception('Quality PDF generation failed')
            logging.error(traceback.format_exc())
            return Response({
                'error': f'Failed to generate quality PDF report: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class QualityReportExcelView(APIView):
    """
    Quality checks Excel export
    GET /api/v1/reports/quality/excel/
    """
    
    permission_classes = [QualityReportsPermission]
    
    def get(self, request):
        """Generate quality Excel report"""
        try:
            return generate_quality_excel(request)
        except Exception as e:
            logging.exception('Quality Excel generation failed')
            logging.error(traceback.format_exc())
            return Response({
                'error': f'Failed to generate quality Excel report: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AllocationReportPDFView(APIView):
    """
    Resource allocation PDF export
    GET /api/v1/reports/allocation/pdf/
    
    Query Parameters:
    - start_date: Filter from date (YYYY-MM-DD)
    - end_date: Filter to date (YYYY-MM-DD)
    - date_range: Predefined range (last_7_days, last_30_days, last_quarter)
    - role: Filter workforce by role
    - material_type: Filter materials by type (partial match)
    - batch: Filter by batch number (partial match)
    """
    
    permission_classes = [AllocationReportsPermission]
    
    def get(self, request):
        """Generate allocation PDF report"""
        try:
            return generate_allocation_pdf(request)
        except Exception as e:
            logging.exception('Allocation PDF generation failed')
            logging.error(traceback.format_exc())
            return Response({
                'error': f'Failed to generate allocation PDF report: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AllocationReportExcelView(APIView):
    """
    Resource allocation Excel export
    GET /api/v1/reports/allocation/excel/
    """
    
    permission_classes = [AllocationReportsPermission]
    
    def get(self, request):
        """Generate allocation Excel report"""
        try:
            return generate_allocation_excel(request)
        except Exception as e:
            logging.exception('Allocation Excel generation failed')
            logging.error(traceback.format_exc())
            return Response({
                'error': f'Failed to generate allocation Excel report: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AnalyticsReportPDFView(APIView):
    """
    Analytics KPIs PDF export
    GET /api/v1/reports/analytics/pdf/
    """
    
    permission_classes = [AnalyticsReportsPermission]
    
    def get(self, request):
        """Generate analytics PDF report"""
        try:
            return generate_analytics_pdf(request)
        except Exception as e:
            logging.exception('Analytics PDF generation failed')
            logging.error(traceback.format_exc())
            return Response({
                'error': f'Failed to generate analytics PDF report: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AnalyticsReportExcelView(APIView):
    """
    Analytics KPIs Excel export
    GET /api/v1/reports/analytics/excel/
    """
    
    permission_classes = [AnalyticsReportsPermission]
    
    def get(self, request):
        """Generate analytics Excel report"""
        try:
            return generate_analytics_excel(request)
        except Exception as e:
            logging.exception('Analytics Excel generation failed')
            logging.error(traceback.format_exc())
            return Response({
                'error': f'Failed to generate analytics Excel report: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReportsHealthView(APIView):
    """
    Reports system health check
    GET /api/v1/reports/health/
    """
    
    permission_classes = [AnalyticsReportsPermission]  # Admin/Analyst only
    
    def get(self, request):
        """Check reports system health"""
        try:
            health_status = {
                'reports_service': 'operational',
                'pdf_generation': 'available',
                'excel_generation': 'available',
                'filtering_system': 'operational',
                'data_sources': {}
            }
            
            # Test data source availability
            try:
                from workflow.models import BatchWorkflow
                health_status['data_sources']['workflow'] = BatchWorkflow.objects.count()
            except Exception:
                health_status['data_sources']['workflow'] = 'unavailable'
            
            try:
                from machines.models import Machine
                health_status['data_sources']['machines'] = Machine.objects.count()
            except Exception:
                health_status['data_sources']['machines'] = 'unavailable'
            
            try:
                from maintenance.models import MaintenanceLog
                health_status['data_sources']['maintenance'] = MaintenanceLog.objects.count()
            except Exception:
                health_status['data_sources']['maintenance'] = 'unavailable'
            
            try:
                from quality.models import QualityCheck
                health_status['data_sources']['quality'] = QualityCheck.objects.count()
            except Exception:
                health_status['data_sources']['quality'] = 'unavailable'
            
            try:
                from allocation.models import WorkforceAllocation, MaterialAllocation
                health_status['data_sources']['allocation'] = {
                    'workforce': WorkforceAllocation.objects.count(),
                    'material': MaterialAllocation.objects.count()
                }
            except Exception:
                health_status['data_sources']['allocation'] = 'unavailable'
            
            return Response({
                'success': True,
                'data': health_status,
                'message': 'Reports system health check completed'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logging.exception('Reports health check failed')
            logging.error(traceback.format_exc())
            return Response({
                'success': False,
                'error': f'Health check failed: {str(e)}',
                'data': {'reports_service': 'error'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
