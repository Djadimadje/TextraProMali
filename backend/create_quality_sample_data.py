#!/usr/bin/env python
"""
Create sample quality check data for TexPro AI
"""
import os
import sys
import django
from datetime import datetime, timedelta
import random

# Setup Django
sys.path.append('/c/portfolio/TextProBah/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from quality.models import QualityCheck, QualityStandard, QualityMetrics
from workflow.models import BatchWorkflow
from users.models import User

def create_sample_quality_data():
    print("Creating sample quality check data...")
    
    # Get available batches and inspectors
    batches = list(BatchWorkflow.objects.all())
    inspectors = list(User.objects.filter(role='inspector'))
    
    if not batches:
        print("No batches found. Please create batch workflows first.")
        return
    
    if not inspectors:
        print("No inspectors found. Please create inspector users first.")
        return
    
    print(f"Found {len(batches)} batches and {len(inspectors)} inspectors")
    
    # Defect types from the model
    defect_types = [
        'stain', 'tear', 'weave_error', 'color_variation', 
        'thread_break', 'contamination', 'sizing_issue', 'density_variation'
    ]
    
    # Create quality checks
    quality_checks = []
    
    for i, batch in enumerate(batches):
        # Create 2-4 quality checks per batch
        num_checks = random.randint(2, 4)
        
        for j in range(num_checks):
            inspector = random.choice(inspectors)
            
            # 70% chance of no defects, 30% chance of defects
            defect_detected = random.random() < 0.3
            
            defect_type = None
            severity = 'low'
            status = 'approved'
            
            if defect_detected:
                defect_type = random.choice(defect_types)
                severity = random.choices(['low', 'medium', 'high'], weights=[60, 30, 10])[0]
                # Higher chance of rejection for high severity defects
                if severity == 'high':
                    status = random.choices(['approved', 'rejected', 'pending'], weights=[20, 60, 20])[0]
                elif severity == 'medium':
                    status = random.choices(['approved', 'rejected', 'pending'], weights=[50, 30, 20])[0]
                else:
                    status = random.choices(['approved', 'rejected', 'pending'], weights=[80, 10, 10])[0]
            
            # Generate AI analysis result if applicable
            ai_analysis_result = None
            ai_confidence_score = None
            
            if random.random() < 0.8:  # 80% have AI analysis
                ai_confidence_score = random.uniform(0.65, 0.95)
                ai_analysis_result = {
                    'defect_detected': defect_detected,
                    'confidence': ai_confidence_score,
                    'predicted_defect_type': defect_type if defect_detected else None,
                    'analysis_timestamp': datetime.now().isoformat(),
                    'model_version': 'v1.2.3'
                }
            
            # Create the quality check
            quality_check = QualityCheck(
                batch=batch,
                inspector=inspector,
                # Note: We'll skip the image field for now as it requires actual files
                defect_detected=defect_detected,
                defect_type=defect_type,
                severity=severity,
                comments=f"Quality inspection #{j+1} for batch {batch.batch_code}. " + 
                        (f"Defect found: {defect_type}" if defect_detected else "No defects detected."),
                status=status,
                ai_analysis_requested=True,
                ai_analysis_result=ai_analysis_result,
                ai_confidence_score=ai_confidence_score,
            )
            
            # Set created_at to simulate checks over the last week
            days_ago = random.randint(0, 7)
            hours_ago = random.randint(0, 23)
            quality_check.created_at = datetime.now() - timedelta(days=days_ago, hours=hours_ago)
            
            quality_checks.append(quality_check)
    
    # Bulk create quality checks
    QualityCheck.objects.bulk_create(quality_checks)
    print(f"Created {len(quality_checks)} quality checks")
    
    # Create quality standards for different product types
    print("Creating quality standards...")
    
    product_standards = [
        {
            'product_type': 'cotton_fabric',
            'max_defects_per_batch': 3,
            'critical_defect_tolerance': 0,
            'quality_threshold': 0.95,
            'thread_count_min': 200,
            'thread_count_max': 400,
            'weight_tolerance': 0.05,
            'color_fastness_grade': '4-5'
        },
        {
            'product_type': 'cotton_yarn',
            'max_defects_per_batch': 2,
            'critical_defect_tolerance': 0,
            'quality_threshold': 0.98,
            'thread_count_min': None,
            'thread_count_max': None,
            'weight_tolerance': 0.03,
            'color_fastness_grade': '4'
        },
        {
            'product_type': 'blended_fabric',
            'max_defects_per_batch': 4,
            'critical_defect_tolerance': 1,
            'quality_threshold': 0.92,
            'thread_count_min': 150,
            'thread_count_max': 350,
            'weight_tolerance': 0.07,
            'color_fastness_grade': '3-4'
        }
    ]
    
    for standard_data in product_standards:
        standard, created = QualityStandard.objects.get_or_create(
            product_type=standard_data['product_type'],
            defaults=standard_data
        )
        if created:
            print(f"Created quality standard for {standard_data['product_type']}")
    
    # Generate quality metrics for the last 7 days
    print("Generating quality metrics...")
    
    for days_ago in range(7):
        target_date = (datetime.now() - timedelta(days=days_ago)).date()
        
        # Get quality checks for this date
        day_checks = QualityCheck.objects.filter(created_at__date=target_date)
        total_checks = day_checks.count()
        
        if total_checks > 0:
            defects_found = day_checks.filter(defect_detected=True).count()
            approved = day_checks.filter(status='approved').count()
            rejected = day_checks.filter(status='rejected').count()
            
            defect_rate = (defects_found / total_checks * 100)
            approval_rate = (approved / total_checks * 100)
            
            # Simple quality score calculation
            base_score = 1.0
            defect_penalty = defect_rate / 100 * 0.7
            quality_score = max(0.0, base_score - defect_penalty)
            
            metrics, created = QualityMetrics.objects.get_or_create(
                date=target_date,
                defaults={
                    'total_checks': total_checks,
                    'defects_found': defects_found,
                    'batches_approved': approved,
                    'batches_rejected': rejected,
                    'overall_quality_score': quality_score,
                    'defect_rate': defect_rate,
                    'approval_rate': approval_rate,
                    'ai_accuracy': random.uniform(0.85, 0.95)  # Simulated AI accuracy
                }
            )
            
            if created:
                print(f"Created metrics for {target_date}: {total_checks} checks, {defect_rate:.1f}% defect rate")
    
    print("\n=== Sample Quality Data Created Successfully ===")
    print(f"Quality Checks: {QualityCheck.objects.count()}")
    print(f"Quality Standards: {QualityStandard.objects.count()}")
    print(f"Quality Metrics: {QualityMetrics.objects.count()}")
    
    # Print some statistics
    total_checks = QualityCheck.objects.count()
    defects = QualityCheck.objects.filter(defect_detected=True).count()
    print(f"Overall defect rate: {(defects/total_checks*100):.1f}%")

if __name__ == '__main__':
    create_sample_quality_data()
