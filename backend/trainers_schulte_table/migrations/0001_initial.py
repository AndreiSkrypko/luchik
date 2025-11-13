from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('trainers', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SchulteTableLevel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=150, verbose_name='Название уровня')),
                ('grid_size', models.PositiveIntegerField(verbose_name='Размер сетки')),
                ('numbers_layout', models.JSONField(verbose_name='Последовательность чисел')),
                ('time_limit_seconds', models.PositiveIntegerField(blank=True, null=True, verbose_name='Рекомендованное время, сек')),
                ('order', models.PositiveIntegerField(default=0, verbose_name='Порядок отображения')),
                ('is_active', models.BooleanField(default=True, verbose_name='Активен')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('trainer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='schulte_levels', to='trainers.trainer', verbose_name='Тренажер')),
            ],
            options={
                'verbose_name': 'Уровень «Таблица Шульте»',
                'verbose_name_plural': 'Уровни «Таблица Шульте»',
                'ordering': ['trainer', 'order', 'grid_size'],
            },
        ),
    ]

