from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_alter_trainer_external_url'),
        ('trainers', '0001_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.DeleteModel(name='TrainerDifficulty'),
                migrations.DeleteModel(name='Trainer'),
            ],
            database_operations=[],
        ),
    ]

