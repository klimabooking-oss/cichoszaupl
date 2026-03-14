import os

sections_dir = 'sections'

for filename in os.listdir(sections_dir):
    if not filename.endswith('.liquid'):
        continue
        
    filepath = os.path.join(sections_dir, filename)
    with open(filepath, 'r') as f:
        content = f.read()
        
    original = content
    content = content.replace(' ]"', '"')
    content = content.replace(' ] "', '"')
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
            
print("Fixed brackets.")
