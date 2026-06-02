import re

with open('/Users/zeroferreira/Documents/Material English/Spelling 2026/English/js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find occurrences of 'belt' in the file
matches = [m.start() for m in re.finditer('belt', content)]
print(f"Found {len(matches)} occurrences of 'belt':")
for idx, m in enumerate(matches):
    start = max(0, m - 50)
    end = min(len(content), m + 50)
    context = content[start:end]
    print(f"\nMatch {idx+1} at index {m}:")
    print(f"Context: {repr(context)}")
    # Print unicode points of the match + nearby word
    word_match = re.search(r'word:\s*[\'"]([^\'"]+)[\'"]', context)
    if word_match:
        word = word_match.group(1)
        points = [f"{c} (U+{ord(c):04X})" for c in word]
        print(f"Word chars: {', '.join(points)}")
