from rest_framework import serializers
from .models import Course, Contact, Trainer, TrainerDifficulty


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'age_from', 'age_to', 'duration', 'price', 'created_at']


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'address', 'phone', 'email', 'working_hours']


class TrainerDifficultySerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainerDifficulty
        fields = ['id', 'title', 'word_count', 'sample_text', 'order', 'is_active']


class TrainerSerializer(serializers.ModelSerializer):
    difficulties = TrainerDifficultySerializer(many=True, read_only=True)

    class Meta:
        model = Trainer
        extra_kwargs = {
            'external_url': {'allow_blank': True, 'allow_null': True, 'required': False},
        }
        fields = [
            'id',
            'slug',
            'title',
            'lead',
            'image',
            'external_url',
            'program',
            'accent_color',
            'position',
            'is_active',
            'difficulties',
        ]

