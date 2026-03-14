import os
import re

sections_dir = 'sections'
skip_files = ['event-slider.liquid']

for filename in os.listdir(sections_dir):
    if not filename.endswith('.liquid') or filename in skip_files:
        continue
        
    filepath = os.path.join(sections_dir, filename)
    with open(filepath, 'r') as f:
        content = f.read()
        
    original_content = content
    
    pt = pb = "60px"
        
    def replace_section(match):
        attrs = match.group(1)
        
        # Parse existing style attribute if present
        style_match = re.search(r'style="([^"]*)"', attrs, flags=re.IGNORECASE)
        
        if style_match:
            old_style = style_match.group(1)
            # Remove any existing padding-top or padding-bottom
            new_style = re.sub(r'padding-top\s*:[^;]+;?', '', old_style, flags=re.IGNORECASE)
            new_style = re.sub(r'padding-bottom\s*:[^;]+;?', '', new_style, flags=re.IGNORECASE)
            new_style = new_style.strip()
            
            # Add new padding
            if new_style and not new_style.endswith(';'):
                new_style += ';'
            
            # Avoid duplicate ;
            new_style = re.sub(r';+', ';', new_style)
            if new_style and not new_style.endswith(';'):
                new_style += ';'
                
            new_style += f' padding-top: {pt}; padding-bottom: {pb};'
            new_style = new_style.strip()
            
            attrs = attrs[:style_match.start(0)] + f'style="{new_style}"' + attrs[style_match.end(0):]
        else:
            # Create style attribute
            attrs += f' style="padding-top: {pt}; padding-bottom: {pb};"'
            
        return f'<section{attrs}>' # match group 1 includes the leading space if any
        
    new_content = re.sub(r'<section([^>]*)>', replace_section, content, flags=re.IGNORECASE)
    
    if new_content != original_content:
        with open(filepath, 'w') as f:
            f.write(new_content)
            
print("Padding updated to 60px.")
