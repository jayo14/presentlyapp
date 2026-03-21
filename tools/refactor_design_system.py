import os, re
dir_path = r'c:\Users\opene\Desktop\Moi\presentlyapp\frontend\components'

def update_classes(class_str):
    # Fix typos from previous runs
    class_str = re.sub(r'\bbg-inputccent\b', 'bg-surfaceLow', class_str)
    class_str = re.sub(r'\btext-muted-foregroundccent-foreground\b', 'text-textMuted', class_str)
    
    # Text mapping
    class_str = re.sub(r'\btext-white\b', 'text-text', class_str)
    class_str = re.sub(r'\btext-black\b', 'text-text', class_str)
    class_str = re.sub(r'\btext-zinc-900\b', 'text-text', class_str)
    class_str = re.sub(r'\btext-zinc-800\b', 'text-text', class_str)
    class_str = re.sub(r'\btext-zinc-700\b', 'text-textMuted', class_str)
    class_str = re.sub(r'\btext-zinc-600\b', 'text-textMuted', class_str)
    class_str = re.sub(r'\btext-zinc-500\b', 'text-textMuted', class_str)
    class_str = re.sub(r'\btext-zinc-400\b', 'text-textMuted', class_str)
    class_str = re.sub(r'\btext-zinc-300\b', 'text-textMuted', class_str)
    class_str = re.sub(r'\btext-gray-500\b', 'text-textMuted', class_str)
    class_str = re.sub(r'\btext-muted-foreground\b', 'text-textMuted', class_str)
    class_str = re.sub(r'\btext-foreground\b', 'text-text', class_str)
    class_str = re.sub(r'\btext-secondary\b', 'text-textMuted', class_str)
    
    # Background mapping
    class_str = re.sub(r'\bbg-white\b', 'bg-surface', class_str)
    class_str = re.sub(r'\bbg-gray-100\b', 'bg-surfaceLow', class_str)
    class_str = re.sub(r'\bbg-zinc-50\b', 'bg-surfaceLow', class_str)
    class_str = re.sub(r'\bbg-zinc-100\b', 'bg-surfaceLow', class_str)
    class_str = re.sub(r'\bbg-zinc-200\b', 'bg-surfaceLow', class_str)
    class_str = re.sub(r'\bbg-zinc-800\b', 'bg-surfaceHigh', class_str)
    class_str = re.sub(r'\bbg-zinc-900\b', 'bg-surface', class_str)
    class_str = re.sub(r'\bbg-zinc-950\b', 'bg-background', class_str)
    class_str = re.sub(r'\bbg-card\b', 'bg-surface', class_str)
    class_str = re.sub(r'\bbg-muted\b', 'bg-surfaceLow', class_str)
    class_str = re.sub(r'\bbg-accent\b', 'bg-surfaceHigh', class_str)
    class_str = re.sub(r'\bbg-surfaceHighackgroundlack\b', 'bg-surfaceHigh', class_str)
    
    # Border mapping
    class_str = re.sub(r'\bborder-gray-200\b', 'border-outline', class_str)
    class_str = re.sub(r'\bborder-zinc-200\b', 'border-outline', class_str)
    class_str = re.sub(r'\bborder-border\b', 'border-outline', class_str)
    class_str = re.sub(r'\bborder-zinc-800\b', 'border-outline', class_str)
    class_str = re.sub(r'\bborder-zinc-300\b', 'border-outline', class_str)
    class_str = re.sub(r'\bborder-outline-variant\b', 'border-outline', class_str)
    
    # Placeholder mapping
    class_str = re.sub(r'\bplaceholder-zinc-400\b', 'placeholder:text-textMuted', class_str)
    class_str = re.sub(r'\bplaceholder:text-textMuted\b', 'placeholder:text-textMuted', class_str)
    
    # Ring mapping
    class_str = re.sub(r'\bring-zinc-200\b', 'ring-outline', class_str)
    class_str = re.sub(r'\bring-ring\b', 'ring-primaryContainer', class_str)
    
    # Clean up dark: variants
    class_str = re.sub(r'\bdark:\S+\b', '', class_str)
    
    # Cleanup whitespace
    class_str = re.sub(r'\s+', ' ', class_str).strip()
    return class_str

def process_match(match):
    return f'className={match.group(1)}{update_classes(match.group(2))}{match.group(1)}'

count = 0
for root, dirs, files in os.walk(dir_path):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            # Exclude LandingPage as per user requirement
            if "LandingPage" in file:
                continue
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                original = content
                
                # Robust regex for className
                # Supports className="...", className='...', className={`...`}
                content = re.sub(r'className=(["\'`])(.*?)\1', process_match, content)
                
                # Also handle conditional strings like ? 'bg-zinc-900' : 'bg-white'
                # and standalone strings that look like tailwind classes
                # This is riskier but necessary. We'll only target specific ones.
                content = re.sub(r"'\b(text-white|bg-white|bg-zinc-\d+|text-zinc-\d+|border-zinc-\d+)\b'", lambda m: f"'{update_classes(m.group(1))}'", content)
                content = re.sub(r'"\b(text-white|bg-white|bg-zinc-\d+|text-zinc-\d+|border-zinc-\d+)\b"', lambda m: f'"{update_classes(m.group(1))}"', content)
                
                if content != original:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f'Updated {file}')
                    count += 1
            except Exception as e:
                print(f"Error processing {file}: {e}")

print(f"Total files refactored: {count}")
