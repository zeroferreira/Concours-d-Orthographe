
import re
import json
import os

file_path = '/Users/zeroferreira/Documents/Material English/Spelling 2026/English/index_temp.html'

def extract_words(content, level_name):
    # Pattern to find const levelXWords = [ ... ];
    pattern = f"const {level_name}Words = \[\s*(.*?)\s*\];"
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        return []
    
    words_block = match.group(1)
    # Extract word: '...'
    words = re.findall(r"word:\s*'([^']+)'", words_block)
    return words

def extract_object_keys(content, object_name, level_key):
    # Locate the object start
    obj_start = content.find(f"const {object_name} =")
    if obj_start == -1:
        obj_start = content.find(f" {object_name} =")
    
    if obj_start == -1:
        return []
    
    # Locate the level key inside
    level_start = content.find(f"'{level_key}':", obj_start)
    if level_start == -1:
        return []
        
    # Find the next level key to limit search
    next_level_pattern = re.compile(r"'Level [ABC]':")
    match = next_level_pattern.search(content, level_start + 10)
    
    limit = len(content)
    if match:
        limit = match.start()
    
    # Find end of object block roughly
    end_brace = content.find("};", level_start)
    if end_brace != -1 and end_brace < limit:
        limit = end_brace

    block = content[level_start:limit]
    
    keys = re.findall(r"'([^']+)':\s*'", block)
    return keys

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    levels = [('levelA', 'Level A'), ('levelB', 'Level B'), ('levelC', 'Level C')]

    missing_defs = {}
    missing_examples = {}

    for var_name, key_name in levels:
        words = extract_words(content, var_name)
        
        def_keys = extract_object_keys(content, "definitions", key_name)
        ex_keys = extract_object_keys(content, "examples", key_name)
        
        missing_d = [w for w in words if w not in def_keys]
        missing_e = [w for w in words if w not in ex_keys]
        
        if missing_d:
            missing_defs[key_name] = missing_d
        if missing_e:
            missing_examples[key_name] = missing_e

    print("Missing Definitions:")
    print(json.dumps(missing_defs, indent=2))
    print("\nMissing Examples:")
    print(json.dumps(missing_examples, indent=2))

except Exception as e:
    print(f"Error: {e}")
