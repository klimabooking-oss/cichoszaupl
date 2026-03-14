import os
import re

sections_dir = 'sections'
skip_files = ['event-slider.liquid', 'portfolio.liquid']

for filename in os.listdir(sections_dir):
    if not filename.endswith('.liquid') or filename in skip_files:
        continue
        
    filepath = os.path.join(sections_dir, filename)
    with open(filepath, 'r') as f:
        content = f.read()
        
    # Find the block containing <section ...>
    section_match = re.search(r'(<section[^>]*class=")([^"]*)(")', content, flags=re.IGNORECASE)
    if section_match:
        cls_str = section_match.group(2)
        # Remove all padding classes
        new_cls_str = re.sub(r'\b(sm:|md:|lg:|xl:|2xl:)?(p[tyb]-[\w\.\[\]]+)\b', '', cls_str)
        # Clean up multiple spaces
        new_cls_str = re.sub(r'\s+', ' ', new_cls_str).strip()
        # Add py-[15px]
        new_cls_str += ' py-[15px]'
        
        new_section_tag = f'{section_match.group(1)}{new_cls_str}{section_match.group(3)}'
        content = content[:section_match.start()] + new_section_tag + content[section_match.end():]
        
        with open(filepath, 'w') as f:
            f.write(content)
            
print("Padding updated.")
