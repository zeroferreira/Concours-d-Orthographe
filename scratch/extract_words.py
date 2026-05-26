import json
import re

def extract_words(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    # spelling-data.js starts with window.SPELLING_DATA = { ... }
    # Let's extract the JSON part
    json_str_match = re.search(r'window\.SPELLING_DATA\s*=\s*(\{.*\});?', content, re.DOTALL)
    if not json_str_match:
        print(f"Could not parse JSON from {filepath}")
        return []
    
    data = json.loads(json_str_match.group(1))
    words = []
    for level in ['levelAWords', 'levelBWords', 'levelCWords']:
        if level in data:
            for item in data[level]:
                words.append(item['word'])
    return words

print("FRENCH WORDS:")
fr_words = extract_words('/Users/zeroferreira/Documents/Material English/Spelling 2026/French/spelling-data.js')
print(fr_words)
print(f"Total: {len(fr_words)}")

print("\nGERMAN WORDS:")
de_words = extract_words('/Users/zeroferreira/Documents/Material English/Spelling 2026/German/spelling-data.js')
print(de_words)
print(f"Total: {len(de_words)}")
