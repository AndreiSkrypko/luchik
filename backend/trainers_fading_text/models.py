from django.db import models

from trainers.models import Trainer


class FadingTextLevel(models.Model):
    """Уровни сложности для тренажера «Исчезающий текст»."""

    trainer = models.ForeignKey(
        Trainer,
        on_delete=models.CASCADE,
        related_name="fading_levels",
        verbose_name="Тренажер",
    )
    title = models.CharField(max_length=150, verbose_name="Название уровня")
    word_count = models.PositiveIntegerField(verbose_name="Количество слов")
    sample_text = models.TextField(verbose_name="Пример текста")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок отображения")
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Уровень «Исчезающий текст»"
        verbose_name_plural = "Уровни «Исчезающий текст»"
        ordering = ["trainer", "order", "title"]
        db_table = "api_trainerdifficulty"

    def __str__(self) -> str:
        return f"{self.trainer.title} — {self.title}"
