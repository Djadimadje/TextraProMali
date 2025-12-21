"""
Reports services - Part 2: Specific report generators
PDF and Excel generation for each app module
"""

from django.http import HttpResponse
import logging
import traceback
from reportlab.platypus import Table, TableStyle, Paragraph
from reportlab.lib import colors
from .services import (
    create_pdf_base, create_excel_base,
    apply_workflow_filters, apply_machine_filters,
    apply_maintenance_filters, apply_quality_filters,
    apply_allocation_filters
)


def generate_workflow_pdf(request):
    """Generate workflow batches PDF report"""
    try:
        from workflow.models import BatchWorkflow
        
        # Apply filters
        queryset = apply_workflow_filters(BatchWorkflow.objects.all(), request)
        
        # Create PDF
        buffer, doc, story, styles = create_pdf_base(
            "Workflow Batches Report",
            f"Total Batches: {queryset.count()}"
        )
        
        # Prepare data
        data = [['Batch Number', 'Product Type', 'Status', 'Start Date', 'End Date']]
        
        for batch in queryset[:100]:  # Limit for performance
            data.append([
                batch.batch_number or 'N/A',
                batch.get_product_type_display() if hasattr(batch, 'get_product_type_display') else batch.product_type,
                batch.get_status_display() if hasattr(batch, 'get_status_display') else batch.status,
                batch.start_date.strftime('%Y-%m-%d') if batch.start_date else 'N/A',
                batch.end_date.strftime('%Y-%m-%d') if batch.end_date else 'N/A'
            ])
        
        # Create table
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(table)
        doc.build(story)
        
        # Return response
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="workflow_report.pdf"'
        return response
        
    except Exception as e:
        logging.exception('Error in generate_workflow_pdf')
        logging.error(traceback.format_exc())
        return HttpResponse(f"Error generating PDF: {str(e)}", status=500)


def generate_workflow_excel(request):
    """Generate workflow batches Excel report"""
    try:
        from workflow.models import BatchWorkflow
        
        # Apply filters
        queryset = apply_workflow_filters(BatchWorkflow.objects.all(), request)
        
        # Create Excel
        wb, ws, header_font, header_fill = create_excel_base("Workflow Batches")
        
        # Headers
        headers = ['Batch Number', 'Product Type', 'Status', 'Start Date', 'End Date', 'Duration (Days)']
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=4, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
        
        # Data
        for row, batch in enumerate(queryset[:1000], 5):  # Limit for performance
            ws.cell(row=row, column=1, value=batch.batch_number or 'N/A')
            ws.cell(row=row, column=2, value=batch.product_type or 'N/A')
            ws.cell(row=row, column=3, value=batch.status or 'N/A')
            ws.cell(row=row, column=4, value=batch.start_date.strftime('%Y-%m-%d') if batch.start_date else 'N/A')
            ws.cell(row=row, column=5, value=batch.end_date.strftime('%Y-%m-%d') if batch.end_date else 'N/A')
            
            # Calculate duration
            if batch.start_date and batch.end_date:
                duration = (batch.end_date - batch.start_date).days
                ws.cell(row=row, column=6, value=duration)
            else:
                ws.cell(row=row, column=6, value='N/A')
        
        # Save to response
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="workflow_report.xlsx"'
        wb.save(response)
        return response
        
    except Exception as e:
        logging.exception('Error in generate_workflow_excel')
        logging.error(traceback.format_exc())
        return HttpResponse(f"Error generating Excel: {str(e)}", status=500)


def generate_machine_pdf(request):
    """Generate machine status PDF report"""
    try:
        from machines.models import Machine
        
        # Apply filters
        queryset = apply_machine_filters(Machine.objects.all(), request)
        
        # Create PDF
        buffer, doc, story, styles = create_pdf_base(
            "Machine Status Report",
            f"Total Machines: {queryset.count()}"
        )
        
        # Prepare data
        data = [['Machine Name', 'Type', 'Status', 'Location', 'Install Date']]
        
        for machine in queryset[:100]:
            data.append([
                machine.name or 'N/A',
                machine.machine_type or 'N/A',
                machine.get_status_display() if hasattr(machine, 'get_status_display') else machine.status,
                # Machine model uses `building`, `floor`, and `location_details` instead of `location`
                " ".join(filter(None, [getattr(machine, 'building', ''), getattr(machine, 'floor', ''), getattr(machine, 'location_details', '')])) or 'N/A',
                machine.installation_date.strftime('%Y-%m-%d') if hasattr(machine, 'installation_date') and machine.installation_date else 'N/A'
            ])
        
        # Create table
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightblue),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(table)
        doc.build(story)
        
        # Return response
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="machine_report.pdf"'
        return response
        
    except Exception as e:
        logging.exception('Error in generate_machine_pdf')
        logging.error(traceback.format_exc())
        return HttpResponse(f"Error generating PDF: {str(e)}", status=500)


def generate_machine_excel(request):
    """Generate machine status Excel report"""
    try:
        from machines.models import Machine
        
        # Apply filters
        queryset = apply_machine_filters(Machine.objects.all(), request)
        
        # Create Excel
        wb, ws, header_font, header_fill = create_excel_base("Machine Status")
        
        # Headers
        headers = ['Machine Name', 'Type', 'Status', 'Location', 'Install Date', 'Capacity']
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=4, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
        
        # Data
        for row, machine in enumerate(queryset[:1000], 5):
            ws.cell(row=row, column=1, value=machine.name or 'N/A')
            ws.cell(row=row, column=2, value=machine.machine_type or 'N/A')
            ws.cell(row=row, column=3, value=machine.status or 'N/A')
            # Combine building/floor/location_details for location display
            ws.cell(row=row, column=4, value=(" ".join(filter(None, [getattr(machine, 'building', ''), getattr(machine, 'floor', ''), getattr(machine, 'location_details', '')])) or 'N/A'))
            ws.cell(row=row, column=5, value=machine.installation_date.strftime('%Y-%m-%d') if hasattr(machine, 'installation_date') and machine.installation_date else 'N/A')
            ws.cell(row=row, column=6, value=getattr(machine, 'capacity', 'N/A'))
        
        # Save to response
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="machine_report.xlsx"'
        wb.save(response)
        return response
        
    except Exception as e:
        logging.exception('Error in generate_machine_excel')
        logging.error(traceback.format_exc())
        return HttpResponse(f"Error generating Excel: {str(e)}", status=500)


def generate_maintenance_pdf(request):
    """Generate maintenance logs PDF report"""
    try:
        from maintenance.models import MaintenanceLog
        
        # Apply filters
        queryset = apply_maintenance_filters(MaintenanceLog.objects.all(), request)
        
        # Create PDF
        buffer, doc, story, styles = create_pdf_base(
            "Maintenance Logs Report",
            f"Total Logs: {queryset.count()}"
        )
        
        # Prepare data
        data = [['Machine', 'Type', 'Priority', 'Status', 'Start Date', 'Cost (XOF)']]
        
        for log in queryset[:100]:
            data.append([
                str(log.machine) if log.machine else 'N/A',
                # MaintenanceLog does not have `maintenance_type` field in this project.
                # Use `priority` as a substitute for the type/importance of the maintenance.
                (log.get_priority_display() if hasattr(log, 'get_priority_display') else (getattr(log, 'priority', 'N/A'))),
                log.get_priority_display() if hasattr(log, 'get_priority_display') else log.priority,
                log.get_status_display() if hasattr(log, 'get_status_display') else log.status,
                # Use `reported_at` as the start/report date
                (log.reported_at.strftime('%Y-%m-%d') if getattr(log, 'reported_at', None) else 'N/A'),
                f"{log.cost:,.0f}" if log.cost else '0'
            ])
        
        # Create table
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightgreen),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(table)
        doc.build(story)
        
        # Return response
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="maintenance_report.pdf"'
        return response
        
    except Exception as e:
        logging.exception('Error in generate_maintenance_pdf')
        logging.error(traceback.format_exc())
        return HttpResponse(f"Error generating PDF: {str(e)}", status=500)


def generate_maintenance_excel(request):
    """Generate maintenance logs Excel report"""
    try:
        from maintenance.models import MaintenanceLog
        
        # Apply filters
        queryset = apply_maintenance_filters(MaintenanceLog.objects.all(), request)
        
        # Create Excel
        wb, ws, header_font, header_fill = create_excel_base("Maintenance Logs")
        
        # Headers
        headers = ['Machine', 'Type', 'Priority', 'Status', 'Start Date', 'Completion', 'Cost (XOF)', 'Duration (Days)']
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=4, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
        
        # Data
        for row, log in enumerate(queryset[:1000], 5):
            ws.cell(row=row, column=1, value=str(log.machine) if log.machine else 'N/A')
            ws.cell(row=row, column=2, value=log.maintenance_type or 'N/A')
            ws.cell(row=row, column=3, value=log.priority or 'N/A')
            ws.cell(row=row, column=4, value=log.status or 'N/A')
            ws.cell(row=row, column=5, value=log.start_date.strftime('%Y-%m-%d') if log.start_date else 'N/A')
            ws.cell(row=row, column=6, value=log.completion_date.strftime('%Y-%m-%d') if log.completion_date else 'N/A')
            ws.cell(row=row, column=7, value=float(log.cost) if log.cost else 0)
            
            # Calculate duration
            if log.start_date and log.completion_date:
                duration = (log.completion_date - log.start_date).days
                ws.cell(row=row, column=8, value=duration)
            else:
                ws.cell(row=row, column=8, value='N/A')
        
        # Save to response
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="maintenance_report.xlsx"'
        wb.save(response)
        return response
        
    except Exception as e:
        logging.exception('Error in generate_maintenance_excel')
        logging.error(traceback.format_exc())
        return HttpResponse(f"Error generating Excel: {str(e)}", status=500)
