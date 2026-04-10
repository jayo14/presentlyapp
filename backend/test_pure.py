import psycopg2

try:
    print("Connecting...")
    conn = psycopg2.connect(
        host="ep-dry-truth-ansqgzu2.c-6.us-east-1.aws.neon.tech",
        user="neondb_owner",
        password="***REMOVED-NEON-PASSWORD***",
        database="neondb",
        sslmode="require",
        connect_timeout=10
    )
    print("Connected!")
    conn.close()
except Exception as e:
    print(f"Failed: {e}")
