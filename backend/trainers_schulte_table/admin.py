from django.contrib import admin

from .models import SchulteTableLevel


@admin.register(SchulteTableLevel)
class SchulteTableLevelAdmin(admin.ModelAdmin):
    list_display = ['title', 'trainer', 'grid_size', 'order', 'is_active']
    list_filter = ['trainer', 'grid_size', 'is_active']
    search_fields = ['title', 'trainer__title']
    ordering = ['trainer', 'order', 'grid_size']
