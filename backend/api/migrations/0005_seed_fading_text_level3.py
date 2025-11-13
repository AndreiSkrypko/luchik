from django.db import migrations


TEXT_12_WORDS = 'У осы усы. У сома усы. У Ромы шар. У Муры шары.'


def add_fading_text_level_three(apps, schema_editor):
    Trainer = apps.get_model('api', 'Trainer')
    TrainerDifficulty = apps.get_model('api', 'TrainerDifficulty')

    try:
        trainer = Trainer.objects.get(slug='fading-text')
    except Trainer.DoesNotExist:
        return

    TrainerDifficulty.objects.update_or_create(
        trainer=trainer,
        order=3,
        defaults={
            'title': '12 слов',
            'word_count': 12,
            'sample_text': TEXT_12_WORDS,
            'is_active': True,
        }
    )


def remove_fading_text_level_three(apps, schema_editor):
    TrainerDifficulty = apps.get_model('api', 'TrainerDifficulty')
    TrainerDifficulty.objects.filter(trainer__slug='fading-text', word_count=12).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_clear_placeholder_links'),
    ]

    operations = [
        migrations.RunPython(add_fading_text_level_three, remove_fading_text_level_three),
    ]

