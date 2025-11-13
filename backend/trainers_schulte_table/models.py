from django.db import models

from trainers.models import Trainer


class SchulteTableLevel(models.Model):
    """Конфигурация уровня для тренажера «Таблица Шульте»."""

    trainer = models.ForeignKey(
        Trainer,
        on_delete=models.CASCADE,
        related_name='schulte_levels',
        verbose_name='Тренажер',
    )
    title = models.CharField(max_length=150, verbose_name='Название уровня')
    grid_size = models.PositiveIntegerField(verbose_name='Размер сетки')
    numbers_layout = models.JSONField(verbose_name='Последовательность чисел')
    time_limit_seconds = models.PositiveIntegerField(
        verbose_name='Рекомендованное время, сек',
        blank=True,
        null=True,
    )
    order = models.PositiveIntegerField(default=0, verbose_name='Порядок отображения')
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Уровень «Таблица Шульте»'
        verbose_name_plural = 'Уровни «Таблица Шульте»'
        ordering = ['trainer', 'order', 'grid_size']

    def __str__(self) -> str:
        return f'{self.trainer.title} — {self.title}'
