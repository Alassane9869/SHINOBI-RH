from django.db import migrations

def transform_superuser(apps, schema_editor):
    """
    Trouve tous les superusers existants et les transforme en OWNER.
    """
    User = apps.get_model('accounts', 'CustomUser')
    # On met à jour tous les superusers pour avoir le rôle 'owner'
    User.objects.filter(is_superuser=True).update(role='owner')

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_alter_customuser_role'),
    ]

    operations = [
        migrations.RunPython(transform_superuser),
    ]
