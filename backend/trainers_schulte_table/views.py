import random

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SchulteTableLevel
from .serializers import SchulteTableLevelSerializer


class SchulteSessionView(APIView):
    """Генерация сессии для тренажера «Таблица Шульте»."""

    def get(self, request):
        size_param = request.query_params.get('size')
        level_id = request.query_params.get('level')

        if level_id:
            try:
                level = SchulteTableLevel.objects.get(pk=level_id, is_active=True)
            except SchulteTableLevel.DoesNotExist:
                return Response({'detail': 'Уровень не найден.'}, status=status.HTTP_404_NOT_FOUND)

            serializer = SchulteTableLevelSerializer(level)
            return Response(serializer.data)

        try:
            size = int(size_param) if size_param is not None else 4
        except ValueError:
            return Response({'detail': 'Размер таблицы должен быть числом.'}, status=status.HTTP_400_BAD_REQUEST)

        if size < 2 or size > 8:
            return Response({'detail': 'Размер таблицы должен быть от 2 до 8.'}, status=status.HTTP_400_BAD_REQUEST)

        numbers = list(range(1, size * size + 1))
        random.shuffle(numbers)

        return Response(
            {
                'grid_size': size,
                'numbers': numbers,
                'time_limit_seconds': None,
            }
        )
