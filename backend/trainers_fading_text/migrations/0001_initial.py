from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('trainers', '0001_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.CreateModel(
                    name='FadingTextLevel',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('title', models.CharField(max_length=150, verbose_name='Название уровня')),
                        ('word_count', models.PositiveIntegerField(verbose_name='Количество слов')),
                        ('sample_text', models.TextField(verbose_name='Пример текста')),
                        ('order', models.PositiveIntegerField(default=0, verbose_name='Порядок отображения')),
                        ('is_active', models.BooleanField(default=True, verbose_name='Активен')),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        ('updated_at', models.DateTimeField(auto_now=True)),
                        ('trainer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='fading_levels', to='trainers.trainer', verbose_name='Тренажер')),
                    ],
                    options={
                        'verbose_name': 'Уровень «Исчезающий текст»',
                        'verbose_name_plural': 'Уровни «Исчезающий текст»',
                        'ordering': ['trainer', 'order', 'title'],
                        'db_table': 'api_trainerdifficulty',
                    },
                ),
            ],
            database_operations=[],
        ),
    ]

