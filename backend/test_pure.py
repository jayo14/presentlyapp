import os

import psycopg2

try:
    print("Connecting...")
    conn = psycopg2.connect(
        os.environ["DATABASE_URL"],
        sslmode="require",
        connect_timeout=10
    )
    print("Connected!")
    conn.close()
except Exception as e:
    print(f"Failed: {e}")
