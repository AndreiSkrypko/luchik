from django.db import migrations


TEXT_11_WORDS = 'У Шуры кошка. Кошка Мурка. У Шуры молоко. На Мурку молока!'


def add_fading_text_level_two(apps, schema_editor):
    Trainer = apps.get_model('api', 'Trainer')
    TrainerDifficulty = apps.get_model('api', 'TrainerDifficulty')

    try:
        trainer = Trainer.objects.get(slug='fading-text')
    except Trainer.DoesNotExist:
        return

    TrainerDifficulty.objects.update_or_create(
        trainer=trainer,
        order=2,
        defaults={
            'title': '11 слов',
            'word_count': 11,
            'sample_text': TEXT_11_WORDS,
            'is_active': True,
        }
    )


def remove_fading_text_level_two(apps, schema_editor):
    TrainerDifficulty = apps.get_model('api', 'TrainerDifficulty')
    TrainerDifficulty.objects.filter(trainer__slug='fading-text', word_count=11).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_seed_fading_text'),
    ]

    operations = [
        migrations.RunPython(add_fading_text_level_two, remove_fading_text_level_two),
    ]

