import os
import json
import psycopg2
from urllib.parse import urlparse

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres.owvqbnnybociimzqkeeh:JzMbQFPUuDJqETCe@aws-1-eu-north-1.pooler.supabase.com:6543/postgres")

model_to_table = {
    'admin.logentry': 'django_admin_log',
    'attendance.attendanceattemptlog': 'attendance_attempt_logs',
    'institutions.college': 'colleges',
    'institutions.department': 'departments',
    'institutions.user': 'users',
    'institutions.attendance': 'attendances',
    'institutions.courseenrollment': 'course_enrollments',
    'blog.tag': 'blog_tag',
    'institutions.staffrole': 'staff_roles',
    'blog.category': 'blog_category',
    'institutions.institution': 'institutions',
    'institutions.emailverificationotp': 'email_verification_otps',
    'institutions.course': 'courses',
    'auth.group': 'auth_group',
    'sessions.session': 'django_session',
    'token_blacklist.outstandingtoken': 'token_blacklist_outstandingtoken',
    'token_blacklist.blacklistedtoken': 'token_blacklist_blacklistedtoken',
    'institutions.attendancesession': 'attendance_sessions',
    'institutions.userpermission': 'user_permissions',
    'institutions.rbacpermission': 'rbac_permissions',
    'institutions.rolepermission': 'role_permissions',
    'institutions.venue': 'venues',
    'institutions.staffprofile': 'staff_profiles',
    'notifications.notification': 'notifications',
    'institutions.staffinvitation': 'staff_invitations',
    'accounts.userdevice': 'user_devices',
    'blog.newslettersubscriber': 'blog_newslettersubscriber',
    'system.featureflag': 'system_featureflag',
    'blog.post': 'blog_post',
    'admin.logentry': 'django_admin_log',
}

requested_tables = [
    'attendances', 'staff_roles', 'attendance_sessions',
    'blog_newslettersubscriber', 'blog_tag', 'system_featureflag',
    'rbac_permissions', 'django_admin_log', 'staff_invitations',
    'blog_post', 'auth_group', 'blog_category', 'attendance_attempt_logs',
    'notifications', 'role_permissions'
]

def load():
    pg_conn = psycopg2.connect(DATABASE_URL)
    pg_cur = pg_conn.cursor()
    
    pg_cur.execute("SET session_replication_role = replica;")
    
    files_to_read = [f for f in os.listdir('.') if f.startswith('backup') and f.endswith('.json')]
    
    all_objects = []
    for fname in files_to_read:
        try:
            with open(fname, 'r', encoding='utf-8', errors='replace') as f:
                data = json.load(f)
                all_objects.extend(data)
        except Exception as e:
            continue
            
    print(f"Total objects read: {len(all_objects)}")
    
    users_groups = []
    users_user_permissions = []
    
    for obj in all_objects:
        model = obj.get('model')
        if not model: continue
        
        if model == 'institutions.user':
            user_id = obj['pk']
            fields = obj.get('fields', {})
            for gid in fields.get('groups', []):
                users_groups.append({'user_id': user_id, 'group_id': gid})
            for pid in fields.get('user_permissions', []):
                users_user_permissions.append({'user_id': user_id, 'permission_id': pid})
                
    def insert_rows(table_name, list_of_dicts):
        if not list_of_dicts: return
        
        pg_cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = %s", (table_name,))
        actual_cols = {r[0] for r in pg_cur.fetchall()}
        
        # fix keys
        fixed_list = []
        for row in list_of_dicts:
            new_row = {}
            for k, v in row.items():
                if k not in actual_cols and f"{k}_id" in actual_cols:
                    new_row[f"{k}_id"] = v
                elif k in actual_cols:
                    new_row[k] = v
            fixed_list.append(new_row)
            
        list_of_dicts = fixed_list
        cols = list_of_dicts[0].keys()
        cols_str = ', '.join([f'"{c}"' for c in cols])
        placeholders = ', '.join(['%s'] * len(cols))
        
        insert_query = f"INSERT INTO {table_name} ({cols_str}) VALUES ({placeholders}) ON CONFLICT DO NOTHING"
        
        inserted = 0
        
        # We can extract values into a list of tuples to batch execute slightly by committing batches
        from psycopg2.extras import execute_batch
        
        # To avoid failure on single row destroying the whole batch, we will still fallback to single rows if batch fails.
        # But actually ON CONFLICT DO NOTHING should prevent errors, unless data type is wrong.
        
        # Prepare all values:
        all_values = []
        for row in list_of_dicts:
            val_tuple = []
            for col in cols:
                v = row.get(col, None)
                if isinstance(v, (dict, list)):
                    v = json.dumps(v)
                val_tuple.append(v)
            all_values.append(tuple(val_tuple))
            
        try:
            pg_cur.execute("SET session_replication_role = replica;")
            execute_batch(pg_cur, insert_query, all_values, page_size=1000)
            inserted = len(all_values)
        except Exception as e:
            pg_conn.rollback()
            pg_cur.execute("SET session_replication_role = replica;")
            print(f"Batch failed for {table_name}, inserting iteratively...")
            # slow insert
            for val in all_values:
                try:
                    pg_cur.execute(insert_query, val)
                    inserted += 1
                    pg_conn.commit()
                except Exception as ex:
                    pg_conn.rollback()
                    pg_cur.execute("SET session_replication_role = replica;")
                    print(f"Error on row: {val} -> {ex}")
                    pass
                    
        print(f"Inserted {inserted} rows into {table_name}")
        pg_conn.commit()
        
    for table_name in requested_tables:
        if table_name == 'users_groups':
            insert_rows('users_groups', users_groups)
        elif table_name == 'users_user_permissions':
            insert_rows('users_user_permissions', users_user_permissions)
        elif table_name == 'django_sessions':
            table_name = 'django_session'
            target_model = 'sessions.session'
            rows_to_insert = []
            for obj in all_objects:
                if obj.get('model') == target_model:
                    row = obj.get('fields', {}).copy()
                    for k in list(row.keys()):
                        if isinstance(row[k], list):
                            del row[k]
                    if 'session_key' not in row: row['session_key'] = obj.get('pk')
                    rows_to_insert.append(row)
            insert_rows(table_name, rows_to_insert)
        else:
            target_model = None
            for m, t in model_to_table.items():
                if t == table_name:
                    target_model = m
                    break
                    
            if not target_model: continue
                
            rows_to_insert = []
            for obj in all_objects:
                if obj.get('model') == target_model:
                    row = obj.get('fields', {}).copy()
                    for k in list(row.keys()):
                        if isinstance(row[k], list):
                            del row[k]
                    if 'session_key' not in row:
                        row['session_key'] = obj.get('pk')
                    if 'id' not in row:
                        row['id'] = obj.get('pk')
                    rows_to_insert.append(row)
                    
            if rows_to_insert:
                insert_rows(table_name, rows_to_insert)

    pg_cur.execute("SET session_replication_role = DEFAULT;")
    pg_conn.commit()
    pg_conn.close()
    print("Done fully migrating!")

if __name__ == '__main__':
    load()
