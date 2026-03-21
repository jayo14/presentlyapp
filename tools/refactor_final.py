import os, re
dir_path = r'c:\Users\opene\Desktop\Moi\presentlyapp\frontend\components'

# Define mappings based on user's core principles
mappings = [
    # Typos/Leftovers from previous buggy runs
    (r'bg-inputccent', 'bg-surfaceLow'),
    (r'text-muted-foregroundccent-foreground', 'text-textMuted'),
    (r'bg-surface dark:bg-zinc-900', 'bg-surface'),
    (r'bg-surface dark:bg-zinc-950', 'bg-surface'),
    (r'bg-white dark:bg-zinc-900', 'bg-surface'),
    (r'bg-white/20', 'bg-surfaceHigh/20'),
    (r'bg-white/10', 'bg-surfaceHigh/10'),
    (r'bg-white/5', 'bg-surfaceHigh/5'),

    # Backgrounds
    (r'\bbg-white\b', 'bg-surface'),
    (r'\bbg-black\b', 'bg-surface'),
    (r'\bbg-zinc-50\b', 'bg-surfaceLow'),
    (r'\bbg-zinc-100\b', 'bg-surfaceLow'),
    (r'\bbg-zinc-200\b', 'bg-surfaceLow'),
    (r'\bbg-zinc-300\b', 'bg-surfaceLow'),
    (r'\bbg-zinc-400\b', 'bg-surfaceContainer'),
    (r'\bbg-zinc-500\b', 'bg-surfaceContainer'),
    (r'\bbg-zinc-600\b', 'bg-surfaceContainer'),
    (r'\bbg-zinc-700\b', 'bg-surfaceHigh'),
    (r'\bbg-zinc-800\b', 'bg-surfaceHigh'),
    (r'\bbg-zinc-900\b', 'bg-surface'),
    (r'\bbg-zinc-950\b', 'bg-background'),
    (r'\bbg-slate-\d+\b', 'bg-surfaceLow'),
    (r'\bbg-card\b', 'bg-surface'),
    (r'\bbg-muted\b', 'bg-surfaceLow'),
    (r'\bbg-accent\b', 'bg-surfaceHigh'),

    # Text
    (r'\btext-white\b', 'text-text'),
    (r'\btext-black\b', 'text-text'),
    (r'\btext-zinc-900\b', 'text-text'),
    (r'\btext-zinc-800\b', 'text-textMuted'),
    (r'\btext-zinc-700\b', 'text-textMuted'),
    (r'\btext-zinc-600\b', 'text-textMuted'),
    (r'\btext-zinc-500\b', 'text-textMuted'),
    (r'\btext-zinc-400\b', 'text-textMuted'),
    (r'\btext-zinc-300\b', 'text-textMuted'),
    (r'\btext-zinc-200\b', 'text-text'),
    (r'\btext-zinc-100\b', 'text-text'),
    (r'\btext-gray-\d+\b', 'text-textMuted'),
    (r'\btext-slate-\d+\b', 'text-textMuted'),
    (r'\btext-muted-foreground\b', 'text-textMuted'),
    (r'\btext-foreground\b', 'text-text'),
    (r'\btext-secondary\b', 'text-textMuted'),

    # Borders
    (r'\bborder-zinc-\d+\b', 'border-outline'),
    (r'\bborder-gray-\d+\b', 'border-outline'),
    (r'\bborder-slate-\d+\b', 'border-outline'),
    (r'\bborder-border\b', 'border-outline'),
    (r'\bborder-outline-variant\b', 'border-outline'),

    # Placeholders
    (r'\bplaceholder-zinc-400\b', 'placeholder:text-textMuted'),
    (r'\bplaceholder-zinc-500\b', 'placeholder:text-textMuted'),
    (r'\bplaceholder:text-muted-foreground\b', 'placeholder:text-textMuted'),
    
    # Rings
    (r'\bring-zinc-\d+\b', 'ring-outline'),
    (r'\bring-ring\b', 'ring-primaryContainer'),
]

def apply_mappings(text):
    for pattern, replacement in mappings:
        text = re.sub(pattern, replacement, text)
    # Remove dark: variants globally
    text = re.sub(r'dark:\S+', '', text)
    # Final cleanup of double spaces or spaces after removal
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

count = 0
for root, dirs, files in os.walk(dir_path):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            if "LandingPage" in file: continue
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                original = content
                
                # Replace inside className="..." or className={`...`}
                def replacer(match):
                    quote = match.group(1)
                    inner = match.group(2)
                    return f'className={quote}{apply_mappings(inner)}{quote}'
                
                content = re.sub(r'className=(["\'`])(.*?)\1', replacer, content, flags=re.DOTALL)
                
                # Target standalone strings in literals ? 'text-white' : 'text-zinc-900'
                content = re.sub(r"(['\"])(\b(text-white|bg-white|text-zinc-\d+|bg-zinc-\d+|border-zinc-\d+|dark:\S+)\b)\1", 
                                 lambda m: f"{m.group(1)}{apply_mappings(m.group(2))}{m.group(1)}", content)

                # Heading Font Headline injection
                def heading_replacer(match):
                    tag = match.group(1)
                    rest = match.group(2)
                    if 'font-headline' not in rest and 'className=' in rest:
                        rest = rest.replace('className="', 'className="font-headline ')
                        rest = rest.replace("className='", "className='font-headline ")
                        rest = rest.replace("className={`", "className={`font-headline ")
                    return f'<{tag}{rest}>'
                
                content = re.sub(r'<(h[1-6])\b([^>]*?)>', heading_replacer, content)

                if content != original:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f'Refactored {file}')
                    count += 1
            except Exception as e:
                print(f"Error {file}: {e}")

print(f"Done. Refactored {count} files.")
