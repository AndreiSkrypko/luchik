from rest_framework import serializers

from .models import SchulteTableLevel


class SchulteTableLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchulteTableLevel
        fields = [
            'id',
            'title',
            'grid_size',
            'numbers_layout',
            'time_limit_seconds',
            'order',
            'is_active',
        ]

