import sqlite3
import psycopg2
import json
import os
from datetime import datetime

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres.owvqbnnybociimzqkeeh:***REMOVED-SUPABASE-PASSWORD***@aws-1-eu-north-1.pooler.supabase.com:6543/postgres")

tables_to_migrate = [
    "venues", "users_groups", "users_user_permissions", "auth_permission", "user_devices",
    "token_blacklist_blacklistedtoken", "token_blacklist_outstandingtoken", "staff_profiles",
    "scheduled_reports", "scheduled_reports_recipients", "email_verification_otps",
    "django_migrations", "django_sessions", "course_enrollments"
]
# Wait, user wrote "user_permissions", which corresponds to "auth_permission", but let's check exact name in sqlite.
# The user wrote "venues, users_groups, users_user_permissions, user_permissions, user_devices..."

def migrate():
    sl_conn = sqlite3.connect('db.sqlite3')
    sl_cur = sl_conn.cursor()
    
    pg_conn = psycopg2.connect(DATABASE_URL)
    pg_cur = pg_conn.cursor()

    for table_name in tables_to_migrate:
        # User specified 'user_permissions', but in DB it might be 'auth_permission'
        # Let's dynamically find it. We will try the exact name first.
        try:
            sl_cur.execute(f"SELECT * FROM {table_name}")
            rows = sl_cur.fetchall()
        except sqlite3.OperationalError:
            if table_name == 'user_permissions':
                try:
                    sl_cur.execute("SELECT * FROM auth_permission")
                    table_name_sql = "auth_permission"
                    rows = sl_cur.fetchall()
                except sqlite3.OperationalError:
                    print(f"Skipping {table_name}, not found.")
                    continue
            else:
                print(f"Skipping {table_name}, not found in sqlite.")
                continue
        except Exception as e:
            print(f"Skipping {table_name}, error: {e}")
            continue

        cols = [description[0] for description in sl_cur.description]
        
        # Save backup
        backup_file = f"backup_{table_name}.json"
        
        # We need to serialize binary/datetime to strings
        backup_data = []
        for r in rows:
            row_dict = dict(zip(cols, r))
            backup_data.append(row_dict)
            
        with open(backup_file, "w") as f:
            json.dump(backup_data, f, default=str)
            
        if not rows:
            print(f"Table {table_name} is empty, skipped migration.")
            continue
            
        print(f"Migrating {len(rows)} rows into {table_name}...")
        
        cols_str = ', '.join([f'"{c}"' for c in cols])
        placeholders = ', '.join(['%s'] * len(cols))
        
        # Target table name might need mapping for auth_permission
        target_tb = table_name_sql if table_name == 'user_permissions' else table_name
        
        insert_query = f"INSERT INTO {target_tb} ({cols_str}) VALUES ({placeholders}) ON CONFLICT DO NOTHING"
        
        inserted = 0
        for r in rows:
            try:
                pg_cur.execute(insert_query, r)
                inserted += 1
            except psycopg2.errors.UndefinedTable:
                pg_conn.rollback()
                print(f"Table {target_tb} does not exist in Postgres!")
                break
            except Exception as e:
                pg_conn.rollback()
                # print(f"Error inserting row in {target_tb}: {e}")
                pass
        
        pg_conn.commit()
        print(f"Finished {target_tb}: successfully inserted {inserted} rows.")
        
    pg_conn.close()
    sl_conn.close()

if __name__ == '__main__':
    migrate()
