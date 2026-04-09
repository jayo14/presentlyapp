import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

db_url = os.environ.get('DATABASE_URL')
print(f"Testing connection to: {db_url}")

try:
    conn = psycopg2.connect(db_url)
    print("Successfully connected!")
    cur = conn.cursor()
    cur.execute("SELECT version();")
    print(f"DB Version: {cur.fetchone()[0]}")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Failed to connect: {e}")
