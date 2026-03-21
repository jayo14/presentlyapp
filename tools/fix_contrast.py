import os, re
dir_path = r'c:\Users\opene\Desktop\Moi\presentlyapp\frontend\components'

def update_classname(match):
    class_str = match.group(1)
    
    # Common pairs to semantic tokens
    class_str = re.sub(r'bg-white dark:bg-zinc-[0-9]+', 'bg-card text-foreground', class_str)
    class_str = re.sub(r'bg-zinc-50 dark:bg-zinc-[0-9]+', 'bg-muted', class_str)
    class_str = re.sub(r'bg-zinc-100 dark:bg-zinc-[0-9]+', 'bg-accent', class_str)
    
    # Text colors
    class_str = re.sub(r'text-zinc-[89]00 dark:text-white', 'text-foreground', class_str)
    class_str = re.sub(r'text-zinc-[89]00 dark:text-zinc-[0-9]+', 'text-foreground', class_str)
    class_str = re.sub(r'text-zinc-[567]00 dark:text-zinc-[0-9]+', 'text-muted-foreground', class_str)
    class_str = re.sub(r'text-zinc-[3456]00', 'text-muted-foreground', class_str)
    class_str = re.sub(r'text-zinc-[89]00', 'text-foreground', class_str)
    class_str = re.sub(r'text-white', 'text-primary-foreground', class_str)
    class_str = re.sub(r'text-black', 'text-foreground', class_str)
    
    # Background standalone
    class_str = re.sub(r'bg-zinc-950', 'bg-background', class_str)
    class_str = re.sub(r'bg-zinc-900', 'bg-card', class_str)
    class_str = re.sub(r'bg-zinc-800', 'bg-accent', class_str)
    class_str = re.sub(r'bg-zinc-100', 'bg-muted', class_str)
    class_str = re.sub(r'bg-zinc-50', 'bg-muted', class_str)
    class_str = re.sub(r'bg-white', 'bg-card', class_str)

    # Borders
    class_str = re.sub(r'border-zinc-[0-9]+ dark:border-zinc-[0-9]+', 'border-border', class_str)
    class_str = re.sub(r'border-zinc-[0-9]+', 'border-border', class_str)
    
    # Remove stranded dark: variants
    class_str = re.sub(r'dark:\S+', '', class_str)
    class_str = re.sub(r'\s+', ' ', class_str).strip()
    
    return f'className="{class_str}"'

count = 0
for root, dirs, files in os.walk(dir_path):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            if file == 'AiAssistant.tsx':
                continue
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                original = content
                
                # Find classNames
                content = re.sub(r'className="([^"]+)"', update_classname, content)
                
                if content != original:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f'Updated {file}')
                    count += 1
            except Exception as e:
                print(f"Error reading {file}: {e}")

print(f"Total files updated: {count}")
