"""
Migration for ReportSchedule model
"""
from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ReportSchedule',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('report_title', models.CharField(max_length=255)),
                ('report_type', models.CharField(choices=[('production', 'Production'), ('quality', 'Quality'), ('performance', 'Performance'), ('cost', 'Cost'), ('safety', 'Safety'), ('custom', 'Custom')], default='production', max_length=32)),
                ('frequency', models.CharField(choices=[('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly'), ('quarterly', 'Quarterly'), ('on_demand', 'On demand')], default='weekly', max_length=32)),
                ('next_run', models.DateTimeField()),
                ('recipients', models.TextField(blank=True, help_text='Comma separated recipient emails')),
                ('format', models.CharField(default='pdf', max_length=16)),
                ('status', models.CharField(choices=[('active', 'Active'), ('paused', 'Paused'), ('failed', 'Failed')], default='active', max_length=16)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={'db_table': 'reports_schedule', 'ordering': ['-created_at']},
        ),
    ]
