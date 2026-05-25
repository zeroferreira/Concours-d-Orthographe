import os

html_path = 'German/index.html'
css_path = 'German/css/style.css'
js_path = 'German/js/app.js'

print(f"Reading original {html_path}...")
with open(html_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines read: {len(lines)}")

# Verify exact line boundaries (1-indexed matching)
# Line 15 (index 14) should be <style>
# Line 185 (index 184) should be </style>
# Line 189 (index 188) should be <script type="text/javascript">
# Line 6260 (index 6259) should be </script>

print(f"Line 15: '{lines[14].strip()}'")
print(f"Line 185: '{lines[184].strip()}'")
print(f"Line 189: '{lines[188].strip()}'")
print(f"Line 6260: '{lines[6259].strip()}'")

assert lines[14].strip() == '<style>', "Error: Line 15 is not <style>"
assert lines[184].strip() == '</style>', "Error: Line 185 is not </style>"
assert lines[188].strip() == '<script type="text/javascript">', "Error: Line 189 is not <script type=\"text/javascript\">"
assert lines[6259].strip() == '</script>', "Error: Line 6260 is not </script>"

# 1. Extract CSS content (from index 15 to 184)
css_content = "".join(lines[15:184])

# 2. Extract JS content (from index 189 to 6259)
js_content = "".join(lines[189:6259])

# Create directories if they don't exist
os.makedirs(os.path.dirname(css_path), exist_ok=True)
os.makedirs(os.path.dirname(js_path), exist_ok=True)

# Write style.css
with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)
print(f"✅ Extracted CSS written to {css_path}")

# Write app.js
with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)
print(f"✅ Extracted JS written to {js_path}")

# 3. Re-assemble clean, lightweight index.html
head_part = lines[:14]
css_ref = ['  <link rel="stylesheet" href="css/style.css">\n']
middle_part = lines[185:188]  # index 185, 186, 187: </head>, <body>, <div id="root"></div>
js_ref = ['  <script src="js/app.js" defer></script>\n']
tail_part = lines[6260:]  # index 6260 onwards: </body>, </html>

new_html_content = head_part + css_ref + middle_part + js_ref + tail_part

with open(html_path, 'w', encoding='utf-8') as f:
    f.writelines(new_html_content)
print(f"✅ Lightweight HTML template written to {html_path}")
