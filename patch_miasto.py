import os
import re

SECTIONS_DIR = "/Users/mateuszswiderski/Desktop/cichoszaupl_wlasciwa wersja/sections"

# Regex to find {{ section.settings.VAR }} or {{ section.settings.VAR | default: ... }}
# We'll replace it with a captured version and append the replace filters.
# But we need to be careful not to chain it if it's already there.

def patch_liquid_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to find output tags like {{ section.settings.title }}
    # and add | replace: '[MIASTO]', metaobject.nazwa.value | replace: ' [MIASTO]', ''
    # Only for title, subtitle, hook.
    
    # Let's find all {{ ... section.settings.title ... }}
    # A safe way is to regex replace:
    # {{ (.*?section\.settings\.(?:title|subtitle|hook|heading).*?) }}
    # but not if it already has replace: '[MIASTO]'
    
    def replacer(match):
        inner = match.group(1)
        if "'[MIASTO]'" in inner:
            return match.group(0) # Already patched
        
        # Only patch if it's likely text output, not assigned to a variable
        # Actually in liquid {{ ... }} is always output.
        # We just add the filters at the end of the inner content.
        return f"{{{{ {inner} | replace: '[MIASTO]', metaobject.nazwa.value | replace: ' [MIASTO]', '' }}}}"

    new_content = re.sub(r'\{\{\s*(.*?section\.settings\.(?:title|subtitle|hook|heading).*?)\s*\}\}', replacer, content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Patched: {os.path.basename(filepath)}")

for filename in os.listdir(SECTIONS_DIR):
    if filename.endswith(".liquid"):
        patch_liquid_file(os.path.join(SECTIONS_DIR, filename))

print("Patching complete.")
