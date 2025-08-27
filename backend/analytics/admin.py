"""
Django admin configuration for analytics app

Currently no models are registered as the analytics app
aggregates data from other apps without storing its own data.

Future admin configurations can be added here when analytics
models are implemented (e.g., cached metrics, snapshots).
"""

from django.contrib import admin

# No models to register currently
# Analytics are computed in real-time from other apps' data
