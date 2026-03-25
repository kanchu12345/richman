with open('g:/richman/projects.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# find index of <!-- ── 2024 ── -->
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if '<!-- ── 2024 ── -->' in line:
        start_idx = i
    if '<!-- #projects-grid -->' in line:
        end_idx = i - 1
        break

if start_idx != -1 and end_idx != -1:
    del lines[start_idx:end_idx]
    lines.insert(start_idx, '      <div style="text-align:center; padding: 4rem 1rem; color:var(--text-muted);">\n        <p>Loading projects...</p>\n        <p style="font-size:0.85rem; margin-top:0.5rem; opacity:0.7;">(Note: If this doesn\'t load locally, please view the live website to see database content.)</p>\n      </div>\n')
    
    with open('g:/richman/projects.html', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("SUCCESS")
else:
    print("NOT FOUND")
