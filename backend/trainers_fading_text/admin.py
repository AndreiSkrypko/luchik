from django.contrib import admin

from .models import FadingTextLevel


@admin.register(FadingTextLevel)
class FadingTextLevelAdmin(admin.ModelAdmin):
    list_display = ['title', 'trainer', 'word_count', 'order', 'is_active']
    list_filter = ['trainer', 'is_active']
    search_fields = ['title', 'sample_text', 'trainer__title']
    ordering = ['trainer', 'order', 'title']
