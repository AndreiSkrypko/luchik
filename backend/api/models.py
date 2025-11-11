from django.db import models


class Course(models.Model):
    """Модель курса для детского центра"""
    title = models.CharField(max_length=200, verbose_name="Название курса")
    description = models.TextField(verbose_name="Описание")
    age_from = models.IntegerField(verbose_name="Возраст от")
    age_to = models.IntegerField(verbose_name="Возраст до")
    duration = models.CharField(max_length=100, verbose_name="Длительность")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Курс"
        verbose_name_plural = "Курсы"
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Contact(models.Model):
    """Модель контактной информации"""
    address = models.CharField(max_length=300, verbose_name="Адрес")
    phone = models.CharField(max_length=20, verbose_name="Телефон")
    email = models.EmailField(verbose_name="Email")
    working_hours = models.CharField(max_length=200, verbose_name="Часы работы")

    class Meta:
        verbose_name = "Контакт"
        verbose_name_plural = "Контакты"

    def __str__(self):
        return f"Контакты - {self.address}"


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
        help_text="Оставьте пустым, если тренажер открывается на этом сайте"
    )
    program = models.CharField(
        max_length=120,
        verbose_name="Направление/программа",
        default="Скорочтение",
        help_text="Например, «Скорочтение» или «Ментальная арифметика»"
    )
    accent_color = models.CharField(
        max_length=9,
        verbose_name="Акцентный цвет",
        default="#f6b93b",
        help_text="HEX значение для оформления карточки"
    )
    position = models.PositiveIntegerField(default=0, verbose_name="Порядок отображения")
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Тренажер"
        verbose_name_plural = "Тренажеры"
        ordering = ["program", "position", "title"]

    def __str__(self):
        return self.title


class TrainerDifficulty(models.Model):
    """Уровни сложности для тренажеров"""
    trainer = models.ForeignKey(
        Trainer,
        on_delete=models.CASCADE,
        related_name="difficulties",
        verbose_name="Тренажер"
    )
    title = models.CharField(max_length=150, verbose_name="Название уровня")
    word_count = models.PositiveIntegerField(verbose_name="Количество слов")
    sample_text = models.TextField(verbose_name="Пример текста")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок отображения")
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Сложность тренажера"
        verbose_name_plural = "Сложности тренажеров"
        ordering = ["trainer", "order", "title"]

    def __str__(self):
        return f"{self.trainer.title} — {self.title}"
