import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
db_url = os.environ.get('DATABASE_URL')
print(f"Connecting to: {db_url}")

try:
    conn = psycopg2.connect(db_url, connect_timeout=10)
    print("Connected!")
    cur = conn.cursor()
    cur.execute("SELECT version();")
    print(f"Result: {cur.fetchone()}")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
