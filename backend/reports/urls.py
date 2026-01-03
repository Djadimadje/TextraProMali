"""
Reports app URLs - Report generation and export
TexPro AI - Textile Manufacturing Optimization System
"""

from django.urls import path
from reports.views import (
    # Workflow reports
    WorkflowReportPDFView, WorkflowReportExcelView,
    # Machine reports
    MachineReportPDFView, MachineReportExcelView,
    # Maintenance reports
    MaintenanceReportPDFView, MaintenanceReportExcelView,
    # Quality reports
    QualityReportPDFView, QualityReportExcelView,
    # Allocation reports
    AllocationReportPDFView, AllocationReportExcelView,
    # Analytics reports
    AnalyticsReportPDFView, AnalyticsReportExcelView,
    # Health check
    ReportsHealthView
)

from reports.user_reports_views import (
    UserDirectoryReportView, RoleDistributionReportView,
    LoginActivityReportView, UserPerformanceReportView,
    UserAuditTrailView
)

from reports.dashboard_views import (
    ReportsDashboardView, ReportsMetaView
)

from reports.views import ReportScheduleCreateView

# URL patterns for reports endpoints
# Note: These will be prefixed with /api/v1/reports/ from core/urls.py
urlpatterns = [
    # Reports Dashboard
    path('dashboard/', ReportsDashboardView.as_view(), name='reports-dashboard'),
    path('meta/', ReportsMetaView.as_view(), name='reports-meta'),
    
    # System Reports (Workflow/Production reports)
    path('workflow/pdf/', WorkflowReportPDFView.as_view(), name='workflow-report-pdf'),
    path('workflow/excel/', WorkflowReportExcelView.as_view(), name='workflow-report-excel'),
    path('production/pdf/', WorkflowReportPDFView.as_view(), name='production-report-pdf'),  # Alias
    path('production/excel/', WorkflowReportExcelView.as_view(), name='production-report-excel'),  # Alias
    
    # Machine reports (Admin, Supervisor)
    path('machines/pdf/', MachineReportPDFView.as_view(), name='machine-report-pdf'),
    path('machines/excel/', MachineReportExcelView.as_view(), name='machine-report-excel'),
    
    # Maintenance reports (Admin, Supervisor)
    path('maintenance/pdf/', MaintenanceReportPDFView.as_view(), name='maintenance-report-pdf'),
    path('maintenance/excel/', MaintenanceReportExcelView.as_view(), name='maintenance-report-excel'),
    
    # Quality reports (Admin only)
    path('quality/pdf/', QualityReportPDFView.as_view(), name='quality-report-pdf'),
    path('quality/excel/', QualityReportExcelView.as_view(), name='quality-report-excel'),
    
    # Allocation reports (Admin only)
    path('allocation/pdf/', AllocationReportPDFView.as_view(), name='allocation-report-pdf'),
    path('allocation/excel/', AllocationReportExcelView.as_view(), name='allocation-report-excel'),
    
    # Analytics reports (Admin, Analyst)
    path('analytics/pdf/', AnalyticsReportPDFView.as_view(), name='analytics-report-pdf'),
    path('analytics/excel/', AnalyticsReportExcelView.as_view(), name='analytics-report-excel'),
    
    # User Reports (Admin only)
    path('users/directory/', UserDirectoryReportView.as_view(), name='user-directory-report'),
    path('users/roles/', RoleDistributionReportView.as_view(), name='role-distribution-report'),
    path('users/activity/', LoginActivityReportView.as_view(), name='login-activity-report'),
    path('users/performance/', UserPerformanceReportView.as_view(), name='user-performance-report'),
    path('users/audit/', UserAuditTrailView.as_view(), name='user-audit-trail'),
    
    # Reports system health check (Admin, Analyst)
    path('health/', ReportsHealthView.as_view(), name='reports-health'),
    # Schedule creation endpoint
    path('schedules/', ReportScheduleCreateView.as_view(), name='reports-schedules'),
]
