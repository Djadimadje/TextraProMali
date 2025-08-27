"""
Analytics app models for TexPro AI

This app primarily aggregates data from other apps and doesn't require
its own database models. All analytics are computed in real-time from
existing data in workflow, machines, maintenance, quality, and allocation apps.

If caching or historical analytics storage is needed in the future,
models can be added here for:
- AnalyticsSnapshot (for historical KPI storage)
- CachedMetrics (for performance optimization)
- CustomReport (for saved report configurations)
"""

# No models are currently needed for the analytics app
# All data is aggregated from other apps in real-time
