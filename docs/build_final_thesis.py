"""Assemble the full thesis (Chapters 1-6) into one formatted DOCX.

Reads:
  docs/chapters/chapter_1_introduction.md
  research_docs/SLR.md                          (as Chapter 2)
  docs/chapters/chapter_3_methodology.md
  docs/chapters/chapter_4_design_implementation.md
  docs/chapters/chapter_5_evaluation_results.md
  docs/chapters/chapter_6_conclusion.md

Writes:
  docs/NEXUS_ERP_Thesis_Full.docx
"""

from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION
import re
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CHAPTER_FILES = [
    os.path.join(BASE, 'docs', 'chapters', 'chapter_1_introduction.md'),
    os.path.join(BASE, 'research_docs', 'SLR.md'),
    os.path.join(BASE, 'docs', 'chapters', 'chapter_3_methodology.md'),
    os.path.join(BASE, 'docs', 'chapters', 'chapter_4_design_implementation.md'),
    os.path.join(BASE, 'docs', 'chapters', 'chapter_5_evaluation_results.md'),
    os.path.join(BASE, 'docs', 'chapters', 'chapter_6_conclusion.md'),
]

OUTPUT = os.path.join(BASE, 'docs', 'NEXUS_ERP_Thesis_Full.docx')

doc = Document()

style = doc.styles['Normal']
style.font.name = 'Times New Roman'
style.font.size = Pt(12)
style.paragraph_format.line_spacing = 1.5
style.paragraph_format.space_after = Pt(6)

for level in range(1, 4):
    hs = doc.styles[f'Heading {level}']
    hs.font.name = 'Times New Roman'
    hs.font.color.rgb = RGBColor(0, 0, 0)
    if level == 1:
        hs.font.size = Pt(16)
        hs.font.bold = True
    elif level == 2:
        hs.font.size = Pt(14)
        hs.font.bold = True
    else:
        hs.font.size = Pt(12)
        hs.font.bold = True

# ---------------------------------------------------------------------
# Title page
# ---------------------------------------------------------------------
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
for _ in range(4):
    doc.add_paragraph()
run = p.add_run('NEXUS ERP')
run.bold = True
run.font.size = Pt(24)

p2 = doc.add_paragraph()
p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
run2 = p2.add_run('An Integrated ERP System with Machine Learning-Powered\nEmployee Attrition Risk Scoring')
run2.font.size = Pt(14)

for _ in range(3):
    doc.add_paragraph()

p3 = doc.add_paragraph()
p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
run3 = p3.add_run('Nethmina Kavinda Bandara\nIndex No: 28271\n\nBSc (Hons) Management Information Systems\nNSBM Green University')
run3.font.size = Pt(12)

doc.add_page_break()

# ---------------------------------------------------------------------
# Table & general markdown-to-docx helpers
# ---------------------------------------------------------------------

def set_cell_shading(cell, color):
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement
    shading = OxmlElement('w:shd')
    shading.set(qn('w:fill'), color)
    shading.set(qn('w:val'), 'clear')
    cell._tc.get_or_add_tcPr().append(shading)


def add_formatted_text(paragraph, text):
    """Parse markdown bold/italic markers into runs."""
    parts = re.split(r'(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`.*?`)', text)
    for part in parts:
        if not part:
            continue
        is_bold = is_italic = is_code = False
        clean = part
        if part.startswith('***') and part.endswith('***'):
            clean, is_bold, is_italic = part[3:-3], True, True
        elif part.startswith('**') and part.endswith('**'):
            clean, is_bold = part[2:-2], True
        elif part.startswith('*') and part.endswith('*'):
            clean, is_italic = part[1:-1], True
        elif part.startswith('`') and part.endswith('`'):
            clean, is_code = part[1:-1], True
        run = paragraph.add_run(clean)
        run.bold = is_bold
        run.italic = is_italic
        if is_code:
            run.font.name = 'Consolas'


def parse_table(lines, idx):
    rows = []
    i = idx
    while i < len(lines):
        line = lines[i].strip()
        if not line.startswith('|'):
            break
        cells = [c.strip() for c in line.split('|')[1:-1]]
        if cells and all(re.match(r'^[-:]+$', c) for c in cells):
            i += 1
            continue
        rows.append(cells)
        i += 1
    return rows, i


def add_table(rows):
    if not rows:
        return
    num_cols = max(len(r) for r in rows)
    table = doc.add_table(rows=len(rows), cols=num_cols)
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for r_idx, row in enumerate(rows):
        for c_idx in range(num_cols):
            cell_text = row[c_idx] if c_idx < len(row) else ''
            cell = table.cell(r_idx, c_idx)
            cell.text = ''
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.line_spacing = 1.0
            if r_idx == 0:
                run = p.add_run(cell_text.replace('**', ''))
                run.bold = True
                run.font.size = Pt(9)
                set_cell_shading(cell, 'D9E2F3')
            else:
                add_formatted_text(p, cell_text)
                for run in p.runs:
                    run.font.size = Pt(9)
    doc.add_paragraph()


def process_markdown_file(path, chapter_break=True):
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    if chapter_break:
        doc.add_page_break()

    i = 0
    in_code = False
    code_lines = []
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if stripped.startswith('```'):
            if in_code:
                if code_lines:
                    p = doc.add_paragraph()
                    p.paragraph_format.left_indent = Inches(0.3)
                    run = p.add_run('\n'.join(code_lines))
                    run.font.name = 'Consolas'
                    run.font.size = Pt(9)
                code_lines = []
                in_code = False
            else:
                in_code = True
            i += 1
            continue

        if in_code:
            code_lines.append(line.rstrip())
            i += 1
            continue

        if stripped == '---' or not stripped:
            i += 1
            continue

        if stripped.startswith('#### '):
            doc.add_heading(stripped[5:], level=3)
            i += 1
            continue
        if stripped.startswith('### '):
            doc.add_heading(stripped[4:], level=3)
            i += 1
            continue
        if stripped.startswith('## '):
            doc.add_heading(stripped[3:], level=2)
            i += 1
            continue
        if stripped.startswith('# '):
            doc.add_heading(stripped[2:], level=1)
            i += 1
            continue

        if stripped.startswith('|'):
            rows, i = parse_table(lines, i)
            add_table(rows)
            continue

        m = re.match(r'^(\d+)\.\s+(.*)', stripped)
        if m:
            p = doc.add_paragraph(style='List Number')
            add_formatted_text(p, m.group(2))
            i += 1
            continue

        if stripped.startswith('- ') or stripped.startswith('* '):
            p = doc.add_paragraph(style='List Bullet')
            add_formatted_text(p, stripped[2:])
            i += 1
            continue

        ref_match = re.match(r'^\[(\d+)\]\s+(.*)', stripped)
        if ref_match:
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.5)
            p.paragraph_format.first_line_indent = Inches(-0.5)
            run = p.add_run(f'[{ref_match.group(1)}] ')
            run.bold = True
            add_formatted_text(p, ref_match.group(2))
            i += 1
            continue

        if stripped.startswith('**Table') or stripped.startswith('**Figure'):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            add_formatted_text(p, stripped)
            i += 1
            continue

        img_match = re.match(r'^!\[(.*?)\]\((.*?)\)$', stripped)
        if img_match:
            caption, src = img_match.group(1), img_match.group(2)
            img_path = os.path.join(BASE, 'docs', src)
            if os.path.exists(img_path):
                doc.add_picture(img_path, width=Inches(6.0))
                doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
            cap_p = doc.add_paragraph()
            cap_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            cap_run = cap_p.add_run(caption)
            cap_run.italic = True
            cap_run.font.size = Pt(10)
            i += 1
            continue

        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        add_formatted_text(p, stripped)
        i += 1


# ---------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------
for idx, path in enumerate(CHAPTER_FILES):
    process_markdown_file(path, chapter_break=True)

for section in doc.sections:
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1.25)
    section.right_margin = Inches(1.25)

doc.save(OUTPUT)
print(f'Saved: {OUTPUT}')
