from django.contrib import admin
from django.db import models
from .models import Course, Contact, Trainer, TrainerDifficulty


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'age_from', 'age_to', 'price', 'created_at']
    list_filter = ['age_from', 'age_to']
    search_fields = ['title', 'description']


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['address', 'phone', 'email']


class TrainerDifficultyInline(admin.TabularInline):
    model = TrainerDifficulty
    extra = 1
    fields = ['title', 'sample_text', 'word_count', 'order', 'is_active']
    formfield_overrides = {
        models.TextField: {'widget': admin.widgets.AdminTextareaWidget(attrs={'rows': 3})}
    }


@admin.register(Trainer)
class TrainerAdmin(admin.ModelAdmin):
    list_display = ['title', 'program', 'position', 'is_active', 'updated_at']
    list_filter = ['program', 'is_active']
    search_fields = ['title', 'lead', 'slug']
    ordering = ['program', 'position']
    prepopulated_fields = {"slug": ("title",)}
    inlines = [TrainerDifficultyInline]


@admin.register(TrainerDifficulty)
class TrainerDifficultyAdmin(admin.ModelAdmin):
    list_display = ['title', 'trainer', 'word_count', 'order', 'is_active']
    list_filter = ['trainer', 'is_active']
    search_fields = ['title', 'sample_text']
    ordering = ['trainer', 'order']

