from django.contrib import admin
from .models import Course, Contact


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'age_from', 'age_to', 'price', 'created_at']
    list_filter = ['age_from', 'age_to']
    search_fields = ['title', 'description']


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['address', 'phone', 'email']

