"""
Reports services - Part 3: Quality, Allocation, and Analytics generators
Final report generators for complete coverage
"""

from django.http import HttpResponse
from reportlab.platypus import Table, TableStyle, Paragraph
from reportlab.lib import colors
from .services import (
    create_pdf_base, create_excel_base,
    apply_quality_filters, apply_allocation_filters
)


def generate_quality_pdf(request):
    """Generate quality checks PDF report"""
    try:
        from quality.models import QualityCheck
        
        # Apply filters
        queryset = apply_quality_filters(QualityCheck.objects.all(), request)
        
        # Create PDF
        buffer, doc, story, styles = create_pdf_base(
            "Quality Checks Report",
            f"Total Quality Checks: {queryset.count()}"
        )
        
        # Prepare data
        data = [['Batch', 'Inspector', 'Status', 'Score', 'Check Date', 'Defects']]
        
        for check in queryset[:100]:
            data.append([
                str(check.batch) if check.batch else 'N/A',
                str(check.inspector) if check.inspector else 'N/A',
                check.get_status_display() if hasattr(check, 'get_status_display') else check.status,
                f"{check.quality_score:.1f}" if check.quality_score else 'N/A',
                check.check_date.strftime('%Y-%m-%d') if check.check_date else 'N/A',
                check.defects[:50] + '...' if check.defects and len(check.defects) > 50 else (check.defects or 'None')
            ])
        
        # Create table
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.purple),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lavender),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(table)
        doc.build(story)
        
        # Return response
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="quality_report.pdf"'
        return response
        
    except Exception as e:
        return HttpResponse(f"Error generating PDF: {str(e)}", status=500)


def generate_quality_excel(request):
    """Generate quality checks Excel report"""
    try:
        from quality.models import QualityCheck
        
        # Apply filters
        queryset = apply_quality_filters(QualityCheck.objects.all(), request)
        
        # Create Excel
        wb, ws, header_font, header_fill = create_excel_base("Quality Checks")
        
        # Headers
        headers = ['Batch', 'Inspector', 'Status', 'Quality Score', 'Check Date', 'Defects', 'Notes']
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=4, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
        
        # Data
        for row, check in enumerate(queryset[:1000], 5):
            ws.cell(row=row, column=1, value=str(check.batch) if check.batch else 'N/A')
            ws.cell(row=row, column=2, value=str(check.inspector) if check.inspector else 'N/A')
            ws.cell(row=row, column=3, value=check.status or 'N/A')
            ws.cell(row=row, column=4, value=float(check.quality_score) if check.quality_score else 0)
            ws.cell(row=row, column=5, value=check.check_date.strftime('%Y-%m-%d') if check.check_date else 'N/A')
            ws.cell(row=row, column=6, value=check.defects or 'None')
            ws.cell(row=row, column=7, value=check.notes or 'N/A')
        
        # Save to response
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="quality_report.xlsx"'
        wb.save(response)
        return response
        
    except Exception as e:
        return HttpResponse(f"Error generating Excel: {str(e)}", status=500)


def generate_allocation_pdf(request):
    """Generate allocation report PDF"""
    try:
        from allocation.models import WorkforceAllocation, MaterialAllocation
        
        # Apply filters to both querysets
        workforce_queryset = apply_allocation_filters(WorkforceAllocation.objects.all(), request, 'workforce')
        material_queryset = apply_allocation_filters(MaterialAllocation.objects.all(), request, 'material')
        
        # Create PDF
        buffer, doc, story, styles = create_pdf_base(
            "Resource Allocation Report",
            f"Workforce: {workforce_queryset.count()}, Materials: {material_queryset.count()}"
        )
        
        # Workforce allocation table
        story.append(Paragraph("Workforce Allocations", styles['Heading2']))
        workforce_data = [['Batch', 'Worker', 'Role', 'Start Date', 'End Date']]
        
        for allocation in workforce_queryset[:50]:
            workforce_data.append([
                str(allocation.batch) if allocation.batch else 'N/A',
                str(allocation.user) if allocation.user else 'N/A',
                allocation.get_role_assigned_display() if hasattr(allocation, 'get_role_assigned_display') else allocation.role_assigned,
                allocation.start_date.strftime('%Y-%m-%d') if allocation.start_date else 'N/A',
                allocation.end_date.strftime('%Y-%m-%d') if allocation.end_date else 'N/A'
            ])
        
        workforce_table = Table(workforce_data)
        workforce_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.orange),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightyellow),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(workforce_table)
        story.append(Paragraph("<br/><br/>", styles['Normal']))
        
        # Material allocation table
        story.append(Paragraph("Material Allocations", styles['Heading2']))
        material_data = [['Batch', 'Material', 'Quantity', 'Unit', 'Cost (XOF)', 'Supplier']]
        
        for allocation in material_queryset[:50]:
            material_data.append([
                str(allocation.batch) if allocation.batch else 'N/A',
                allocation.material_name or 'N/A',
                str(allocation.quantity) if allocation.quantity else '0',
                allocation.get_unit_display() if hasattr(allocation, 'get_unit_display') else allocation.unit,
                f"{allocation.total_cost:,.0f}" if allocation.total_cost else '0',
                allocation.supplier or 'N/A'
            ])
        
        material_table = Table(material_data)
        material_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.brown),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.tan),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(material_table)
        doc.build(story)
        
        # Return response
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="allocation_report.pdf"'
        return response
        
    except Exception as e:
        return HttpResponse(f"Error generating PDF: {str(e)}", status=500)


def generate_allocation_excel(request):
    """Generate allocation Excel report"""
    try:
        from allocation.models import WorkforceAllocation, MaterialAllocation
        
        # Create Excel with multiple sheets
        wb, ws, header_font, header_fill = create_excel_base("Resource Allocation")
        
        # Workforce sheet
        ws.title = "Workforce"
        workforce_queryset = apply_allocation_filters(WorkforceAllocation.objects.all(), request, 'workforce')
        
        headers = ['Batch', 'Worker', 'Role', 'Start Date', 'End Date', 'Duration (Days)']
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=4, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
        
        for row, allocation in enumerate(workforce_queryset[:1000], 5):
            ws.cell(row=row, column=1, value=str(allocation.batch) if allocation.batch else 'N/A')
            ws.cell(row=row, column=2, value=str(allocation.user) if allocation.user else 'N/A')
            ws.cell(row=row, column=3, value=allocation.role_assigned or 'N/A')
            ws.cell(row=row, column=4, value=allocation.start_date.strftime('%Y-%m-%d') if allocation.start_date else 'N/A')
            ws.cell(row=row, column=5, value=allocation.end_date.strftime('%Y-%m-%d') if allocation.end_date else 'N/A')
            
            # Calculate duration
            if allocation.start_date and allocation.end_date:
                duration = (allocation.end_date - allocation.start_date).days
                ws.cell(row=row, column=6, value=duration)
            else:
                ws.cell(row=row, column=6, value='N/A')
        
        # Material sheet
        ws2 = wb.create_sheet("Materials")
        material_queryset = apply_allocation_filters(MaterialAllocation.objects.all(), request, 'material')
        
        # Headers for material sheet
        ws2['A1'] = "TexPro AI - Material Allocation"
        ws2['A2'] = f"Generated: {wb.worksheets[0]['A2'].value}"
        
        material_headers = ['Batch', 'Material', 'Quantity', 'Unit', 'Cost per Unit', 'Total Cost (XOF)', 'Supplier']
        for col, header in enumerate(material_headers, 1):
            cell = ws2.cell(row=4, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
        
        for row, allocation in enumerate(material_queryset[:1000], 5):
            ws2.cell(row=row, column=1, value=str(allocation.batch) if allocation.batch else 'N/A')
            ws2.cell(row=row, column=2, value=allocation.material_name or 'N/A')
            ws2.cell(row=row, column=3, value=float(allocation.quantity) if allocation.quantity else 0)
            ws2.cell(row=row, column=4, value=allocation.unit or 'N/A')
            ws2.cell(row=row, column=5, value=float(allocation.cost_per_unit) if allocation.cost_per_unit else 0)
            ws2.cell(row=row, column=6, value=float(allocation.total_cost) if allocation.total_cost else 0)
            ws2.cell(row=row, column=7, value=allocation.supplier or 'N/A')
        
        # Save to response
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="allocation_report.xlsx"'
        wb.save(response)
        return response
        
    except Exception as e:
        return HttpResponse(f"Error generating Excel: {str(e)}", status=500)


def generate_analytics_pdf(request):
    """Generate analytics KPIs PDF report"""
    try:
        from analytics.services import get_dashboard_summary
        
        # Get analytics data
        dashboard_data = get_dashboard_summary()
        
        # Create PDF
        buffer, doc, story, styles = create_pdf_base(
            "Analytics KPIs Report",
            "System Performance Summary"
        )
        
        # Summary data
        summary = dashboard_data.get('summary', {})
        data = [
            ['Metric', 'Value'],
            ['Total Batches', str(summary.get('total_batches', 0))],
            ['Operational Machines', str(summary.get('operational_machines', 0))],
            ['Quality Approval Rate', f"{summary.get('quality_approval_rate', 0)}%"],
            ['Active Workforce', str(summary.get('active_workforce', 0))],
            ['Overdue Maintenance', str(summary.get('overdue_maintenance', 0))]
        ]
        
        # Create table
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.navy),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightsteelblue),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(table)
        doc.build(story)
        
        # Return response
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="analytics_report.pdf"'
        return response
        
    except Exception as e:
        return HttpResponse(f"Error generating PDF: {str(e)}", status=500)


def generate_analytics_excel(request):
    """Generate analytics KPIs Excel report"""
    try:
        from analytics.services import get_dashboard_summary
        
        # Get analytics data
        dashboard_data = get_dashboard_summary()
        
        # Create Excel
        wb, ws, header_font, header_fill = create_excel_base("Analytics KPIs")
        
        # Summary headers
        headers = ['Metric', 'Value', 'Description']
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=4, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
        
        # Summary data
        summary = dashboard_data.get('summary', {})
        metrics = [
            ('Total Batches', summary.get('total_batches', 0), 'Number of production batches'),
            ('Operational Machines', summary.get('operational_machines', 0), 'Machines currently operational'),
            ('Quality Approval Rate', f"{summary.get('quality_approval_rate', 0)}%", 'Percentage of approved quality checks'),
            ('Active Workforce', summary.get('active_workforce', 0), 'Currently allocated workers'),
            ('Overdue Maintenance', summary.get('overdue_maintenance', 0), 'Maintenance tasks past due date')
        ]
        
        for row, (metric, value, description) in enumerate(metrics, 5):
            ws.cell(row=row, column=1, value=metric)
            ws.cell(row=row, column=2, value=str(value))
            ws.cell(row=row, column=3, value=description)
        
        # Save to response
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="analytics_report.xlsx"'
        wb.save(response)
        return response
        
    except Exception as e:
        return HttpResponse(f"Error generating Excel: {str(e)}", status=500)
