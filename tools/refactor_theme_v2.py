import os, re
dir_path = r'c:\Users\opene\Desktop\Moi\presentlyapp\frontend\components'

def update_classname(match):
    class_str = match.group(1)
    
    # Text
    class_str = re.sub(r'\btext-foreground\b', 'text-text', class_str)
    class_str = re.sub(r'\btext-muted-foreground\b', 'text-textMuted', class_str)
    class_str = re.sub(r'\btext-primary-foreground\b', 'text-text', class_str)
    class_str = re.sub(r'\btext-white\b', 'text-text', class_str)
    class_str = re.sub(r'\btext-black\b', 'text-text', class_str)
    class_str = re.sub(r'\btext-secondary\b', 'text-textMuted', class_str)
    class_str = re.sub(r'\btext-gray-\d+\b', 'text-textMuted', class_str)
    class_str = re.sub(r'\btext-zinc-\d+\b', 'text-textMuted', class_str)
    class_str = re.sub(r'\btext-slate-\d+\b', 'text-textMuted', class_str)
    
    # Backgrounds
    class_str = re.sub(r'\bbg-card\b', 'bg-surface', class_str)
    class_str = re.sub(r'\bbg-muted\b', 'bg-surfaceLow', class_str)
    class_str = re.sub(r'\bbg-accent\b', 'bg-surfaceHigh', class_str)
    class_str = re.sub(r'\bbg-popover\b', 'bg-surfaceHigh', class_str)
    class_str = re.sub(r'\bbg-white\b', 'bg-surface', class_str)
    class_str = re.sub(r'\bbg-gray-\d+\b', 'bg-surfaceLow', class_str)
    class_str = re.sub(r'\bbg-zinc-\d+\b', 'bg-surfaceLow', class_str)
    class_str = re.sub(r'\bbg-slate-\d+\b', 'bg-surfaceLow', class_str)
    
    # Borders
    class_str = re.sub(r'\bborder-border\b', 'border-outline', class_str)
    class_str = re.sub(r'\bborder-gray-\d+\b', 'border-outline', class_str)
    class_str = re.sub(r'\bborder-zinc-\d+\b', 'border-outline', class_str)
    class_str = re.sub(r'\bborder-slate-\d+\b', 'border-outline', class_str)
    
    # Placeholders
    class_str = re.sub(r'\bplaceholder-muted-foreground\b', 'placeholder:text-textMuted', class_str)
    class_str = re.sub(r'\bplaceholder:text-muted-foreground\b', 'placeholder:text-textMuted', class_str)
    class_str = re.sub(r'\bplaceholder-zinc-\d+\b', 'placeholder:text-textMuted', class_str)
    class_str = re.sub(r'\bplaceholder-gray-\d+\b', 'placeholder:text-textMuted', class_str)
    
    # Hovers
    class_str = re.sub(r'\bhover:bg-accent\b', 'hover:bg-surfaceHigh', class_str)
    class_str = re.sub(r'\bhover:text-accent-foreground\b', 'hover:text-text', class_str)
    class_str = re.sub(r'\bhover:bg-muted\b', 'hover:bg-surfaceLow', class_str)
    
    # Remove lingering dark: variants
    class_str = re.sub(r'\bdark:\S+', '', class_str)
    
    # Cleanup spaces
    class_str = re.sub(r'\s+', ' ', class_str).strip()
    
    return f'className="{class_str}"'

def ensure_font_headline(match):
    # match.group() is the whole tag string up to className="..."
    tag_prefix = match.group(1) # <h1...
    classes = match.group(2) # existing classes
    if 'font-headline' not in classes:
        classes = f'font-headline {classes}'
    return f'{tag_prefix}className="{classes}"'

count = 0
for root, dirs, files in os.walk(dir_path):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            if file == 'LandingPage.tsx':
                continue
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                original = content
                
                # 1. Update basic class names
                content = re.sub(r'className="([^"]+)"', update_classname, content)
                
                # 2. Add font-headline to headings that don't have it
                content = re.sub(r'(<h[1-6][^>]*?)className="([^"]*)"', ensure_font_headline, content)
                
                if content != original:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f'Updated {file}')
                    count += 1
            except Exception as e:
                print(f"Error reading {file}: {e}")

print(f"Total files updated: {count}")
