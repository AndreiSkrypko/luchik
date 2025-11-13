from django.db import models

from trainers.models import Trainer


class FlashCardDeck(models.Model):
    trainer = models.ForeignKey(
        Trainer,
        on_delete=models.CASCADE,
        related_name="flashcard_decks",
        verbose_name="Тренажер",
    )
    slug = models.SlugField(max_length=120, unique=True, verbose_name="Слаг")
    title = models.CharField(max_length=200, verbose_name="Название набора")
    description = models.TextField(blank=True, verbose_name="Описание")
    accent_color = models.CharField(
        max_length=9,
        blank=True,
        verbose_name="Цвет акцента",
        help_text="HEX-цвет для оформления карточек",
    )
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок отображения")
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создано")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Обновлено")

    class Meta:
        verbose_name = "Набор флеш-карт"
        verbose_name_plural = "Наборы флеш-карт"
        ordering = ["order", "title"]
        db_table = "flash_cards_deck"

    def __str__(self) -> str:
        return self.title


class FlashCard(models.Model):
    deck = models.ForeignKey(
        FlashCardDeck,
        on_delete=models.CASCADE,
        related_name="cards",
        verbose_name="Набор",
    )
    front_text = models.TextField(verbose_name="Текст лицевой стороны")
    back_text = models.TextField(verbose_name="Ответ / оборот")
    hint = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Подсказка",
        help_text="Короткий намёк, который поможет вспомнить ответ",
    )
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок отображения")
    is_active = models.BooleanField(default=True, verbose_name="Активна")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создано")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Обновлено")

    class Meta:
        verbose_name = "Флеш-карта"
        verbose_name_plural = "Флеш-карты"
        ordering = ["deck", "order", "id"]
        db_table = "flash_cards_card"

    def __str__(self) -> str:
        return f"{self.front_text[:48]}..." if len(self.front_text) > 48 else self.front_text
