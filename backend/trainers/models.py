from django.db import models


class Trainer(models.Model):
    """Модель тренажера"""

    slug = models.SlugField(max_length=120, unique=True, verbose_name="Идентификатор")
    title = models.CharField(max_length=200, verbose_name="Название тренажера")
    lead = models.TextField(verbose_name="Краткое описание")
    image = models.CharField(max_length=255, verbose_name="Путь к изображению")
    external_url = models.URLField(
        verbose_name="Ссылка на тренажер",
        blank=True,
        null=True,
        help_text="Оставьте пустым, если тренажер открывается на этом сайте",
    )
    program = models.CharField(
        max_length=120,
        verbose_name="Направление/программа",
        default="Скорочтение",
        help_text="Например, «Скорочтение» или «Ментальная арифметика»",
    )
    accent_color = models.CharField(
        max_length=9,
        verbose_name="Акцентный цвет",
        default="#f6b93b",
        help_text="HEX значение для оформления карточки",
    )
    position = models.PositiveIntegerField(default=0, verbose_name="Порядок отображения")
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Тренажер"
        verbose_name_plural = "Тренажеры"
        ordering = ["program", "position", "title"]
        db_table = "api_trainer"

    def __str__(self) -> str:
        return self.title
