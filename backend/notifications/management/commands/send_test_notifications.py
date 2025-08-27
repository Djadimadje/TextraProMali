"""
Management command to send test notifications
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from notifications.services import NotificationService

User = get_user_model()


class Command(BaseCommand):
    help = 'Send test notifications to verify the system is working'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--user',
            type=str,
            help='Username to send notification to',
        )
        parser.add_argument(
            '--all-users',
            action='store_true',
            help='Send to all active users',
        )
        parser.add_argument(
            '--priority',
            type=str,
            choices=['low', 'normal', 'high', 'critical'],
            default='normal',
            help='Notification priority',
        )
        parser.add_argument(
            '--type',
            type=str,
            choices=['workflow', 'machine', 'maintenance', 'quality', 'allocation', 'system'],
            default='system',
            help='Notification type',
        )
    
    def handle(self, *args, **options):
        self.stdout.write('🔔 Sending test notifications...')
        
        # Determine recipients
        if options['all_users']:
            users = User.objects.filter(is_active=True)
            self.stdout.write(f'Sending to all {users.count()} active users')
        elif options['user']:
            try:
                users = [User.objects.get(username=options['user'])]
                self.stdout.write(f'Sending to user: {options["user"]}')
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'User "{options["user"]}" not found')
                )
                return
        else:
            # Default to first 3 users
            users = User.objects.filter(is_active=True)[:3]
            self.stdout.write(f'Sending to first {users.count()} users')
        
        # Create test notifications
        created_count = 0
        for user in users:
            notification = NotificationService.create_notification(
                recipient=user,
                title=f"TexPro AI Test Notification ({options['priority'].title()})",
                message=(
                    f"This is a test notification for the TexPro AI system. "
                    f"Notification type: {options['type'].title()}, "
                    f"Priority: {options['priority'].title()}. "
                    f"The notification system is working correctly!"
                ),
                notification_type=options['type'],
                priority=options['priority']
            )
            
            if notification:
                created_count += 1
                self.stdout.write(
                    f'  ✅ Created notification for {user.username}'
                )
            else:
                self.stdout.write(
                    f'  ❌ Failed to create notification for {user.username}'
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Successfully created {created_count} test notifications!'
            )
        )
