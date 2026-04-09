import psycopg2

try:
    print("Connecting...")
    conn = psycopg2.connect(
        host="ep-dry-truth-ansqgzu2.c-6.us-east-1.aws.neon.tech",
        user="ep-dry-truth-ansqgzu2$neondb_owner",
        password="npg_wv7DPjoE3BWu",
        database="neondb",
        sslmode="require",
        connect_timeout=10
    )
    print("Connected!")
    conn.close()
except Exception as e:
    print(f"Failed: {e}")
