from django.db import migrations


def clear_placeholder_links(apps, schema_editor):
    Trainer = apps.get_model('api', 'Trainer')
    Trainer.objects.filter(
        slug='fading-text',
        external_url__icontains='example.com'
    ).update(external_url='')


def restore_placeholder_links(apps, schema_editor):
    Trainer = apps.get_model('api', 'Trainer')
    Trainer.objects.filter(
        slug='fading-text',
        external_url=''
    ).update(external_url='https://example.com/trainers/fading-text')


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_seed_fading_text_level2'),
    ]

    operations = [
        migrations.RunPython(clear_placeholder_links, restore_placeholder_links),
    ]

