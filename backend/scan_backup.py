import json
try:
    with open('backup.json', 'r', encoding='utf-8', errors='ignore') as f:
        data = json.load(f)
        models = sorted(list(set(e['model'] for e in data if 'model' in e)))
        print("\n".join(models))
except Exception as e:
    print(e)
