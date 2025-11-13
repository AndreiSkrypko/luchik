from django.contrib import admin
from django.db import models

from .models import Trainer
from trainers_fading_text.models import FadingTextLevel
from trainers_schulte_table.models import SchulteTableLevel


class FadingTextLevelInline(admin.TabularInline):
    model = FadingTextLevel
    extra = 1
    fields = ['title', 'sample_text', 'word_count', 'order', 'is_active']
    formfield_overrides = {
        models.TextField: {'widget': admin.widgets.AdminTextareaWidget(attrs={'rows': 3})}
    }


class SchulteTableLevelInline(admin.TabularInline):
    model = SchulteTableLevel
    extra = 1
    fields = ['title', 'grid_size', 'numbers_layout', 'time_limit_seconds', 'order', 'is_active']


@admin.register(Trainer)
class TrainerAdmin(admin.ModelAdmin):
    list_display = ['title', 'program', 'position', 'is_active', 'updated_at']
    list_filter = ['program', 'is_active']
    search_fields = ['title', 'lead', 'slug']
    ordering = ['program', 'position']
    prepopulated_fields = {"slug": ("title",)}
    inlines = [FadingTextLevelInline, SchulteTableLevelInline]
