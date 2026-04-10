import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")

tables_to_check = [
    'venues', 'users_groups', 'users_user_permissions', 
    'user_permissions', 'user_devices', 
    'token_blacklist_blacklistedtoken', 'token_blacklist_outstandingtoken', 
    'staff_profiles', 'scheduled_reports', 'scheduled_reports_recipients', 
    'email_verification_otps', 'django_migrations', 'django_session', 
    'course_enrollments'
]

with open("db_info_v3.txt", "w") as f:
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        for table in tables_to_check:
            cur.execute(f"""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '{table}' 
                AND table_schema = 'public'
                ORDER BY ordinal_position
            """)
            columns = cur.fetchall()
            if columns:
                f.write(f"\nColumns in public.{table}:\n")
                for col in columns:
                    f.write(f"  {col[0]} ({col[1]})\n")
            else:
                f.write(f"\nTable public.{table} not found.\n")

        cur.close()
        conn.close()
    except Exception as e:
        f.write(f"Error: {e}\n")
print("Done. Check db_info_v3.txt")
