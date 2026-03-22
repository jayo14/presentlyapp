from django.db import migrations


def seed_lasustech_colleges(apps, schema_editor):
    Institution = apps.get_model('institutions', 'Institution')
    College = apps.get_model('institutions', 'College')

    try:
        institution = Institution.objects.get(id=1)
    except Institution.DoesNotExist:
        return

    colleges = [
        {'name': 'College of Agriculture', 'code': 'COA', 'abbreviation': 'COA'},
        {'name': 'College of Applied Social Sciences', 'code': 'CASS', 'abbreviation': 'CASS'},
        {'name': 'College of Basic Science', 'code': 'CBS', 'abbreviation': 'CBS'},
        {'name': 'College of Engineering and Technology', 'code': 'COET', 'abbreviation': 'COET'},
        {'name': 'College of Environmental Design and Technology', 'code': 'CEDT', 'abbreviation': 'CEDT'},
    ]

    for college_data in colleges:
        College.objects.get_or_create(
            institution=institution,
            code=college_data['code'],
            defaults={
                'name': college_data['name'],
                'abbreviation': college_data['abbreviation'],
                'is_active': True,
            },
        )


class Migration(migrations.Migration):

    dependencies = [
        ('institutions', '0021_add_gps_validation_fields_to_session'),
    ]

    operations = [
        migrations.RunPython(seed_lasustech_colleges, migrations.RunPython.noop),
    ]
