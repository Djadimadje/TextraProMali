from rest_framework import serializers
from quality.models import QualityAudit


class QualityAuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = QualityAudit
        fields = ['id', 'audit_type', 'auditor', 'date', 'areas', 'status', 'created_by', 'created_at']
        read_only_fields = ['id', 'created_by', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        return super().create(validated_data)
