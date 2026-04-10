import os
import django
import json
from django.core.serializers import serialize
from django.apps import apps
from django.db import connection, transaction
import io

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'presently.settings')
django.setup()

models_to_dump = apps.get_models()

def dump_model_in_chunks(model_class, output_file, chunk_size=5):
    total = model_class.objects.count()
    model_label = model_class._meta.label
    if total == 0:
        return
    print(f"Exporting {total} rows from {model_label}...", flush=True)
    
    with io.open(output_file, 'w', encoding='utf-8') as f:
        f.write('[')
        first = True
        
        for start in range(0, total, chunk_size):
            end = min(start + chunk_size, total)
            chunk = model_class.objects.all().order_by('pk')[start:end]
            
            # Serialize chunk to json
            chunk_data = serialize('json', chunk)
            
            # Remove framing from serialized chunk: [ {..}, {..} ] -> {..}, {..}
            chunk_data = chunk_data.strip()[1:-1]
            if chunk_data:
                if not first:
                    f.write(',\n')
                f.write(chunk_data)
                first = False

        f.write(']')

if __name__ == "__main__":
    for model_class in models_to_dump:
        label = model_class._meta.label
        
        # Exclude ephemeral data and Django structural tables
        if (
            label.startswith("auth.Permission") or 
            label.startswith("contenttypes.ContentType") or
            label.startswith("sessions.") or
            label.startswith("token_blacklist.")
        ):
            print(f"Skipping {label} (ephemeral/structural)", flush=True)
            continue
            
        try:
            dump_model_in_chunks(model_class, f"backup_{label.replace('.', '_')}.json")
        except Exception as e:
            print(f"Error skipping {label}: {e}")
    print("Done! All models chunked.", flush=True)
