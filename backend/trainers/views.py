from rest_framework import viewsets

from .models import Trainer
from .serializers import TrainerSerializer


class TrainerViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для тренажеров и их уровней сложности"""

    queryset = Trainer.objects.filter(is_active=True)
    serializer_class = TrainerSerializer
