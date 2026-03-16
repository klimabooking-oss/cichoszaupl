import os
import json
import re

TPL_DIR = "/Users/mateuszswiderski/Desktop/cichoszaupl_wlasciwa wersja/templates"
META_DIR = os.path.join(TPL_DIR, "metaobject")

# Map of source template -> metaobject template
templates_to_sync = {
    "page.b2b.json": "oferta_b2b.json",
    "page.beach_bary.json": "oferta_beach_bary.json",
    "page.festiwale.json": "oferta_festiwale.json",
    "page.kino.json": "oferta_kino_plenerowe.json",
    "page.konferencje.json": "oferta_konferencje.json",
    "page.teatr.json": "oferta_teatr_silent.json",
    "page.wynajem.json": "oferta_wynajem.json",
    "page.cennik.json": "cennik.json",
    "index.json": "strona_glowna.json"
}

os.makedirs(META_DIR, exist_ok=True)

def strip_comments(json_str):
    # Remove top block comment /* ... */
    json_str = re.sub(r'/\*[\s\S]*?\*/', '', json_str)
    return json_str

for src_name, dest_name in templates_to_sync.items():
    src_path = os.path.join(TPL_DIR, src_name)
    dest_path = os.path.join(META_DIR, dest_name)
    
    if os.path.exists(src_path):
        with open(src_path, 'r', encoding='utf-8') as f:
            content = f.read()
            clean_content = strip_comments(content)
            try:
                data = json.loads(clean_content)
            except json.JSONDecodeError as e:
                print(f"Error decoding {src_name}: {e}")
                continue
            
        # Inject [MIASTO] into titles
        for section_id, section in data.get('sections', {}).items():
            settings = section.get('settings', {})
            # Add [MIASTO] to title if it's a known section with a title and it's not already there
            if 'title' in settings and isinstance(settings['title'], str) and settings['title'].strip():
                if '[MIASTO]' not in settings['title'] and 'Zaufali' not in settings['title'] and 'FAQ' not in settings['title'] and 'Kalkulator' not in settings['title'] and 'Współpraca' not in settings['title'] and 'Nasze' not in settings['title']:
                    settings['title'] = settings['title'] + " [MIASTO]"
            
            # For hero or b2b landing hooks/subtitles
            if 'hook' in settings and isinstance(settings['hook'], str) and settings['hook'].strip():
                if '[MIASTO]' not in settings['hook']:
                    settings['hook'] = settings['hook'] + " [MIASTO]"
                    
            if 'subtitle' in settings and isinstance(settings['subtitle'], str) and settings['subtitle'].strip():
                if '[MIASTO]' not in settings['subtitle'] and 'FAQ' not in settings['subtitle'] and 'Kalkulator' not in settings['subtitle']:
                    settings['subtitle'] = settings['subtitle'] + " [MIASTO]"
                    
        with open(dest_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
print("Metaobject templates synced and updated with [MIASTO] tags.")
