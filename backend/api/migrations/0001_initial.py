from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Contact',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('address', models.CharField(max_length=300, verbose_name='Адрес')),
                ('phone', models.CharField(max_length=20, verbose_name='Телефон')),
                ('email', models.EmailField(max_length=254, verbose_name='Email')),
                ('working_hours', models.CharField(max_length=200, verbose_name='Часы работы')),
            ],
            options={
                'verbose_name': 'Контакт',
                'verbose_name_plural': 'Контакты',
            },
        ),
        migrations.CreateModel(
            name='Course',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200, verbose_name='Название курса')),
                ('description', models.TextField(verbose_name='Описание')),
                ('age_from', models.IntegerField(verbose_name='Возраст от')),
                ('age_to', models.IntegerField(verbose_name='Возраст до')),
                ('duration', models.CharField(max_length=100, verbose_name='Длительность')),
                ('price', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Цена')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Курс',
                'verbose_name_plural': 'Курсы',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Trainer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.SlugField(max_length=120, unique=True, verbose_name='Идентификатор')),
                ('title', models.CharField(max_length=200, verbose_name='Название тренажера')),
                ('lead', models.TextField(verbose_name='Краткое описание')),
                ('image', models.CharField(max_length=255, verbose_name='Путь к изображению')),
                ('external_url', models.URLField(verbose_name='Ссылка на тренажер')),
                ('program', models.CharField(default='Скорочтение', help_text='Например, «Скорочтение» или «Ментальная арифметика»', max_length=120, verbose_name='Направление/программа')),
                ('accent_color', models.CharField(default='#f6b93b', help_text='HEX значение для оформления карточки', max_length=9, verbose_name='Акцентный цвет')),
                ('position', models.PositiveIntegerField(default=0, verbose_name='Порядок отображения')),
                ('is_active', models.BooleanField(default=True, verbose_name='Активен')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Тренажер',
                'verbose_name_plural': 'Тренажеры',
                'ordering': ['program', 'position', 'title'],
            },
        ),
        migrations.CreateModel(
            name='TrainerDifficulty',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=150, verbose_name='Название уровня')),
                ('word_count', models.PositiveIntegerField(verbose_name='Количество слов')),
                ('sample_text', models.TextField(verbose_name='Пример текста')),
                ('order', models.PositiveIntegerField(default=0, verbose_name='Порядок отображения')),
                ('is_active', models.BooleanField(default=True, verbose_name='Активен')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('trainer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='difficulties', to='api.trainer', verbose_name='Тренажер')),
            ],
            options={
                'verbose_name': 'Сложность тренажера',
                'verbose_name_plural': 'Сложности тренажеров',
                'ordering': ['trainer', 'order', 'title'],
            },
        ),
    ]

