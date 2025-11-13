from django.db import migrations


TEXT_10_WORDS = 'У Зины санки. У Зины зайка. На санках спит зайка.'


def add_fading_text_trainer(apps, schema_editor):
    Trainer = apps.get_model('api', 'Trainer')
    TrainerDifficulty = apps.get_model('api', 'TrainerDifficulty')

    trainer, _ = Trainer.objects.update_or_create(
        slug='fading-text',
        defaults={
            'title': 'Тренажер «Исчезающий текст»',
            'lead': (
                'Ребёнок должен успеть прочитать фразу до того, как она исчезнет. '
                'Укрепляет внимательность и ускоряет восприятие текста.'
            ),
            'image': '/images/trainers/speed-reading/fading-text.svg',
            'external_url': 'https://example.com/trainers/fading-text',
            'program': 'Скорочтение',
            'accent_color': '#5c78d6',
            'position': 1,
            'is_active': True,
        }
    )

    TrainerDifficulty.objects.update_or_create(
        trainer=trainer,
        order=1,
        defaults={
            'title': '10 слов',
            'word_count': 10,
            'sample_text': TEXT_10_WORDS,
            'is_active': True,
        }
    )


def remove_fading_text_trainer(apps, schema_editor):
    Trainer = apps.get_model('api', 'Trainer')
    TrainerDifficulty = apps.get_model('api', 'TrainerDifficulty')

    TrainerDifficulty.objects.filter(trainer__slug='fading-text').delete()
    Trainer.objects.filter(slug='fading-text').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_fading_text_trainer, remove_fading_text_trainer),
    ]

