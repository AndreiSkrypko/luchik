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


