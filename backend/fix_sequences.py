import os
import psycopg2

def reset_sequences():
    database_url = os.environ.get('DATABASE_URL', 'postgresql://postgres.owvqbnnybociimzqkeeh:***REMOVED-SUPABASE-PASSWORD***@aws-1-eu-north-1.pooler.supabase.com:6543/postgres')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    # Get all sequences and their associated tables/columns
    # Fetch all sequences that follow the table_name_id_seq pattern
    cur.execute("""
        SELECT 
            relname AS sequence_name
        FROM pg_class s
        JOIN pg_namespace n ON n.nspname = 'public' AND n.oid = s.relnamespace
        WHERE relkind = 'S'
    """)
    
    sequences = [r[0] for r in cur.fetchall()]
    
    for sequence_name in sequences:
        # Try to infer table and column name
        # Most Django sequences are table_column_seq or table_id_seq
        if sequence_name.endswith('_id_seq'):
            table_name = sequence_name[:-7]
            column_name = 'id'
        else:
            continue
            
        print(f"Attempting to reset sequence {sequence_name} for table {table_name}")
        print(f"Resetting sequence {sequence_name} for {table_name}.{column_name}")
        query = f"SELECT setval('{sequence_name}', COALESCE(MAX({column_name}), 1)) FROM {table_name}"
        try:
            cur.execute(query)
            new_val = cur.fetchone()[0]
            print(f"  New sequence value: {new_val}")
        except Exception as e:
            conn.rollback()
            print(f"  Error resetting {sequence_name}: {e}")
            continue
            
    conn.commit()
    conn.close()

if __name__ == "__main__":
    reset_sequences()
