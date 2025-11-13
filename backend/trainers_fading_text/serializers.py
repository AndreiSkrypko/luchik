from rest_framework import serializers

from .models import FadingTextLevel


class FadingTextLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = FadingTextLevel
        fields = ['id', 'title', 'word_count', 'sample_text', 'order', 'is_active']

