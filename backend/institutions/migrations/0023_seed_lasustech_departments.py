from django.db import migrations


def seed_lasustech_departments(apps, schema_editor):
    Institution = apps.get_model('institutions', 'Institution')
    College = apps.get_model('institutions', 'College')
    Department = apps.get_model('institutions', 'Department')

    try:
        institution = Institution.objects.get(id=1)
    except Institution.DoesNotExist:
        return

    departments_by_college_code = {
        'CBS': [
            {'name': 'Biochemistry', 'code': 'BCM', 'abbreviation': 'BCM'},
            {'name': 'Botany', 'code': 'BOT', 'abbreviation': 'BOT'},
            {'name': 'Chemistry', 'code': 'CHM', 'abbreviation': 'CHM'},
            {'name': 'Computer Science', 'code': 'CS', 'abbreviation': 'CS'},
            {'name': 'Industrial Chemistry', 'code': 'INDCHM', 'abbreviation': 'INDCHM'},
            {'name': 'Industrial Mathematics', 'code': 'INDMTH', 'abbreviation': 'INDMTH'},
            {'name': 'Mathematics', 'code': 'MTH', 'abbreviation': 'MTH'},
            {'name': 'Microbiology', 'code': 'MCB', 'abbreviation': 'MCB'},
            {'name': 'Physics With Electronics', 'code': 'PWE', 'abbreviation': 'PWE'},
            {'name': 'Statistics', 'code': 'STAT', 'abbreviation': 'STAT'},
            {'name': 'Zoology', 'code': 'ZOO', 'abbreviation': 'ZOO'},
        ],
        'COET': [
            {'name': 'Agricultural and Biosystems Engineering', 'code': 'ABE', 'abbreviation': 'ABE'},
            {'name': 'Chemical Engineering', 'code': 'CHE', 'abbreviation': 'CHE'},
            {'name': 'Civil and Construction Engineering', 'code': 'CCE', 'abbreviation': 'CCE'},
            {'name': 'Computer Engineering', 'code': 'CSE', 'abbreviation': 'CSE'},
            {'name': 'Electrical and Electronics Engineering', 'code': 'ELECTENG', 'abbreviation': 'ELECTENG'},
            {'name': 'Food Science and Technology', 'code': 'FST', 'abbreviation': 'FST'},
            {'name': 'Mechanical Engineering', 'code': 'MCHENG', 'abbreviation': 'MCHENG'},
            {'name': 'Mechatronics', 'code': 'MCHTRN', 'abbreviation': 'MCHTRN'},
        ],
        'CASS': [
            {'name': 'Accounting', 'code': 'ACCT', 'abbreviation': 'ACCT'},
            {'name': 'Actuarial Science', 'code': 'ASC', 'abbreviation': 'ASC'},
            {'name': 'Banking and Finance', 'code': 'BKF', 'abbreviation': 'BKF'},
            {'name': 'Business Administration', 'code': 'BUSADMIN', 'abbreviation': 'BUSADMIN'},
            {'name': 'Economics', 'code': 'ECONS', 'abbreviation': 'ECONS'},
            {'name': 'Insurance', 'code': 'INS', 'abbreviation': 'INS'},
            {'name': 'Marketing', 'code': 'MKT', 'abbreviation': 'MKT'},
            {'name': 'Mass Communication', 'code': 'MCM', 'abbreviation': 'MCM'},
            {'name': 'Office and Information Management', 'code': 'OIM', 'abbreviation': 'OIM'},
            {'name': 'Tourism and Hospitality Management', 'code': 'THM', 'abbreviation': 'THM'},
        ],
        'CEDT': [
            {'name': 'Architecture', 'code': 'ARC', 'abbreviation': 'ARC'},
            {'name': 'Art and Industrial Design', 'code': 'FAA', 'abbreviation': 'FAA'},
            {'name': 'Estate Management and Valuation', 'code': 'EMV', 'abbreviation': 'EMV'},
            {'name': 'Quantity Surveying', 'code': 'QSV', 'abbreviation': 'QSV'},
            {'name': 'Urban and Regional Planning', 'code': 'URP', 'abbreviation': 'URP'},
        ],
        'COA': [
            {'name': 'Agricultural Extension and Rural Development', 'code': 'AERD', 'abbreviation': 'AERD'},
            {'name': 'Agriculture Economics and Farm Management', 'code': 'AEFM', 'abbreviation': 'AEFM'},
            {'name': 'Animal Science', 'code': 'ASC', 'abbreviation': 'ASC'},
            {'name': 'Aquaculture and Fisheries Management', 'code': 'AFM', 'abbreviation': 'AFM'},
            {'name': 'Crop Science', 'code': 'CPS', 'abbreviation': 'CPS'},
            {'name': 'Horticulture and Landscape Management', 'code': 'HLM', 'abbreviation': 'HLM'},
        ],
    }

    colleges = {
        college.code: college
        for college in College.objects.filter(
            institution=institution,
            code__in=list(departments_by_college_code.keys()),
        )
    }

    for college_code, departments in departments_by_college_code.items():
        college = colleges.get(college_code)
        if not college:
            continue

        for department_data in departments:
            Department.objects.get_or_create(
                college=college,
                code=department_data['code'],
                defaults={
                    'institution': institution,
                    'name': department_data['name'],
                    'abbreviation': department_data['abbreviation'],
                    'is_active': True,
                },
            )


class Migration(migrations.Migration):

    dependencies = [
        ('institutions', '0022_seed_lasustech_colleges'),
    ]

    operations = [
        migrations.RunPython(seed_lasustech_departments, migrations.RunPython.noop),
    ]
