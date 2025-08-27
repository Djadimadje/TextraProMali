"""
Quality Analysis Services for TexPro AI
AI-powered textile defect detection and quality assessment
"""

import os
import logging
from typing import Dict, Any, Optional
from PIL import Image
import json
from django.conf import settings

logger = logging.getLogger(__name__)


def analyze_quality_image(image_path: str) -> Dict[str, Any]:
    """
    Analyze textile quality from uploaded image
    
    MVP Implementation: Returns placeholder response
    Future: Will integrate ML model for defect detection
    
    Args:
        image_path (str): Path to the uploaded image file
        
    Returns:
        Dict containing analysis results
    """
    
    try:
        # Validate image exists and is readable
        if not os.path.exists(image_path):
            return {
                "status": "error",
                "message": f"Image file not found: {image_path}",
                "defect_detected": False,
                "confidence": 0.0
            }
        
        # Basic image validation
        try:
            with Image.open(image_path) as img:
                width, height = img.size
                format_type = img.format
                
                # Log basic image info
                logger.info(f"Processing image: {width}x{height}, format: {format_type}")
                
        except Exception as e:
            logger.error(f"Invalid image file: {e}")
            return {
                "status": "error", 
                "message": f"Invalid image format: {str(e)}",
                "defect_detected": False,
                "confidence": 0.0
            }
        
        # MVP: Return placeholder response
        # TODO: Replace with actual ML model integration
        
        analysis_result = {
            "status": "pending",
            "message": "AI model not integrated yet - manual inspection required",
            "defect_detected": None,  # Will be determined by inspector
            "confidence": 0.0,
            "image_info": {
                "width": width,
                "height": height,
                "format": format_type,
                "file_size": os.path.getsize(image_path)
            },
            "preprocessing": {
                "resized": False,
                "enhanced": False,
                "normalized": False
            },
            "future_features": {
                "defect_types": ["stain", "tear", "weave_error", "color_variation"],
                "severity_levels": ["low", "medium", "high"],
                "model_version": "v1.0-planned",
                "training_data": "Mali textile samples - planned"
            }
        }
        
        logger.info(f"AI analysis placeholder executed for: {image_path}")
        return analysis_result
        
    except Exception as e:
        logger.error(f"Error in AI analysis: {str(e)}")
        return {
            "status": "error",
            "message": f"Analysis failed: {str(e)}",
            "defect_detected": False,
            "confidence": 0.0
        }


def preprocess_image_for_ai(image_path: str) -> Optional[str]:
    """
    Preprocess image for AI analysis
    
    Future implementation will include:
    - Resize to model input dimensions
    - Normalize color values
    - Enhance contrast
    - Remove noise
    
    Args:
        image_path (str): Path to original image
        
    Returns:
        str: Path to preprocessed image, or None if failed
    """
    
    try:
        # MVP: Just validate the image is readable
        with Image.open(image_path) as img:
            # Future: Apply preprocessing transformations
            logger.info(f"Image preprocessing placeholder for: {image_path}")
            return image_path  # Return original for now
            
    except Exception as e:
        logger.error(f"Image preprocessing failed: {e}")
        return None


def calculate_batch_quality_score(batch_id: str) -> Dict[str, Any]:
    """
    Calculate overall quality score for a batch based on all quality checks
    
    Args:
        batch_id (str): UUID of the batch to analyze
        
    Returns:
        Dict containing quality metrics
    """
    
    from quality.models import QualityCheck
    
    try:
        # Get all quality checks for this batch
        checks = QualityCheck.objects.filter(batch_id=batch_id)
        
        if not checks.exists():
            return {
                "status": "no_data",
                "message": "No quality checks found for this batch",
                "score": 0.0,
                "total_checks": 0
            }
        
        total_checks = checks.count()
        defect_checks = checks.filter(defect_detected=True).count()
        high_severity = checks.filter(severity='high').count()
        medium_severity = checks.filter(severity='medium').count()
        
        # Simple scoring algorithm (can be enhanced)
        base_score = 1.0
        
        # Deduct points for defects
        defect_penalty = (defect_checks / total_checks) * 0.5
        
        # Additional penalty for high severity defects
        severity_penalty = (high_severity * 0.3) + (medium_severity * 0.1)
        severity_penalty = min(severity_penalty, 0.4)  # Cap at 40%
        
        final_score = max(0.0, base_score - defect_penalty - severity_penalty)
        
        # Determine grade
        if final_score >= 0.95:
            grade = "A+"
        elif final_score >= 0.90:
            grade = "A"
        elif final_score >= 0.85:
            grade = "B+"
        elif final_score >= 0.80:
            grade = "B"
        elif final_score >= 0.70:
            grade = "C"
        else:
            grade = "F"
        
        return {
            "status": "calculated",
            "score": round(final_score, 3),
            "grade": grade,
            "total_checks": total_checks,
            "defects_found": defect_checks,
            "defect_rate": round((defect_checks / total_checks) * 100, 1),
            "severity_breakdown": {
                "high": high_severity,
                "medium": medium_severity,
                "low": defect_checks - high_severity - medium_severity
            },
            "recommendations": _get_quality_recommendations(final_score, defect_checks, high_severity)
        }
        
    except Exception as e:
        logger.error(f"Quality score calculation failed: {e}")
        return {
            "status": "error",
            "message": f"Calculation failed: {str(e)}",
            "score": 0.0
        }


def _get_quality_recommendations(score: float, defects: int, high_severity: int) -> list:
    """Generate quality improvement recommendations"""
    
    recommendations = []
    
    if score < 0.70:
        recommendations.append("🚨 Critical: Immediate process review required")
        recommendations.append("📋 Conduct full quality audit of production line")
    
    if high_severity > 0:
        recommendations.append("⚠️ High-severity defects detected - investigate root cause")
        recommendations.append("🔧 Check machine calibration and maintenance status")
    
    if defects > 5:
        recommendations.append("📊 High defect rate - review quality control procedures")
        recommendations.append("👥 Additional inspector training may be required")
    
    if score >= 0.95:
        recommendations.append("✨ Excellent quality - maintain current standards")
        recommendations.append("📈 Consider this batch as quality benchmark")
    
    if not recommendations:
        recommendations.append("✅ Good quality - continue current procedures")
    
    return recommendations


def generate_quality_report(batch_id: str, include_images: bool = False) -> Dict[str, Any]:
    """
    Generate comprehensive quality report for a batch
    
    Args:
        batch_id (str): UUID of the batch
        include_images (bool): Whether to include image analysis details
        
    Returns:
        Dict containing complete quality report
    """
    
    from quality.models import QualityCheck
    from workflow.models import BatchWorkflow
    
    try:
        # Get batch information
        batch = BatchWorkflow.objects.get(id=batch_id)
        checks = QualityCheck.objects.filter(batch_id=batch_id).order_by('-created_at')
        
        # Calculate quality score
        quality_metrics = calculate_batch_quality_score(batch_id)
        
        # Compile report
        report = {
            "batch_info": {
                "batch_code": batch.batch_code,
                "product_type": batch.product_type,
                "current_stage": batch.current_stage,
                "created_date": batch.created_at.isoformat(),
            },
            "quality_summary": quality_metrics,
            "inspection_details": {
                "total_inspections": checks.count(),
                "inspectors": list(checks.values_list('inspector__username', flat=True).distinct()),
                "date_range": {
                    "first_check": checks.last().created_at.isoformat() if checks.exists() else None,
                    "latest_check": checks.first().created_at.isoformat() if checks.exists() else None,
                }
            },
            "defect_analysis": _analyze_defect_patterns(checks),
            "recommendations": quality_metrics.get('recommendations', []),
            "generated_at": logger._get_current_timestamp() if hasattr(logger, '_get_current_timestamp') else "2025-08-21T00:00:00Z"
        }
        
        if include_images:
            report["image_details"] = [
                {
                    "id": str(check.id),
                    "image_url": check.image.url if check.image else None,
                    "defect_detected": check.defect_detected,
                    "defect_type": check.defect_type,
                    "severity": check.severity,
                    "ai_confidence": check.ai_confidence_score
                }
                for check in checks
            ]
        
        return report
        
    except Exception as e:
        logger.error(f"Quality report generation failed: {e}")
        return {
            "status": "error",
            "message": f"Report generation failed: {str(e)}"
        }


def _analyze_defect_patterns(checks) -> Dict[str, Any]:
    """Analyze patterns in defect data"""
    
    defect_types = {}
    severity_distribution = {"low": 0, "medium": 0, "high": 0}
    
    for check in checks.filter(defect_detected=True):
        # Count defect types
        if check.defect_type:
            defect_types[check.defect_type] = defect_types.get(check.defect_type, 0) + 1
        
        # Count severity distribution
        severity_distribution[check.severity] += 1
    
    return {
        "defect_types": defect_types,
        "severity_distribution": severity_distribution,
        "most_common_defect": max(defect_types.items(), key=lambda x: x[1])[0] if defect_types else None,
        "critical_issues": severity_distribution["high"] > 0
    }
