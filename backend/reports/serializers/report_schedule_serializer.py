from rest_framework import serializers
from reports.models.report_schedule import ReportSchedule


class ReportScheduleSerializer(serializers.ModelSerializer):
    recipients = serializers.ListField(child=serializers.EmailField(), write_only=True, required=False)
    recipients_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ReportSchedule
        fields = ['id', 'report_title', 'report_type', 'frequency', 'next_run', 'recipients', 'recipients_display', 'format', 'status', 'created_at', 'created_by']
        read_only_fields = ['id', 'status', 'created_at', 'created_by']

    def get_recipients_display(self, obj):
        return obj.get_recipients_list()

    def create(self, validated_data):
        recipients = validated_data.pop('recipients', None)
        if recipients is not None:
            validated_data['recipients'] = ','.join(recipients)
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        return super().create(validated_data)
