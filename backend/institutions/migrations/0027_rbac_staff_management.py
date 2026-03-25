from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('institutions', '0026_ensure_department_fk'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='invited_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='invited_users', to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='RBACPermission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('codename', models.CharField(max_length=120, unique=True)),
                ('name', models.CharField(max_length=200)),
                ('group', models.CharField(max_length=120)),
                ('description', models.TextField(blank=True)),
                ('is_dangerous', models.BooleanField(default=False)),
                ('enabled_by_default', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'rbac_permissions',
                'ordering': ['group', 'codename'],
            },
        ),
        migrations.CreateModel(
            name='StaffRole',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120, unique=True)),
                ('slug', models.SlugField(max_length=140, unique=True)),
                ('description', models.TextField(blank=True)),
                ('is_system', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'staff_roles',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='StaffInvitation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254)),
                ('full_name', models.CharField(max_length=200)),
                ('custom_permissions', models.JSONField(blank=True, null=True)),
                ('token_hash', models.CharField(max_length=128, unique=True)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('ACCEPTED', 'Accepted'), ('REVOKED', 'Revoked'), ('EXPIRED', 'Expired')], default='PENDING', max_length=20)),
                ('expires_at', models.DateTimeField()),
                ('accepted_at', models.DateTimeField(blank=True, null=True)),
                ('revoked_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('invited_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='staff_invitations_sent', to=settings.AUTH_USER_MODEL)),
                ('invited_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='staff_invitations_received', to=settings.AUTH_USER_MODEL)),
                ('role', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='invitations', to='institutions.staffrole')),
            ],
            options={
                'db_table': 'staff_invitations',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='StaffProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('ACTIVE', 'Active'), ('SUSPENDED', 'Suspended'), ('REVOKED', 'Revoked')], default='PENDING', max_length=20)),
                ('invited_at', models.DateTimeField(blank=True, null=True)),
                ('invitation_accepted_at', models.DateTimeField(blank=True, null=True)),
                ('last_active_at', models.DateTimeField(blank=True, null=True)),
                ('deactivated_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('invited_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='staff_invited_profiles', to=settings.AUTH_USER_MODEL)),
                ('role', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='staff_profiles', to='institutions.staffrole')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='staff_profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'staff_profiles',
            },
        ),
        migrations.CreateModel(
            name='UserPermission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('allowed', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='permission_changes', to=settings.AUTH_USER_MODEL)),
                ('permission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_overrides', to='institutions.rbacpermission')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rbac_user_permissions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'user_permissions',
            },
        ),
        migrations.CreateModel(
            name='RolePermission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('permission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='role_permissions', to='institutions.rbacpermission')),
                ('role', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='role_permissions', to='institutions.staffrole')),
            ],
            options={
                'db_table': 'role_permissions',
            },
        ),
        migrations.AddIndex(
            model_name='rbacpermission',
            index=models.Index(fields=['codename'], name='rbac_permis_codename_4ade64_idx'),
        ),
        migrations.AddIndex(
            model_name='rbacpermission',
            index=models.Index(fields=['group'], name='rbac_permis_group_1323f0_idx'),
        ),
        migrations.AddIndex(
            model_name='staffinvitation',
            index=models.Index(fields=['email'], name='staff_invit_email_a24760_idx'),
        ),
        migrations.AddIndex(
            model_name='staffinvitation',
            index=models.Index(fields=['status'], name='staff_invit_status_9c9e1e_idx'),
        ),
        migrations.AddIndex(
            model_name='staffinvitation',
            index=models.Index(fields=['expires_at'], name='staff_invit_expires_9f1d2f_idx'),
        ),
        migrations.AddIndex(
            model_name='staffprofile',
            index=models.Index(fields=['status'], name='staff_profi_status_0d0ef8_idx'),
        ),
        migrations.AddIndex(
            model_name='staffprofile',
            index=models.Index(fields=['role'], name='staff_profi_role_id_2efba7_idx'),
        ),
        migrations.AddIndex(
            model_name='userpermission',
            index=models.Index(fields=['user'], name='user_permis_user_id_f7a99f_idx'),
        ),
        migrations.AddIndex(
            model_name='userpermission',
            index=models.Index(fields=['permission'], name='user_permis_permiss_7ee1fa_idx'),
        ),
        migrations.AddIndex(
            model_name='userpermission',
            index=models.Index(fields=['allowed'], name='user_permis_allowed_a6d1a0_idx'),
        ),
        migrations.AddIndex(
            model_name='rolepermission',
            index=models.Index(fields=['role'], name='role_permis_role_id_6106c8_idx'),
        ),
        migrations.AddIndex(
            model_name='rolepermission',
            index=models.Index(fields=['permission'], name='role_permis_permiss_2eb13a_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='rolepermission',
            unique_together={('role', 'permission')},
        ),
        migrations.AlterUniqueTogether(
            name='userpermission',
            unique_together={('user', 'permission')},
        ),
    ]
