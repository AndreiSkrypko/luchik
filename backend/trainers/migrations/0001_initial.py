from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('api', '0006_seed_fading_text_levels'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.CreateModel(
                    name='Trainer',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('slug', models.SlugField(max_length=120, unique=True, verbose_name='Идентификатор')),
                        ('title', models.CharField(max_length=200, verbose_name='Название тренажера')),
                        ('lead', models.TextField(verbose_name='Краткое описание')),
                        ('image', models.CharField(max_length=255, verbose_name='Путь к изображению')),
                        ('external_url', models.URLField(blank=True, help_text='Оставьте пустым, если тренажер открывается на этом сайте', null=True, verbose_name='Ссылка на тренажер')),
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
                        'db_table': 'api_trainer',
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
                        ('trainer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='difficulties', to='trainers.trainer', verbose_name='Тренажер')),
                    ],
                    options={
                        'verbose_name': 'Сложность тренажера',
                        'verbose_name_plural': 'Сложности тренажеров',
                        'ordering': ['trainer', 'order', 'title'],
                        'db_table': 'api_trainerdifficulty',
                    },
                ),
            ],
            database_operations=[],
        ),
    ]

