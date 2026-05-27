"""Convert SLR.md to a formatted DOCX file with PRISMA flowchart and clickable citations."""

from docx import Document
from docx.shared import Pt, Inches, RGBColor, Cm, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import re
import copy

doc = Document()

# -- Style setup --
style = doc.styles['Normal']
font = style.font
font.name = 'Times New Roman'
font.size = Pt(12)
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

# =====================================================================
# CITATION BOOKMARK / HYPERLINK HELPERS
# =====================================================================

# Map author keys to reference numbers (matching the [N] in References section)
CITATION_MAP = {
    'Adadi and Berrada, 2018': 1,
    'Adadi & Berrada, 2018': 1,
    'Ahmed and Mahmood, 2019': 2,
    'Ahmed & Mahmood, 2019': 2,
    'Alao and Adeyemo, 2013': 3,
    'Alao & Adeyemo, 2013': 3,
    'Albarghouthi et al., 2024': 4,
    'Chofreh et al., 2021': 5,
    'Dahmen and Cook, 2019': 6,
    'Dahmen & Cook, 2019': 6,
    'Davenport, 1998': 7,
    'De Jesus, Junior, and Brandao, 2018': 8,
    'De Jesus et al., 2018': 8,
    'De Jesus, Junior, and Brandão, 2018': 8,
    'Fallucchi et al., 2020': 9,
    'Ferraiolo, Kuhn, and Chandramouli, 2007': 10,
    'Ferraiolo et al., 2007': 10,
    'Figueira and Vaz, 2024': 11,
    'Figueira & Vaz, 2024': 11,
    'Gonzales, Guruswamy, and Smith, 2023': 12,
    'Gonzales et al., 2023': 12,
    'Gupta and Sharma, 2022': 13,
    'Gupta & Sharma, 2022': 13,
    'IBM, n.d.': 14,
    'Jain and Nayyar, 2022': 15,
    'Jain & Nayyar, 2022': 15,
    'Katuu, 2020': 16,
    'Lundberg and Lee, 2017': 17,
    'Lundberg & Lee, 2017': 17,
    'Moher et al., 2009': 18,
    'Mosqueira-Rey et al., 2023': 19,
    'Osman, 2025': 20,
    'Raza et al., 2022': 21,
    'Raza et al., 2023': 21,
    'Roth et al., 2016': 22,
    'Roth, Bobko, Van Iddekinge, and Thatcher, 2016': 22,
    'Sajjadiani et al., 2019': 23,
    'Srivastava and Nair, 2018': 24,
    'Srivastava & Nair, 2018': 24,
    'Van Iddekinge et al., 2016': 25,
    'Yadav, Jain, and Singh, 2018': 26,
    'Yadav et al., 2018': 26,
    'Zhao and Hryniewicki, 2018': 27,
    'Zhao & Hryniewicki, 2018': 27,
}


def add_bookmark(paragraph, bookmark_name):
    """Add a bookmark to a paragraph."""
    run = paragraph.runs[0] if paragraph.runs else paragraph.add_run()
    tag = run._r

    bookmark_start = OxmlElement('w:bookmarkStart')
    bookmark_start.set(qn('w:id'), str(hash(bookmark_name) % 100000))
    bookmark_start.set(qn('w:name'), bookmark_name)

    bookmark_end = OxmlElement('w:bookmarkEnd')
    bookmark_end.set(qn('w:id'), str(hash(bookmark_name) % 100000))

    tag.addprevious(bookmark_start)
    tag.addnext(bookmark_end)


def add_hyperlink_to_bookmark(paragraph, bookmark_name, text, color='0000FF'):
    """Add a clickable internal hyperlink to a bookmark."""
    hyperlink = OxmlElement('w:hyperlink')
    hyperlink.set(qn('w:anchor'), bookmark_name)

    run_elem = OxmlElement('w:r')

    rPr = OxmlElement('w:rPr')

    c_elem = OxmlElement('w:color')
    c_elem.set(qn('w:val'), color)
    rPr.append(c_elem)

    u_elem = OxmlElement('w:u')
    u_elem.set(qn('w:val'), 'single')
    rPr.append(u_elem)

    rFonts = OxmlElement('w:rFonts')
    rFonts.set(qn('w:ascii'), 'Times New Roman')
    rFonts.set(qn('w:hAnsi'), 'Times New Roman')
    rPr.append(rFonts)

    sz = OxmlElement('w:sz')
    sz.set(qn('w:val'), '24')  # 12pt = 24 half-points
    rPr.append(sz)

    run_elem.append(rPr)

    t_elem = OxmlElement('w:t')
    t_elem.set(qn('xml:space'), 'preserve')
    t_elem.text = text
    run_elem.append(t_elem)

    hyperlink.append(run_elem)
    paragraph._p.append(hyperlink)


# Inline narrative citation patterns: "Author (Year)" or "Author et al. (Year)"
# Build a sorted list (longest first to avoid partial matches)
INLINE_CITATION_MAP = {}
for key, num in CITATION_MAP.items():
    # Extract author part and year from keys like "Katuu, 2020"
    parts = key.rsplit(', ', 1)
    if len(parts) == 2:
        author_part, year = parts[0], parts[1]
        # Create "Author (Year)" pattern
        inline_key = f'{author_part} ({year})'
        INLINE_CITATION_MAP[inline_key] = num

# Sort by length descending so longer matches are tried first
INLINE_KEYS_SORTED = sorted(INLINE_CITATION_MAP.keys(), key=len, reverse=True)


def _convert_to_ieee(text):
    """Convert all author-year citations in text to IEEE [N] numbered format.
    Returns a list of tuples: ('text', string) or ('cite', ref_num)."""

    result_text = text

    # Step 1: Convert parenthetical citations (Author, Year) and (A; B; C)
    def replace_paren_citation(m):
        inside = m.group(1)
        citation_parts = [c.strip() for c in inside.split(';')]
        resolved = []
        for cp in citation_parts:
            if cp in CITATION_MAP:
                resolved.append(CITATION_MAP[cp])
            else:
                return m.group(0)  # Not a citation, return as-is
        if resolved:
            nums = ', '.join(str(n) for n in sorted(resolved))
            return f'[{nums}]'
        return m.group(0)

    paren_pattern = r'\(([^()]+(?:;\s*[^()]+)*)\)'
    result_text = re.sub(paren_pattern, replace_paren_citation, result_text)

    # Step 2: Convert inline narrative citations "Author (Year)" -> "[N]"
    # But avoid double-converting things already in [] from step 1
    for inline_key in INLINE_KEYS_SORTED:
        ref_num = INLINE_CITATION_MAP[inline_key]
        if inline_key in result_text:
            result_text = result_text.replace(inline_key, f'[{ref_num}]')

    # Step 3: Also handle possessives like "Katuu's" after conversion -
    # e.g., "Katuu's review" where Katuu was not followed by (Year)
    # These remain as author names without conversion (that's fine for IEEE)

    return result_text


def _parse_ieee_segments(text):
    """Parse text into segments of plain text and citation references [N] or [N, M].
    Returns list of ('text', string) or ('cite', [list of ref_nums])."""
    segments = []
    pattern = r'\[(\d+(?:,\s*\d+)*)\]'
    last_end = 0
    for m in re.finditer(pattern, text):
        if m.start() > last_end:
            segments.append(('text', text[last_end:m.start()]))
        nums = [int(n.strip()) for n in m.group(1).split(',')]
        segments.append(('cite', nums))
        last_end = m.end()
    if last_end < len(text):
        segments.append(('text', text[last_end:]))
    return segments


def add_formatted_text_with_citations(paragraph, text):
    """Parse markdown bold/italic and convert citations to clickable IEEE [N] links."""
    # First convert all citations to IEEE format in the raw text
    ieee_text = _convert_to_ieee(text)

    # Split by bold/italic markers
    parts = re.split(r'(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*)', ieee_text)
    for part in parts:
        is_bold = False
        is_italic = False
        clean = part

        if part.startswith('***') and part.endswith('***'):
            clean = part[3:-3]
            is_bold = True
            is_italic = True
        elif part.startswith('**') and part.endswith('**'):
            clean = part[2:-2]
            is_bold = True
        elif part.startswith('*') and part.endswith('*'):
            clean = part[1:-1]
            is_italic = True

        # Parse for [N] citation references
        segments = _parse_ieee_segments(clean)
        for seg_type, seg_val in segments:
            if seg_type == 'text':
                if seg_val:
                    run = paragraph.add_run(seg_val)
                    if is_bold:
                        run.bold = True
                    if is_italic:
                        run.italic = True
            elif seg_type == 'cite':
                # Add clickable [N] or [N, M]
                nums_str = ', '.join(str(n) for n in seg_val)
                display = f'[{nums_str}]'
                # Use first ref number for the bookmark link
                bookmark_name = f'ref_{seg_val[0]}'
                add_hyperlink_to_bookmark(paragraph, bookmark_name, display, '0000CC')


# =====================================================================
# PRISMA FLOWCHART BUILDER
# =====================================================================

def set_cell_border(cell, **kwargs):
    """Set cell borders. Usage: set_cell_border(cell, top={"sz": 12, "val": "single", "color": "000000"})"""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    for edge in ('start', 'top', 'end', 'bottom', 'insideH', 'insideV'):
        if edge in kwargs:
            element = OxmlElement(f'w:{edge}')
            for attr_name, attr_val in kwargs[edge].items():
                element.set(qn(f'w:{attr_name}'), str(attr_val))
            tcBorders.append(element)
    tcPr.append(tcBorders)


def make_no_border(cell):
    """Remove all borders from a cell."""
    borders = {"sz": 0, "val": "none", "color": "FFFFFF"}
    set_cell_border(cell, top=borders, bottom=borders, start=borders, end=borders)


def make_box_border(cell):
    """Add box borders to a cell."""
    borders = {"sz": 12, "val": "single", "color": "000000"}
    set_cell_border(cell, top=borders, bottom=borders, start=borders, end=borders)


def set_cell_shading(cell, color):
    """Set cell background color."""
    shading = OxmlElement('w:shd')
    shading.set(qn('w:fill'), color)
    shading.set(qn('w:val'), 'clear')
    cell._tc.get_or_add_tcPr().append(shading)


def set_cell_width(cell, width_cm):
    """Set cell width."""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcW = OxmlElement('w:tcW')
    tcW.set(qn('w:w'), str(int(width_cm * 567)))
    tcW.set(qn('w:type'), 'dxa')
    tcPr.append(tcW)


def add_prisma_flowchart():
    """Create a professional PRISMA flowchart using nested tables."""

    # Caption
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run('Figure 2.1: PRISMA Selection Flow')
    run.bold = True
    run.font.size = Pt(11)

    doc.add_paragraph()  # spacing

    # Helper to create a styled box cell text
    def box_text(table, row, col, text, bg_color='D9E2F3', font_size=9, bold=False, width_cm=None):
        cell = table.cell(row, col)
        make_box_border(cell)
        set_cell_shading(cell, bg_color)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        if width_cm:
            set_cell_width(cell, width_cm)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.0
        run = p.add_run(text)
        run.font.size = Pt(font_size)
        run.font.name = 'Times New Roman'
        run.bold = bold
        return cell

    def empty_cell(table, row, col, width_cm=None):
        cell = table.cell(row, col)
        make_no_border(cell)
        if width_cm:
            set_cell_width(cell, width_cm)
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.0
        p.text = ''
        return cell

    def arrow_cell(table, row, col, symbol='▼', width_cm=None):
        cell = table.cell(row, col)
        make_no_border(cell)
        if width_cm:
            set_cell_width(cell, width_cm)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.0
        run = p.add_run(symbol)
        run.font.size = Pt(12)
        run.font.name = 'Times New Roman'
        return cell

    # === STAGE: IDENTIFICATION ===
    # Row 0: Stage label
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = p.add_run('IDENTIFICATION')
    run.bold = True
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor(0, 51, 102)

    t1 = doc.add_table(rows=1, cols=3)
    t1.alignment = WD_TABLE_ALIGNMENT.CENTER
    box_text(t1, 0, 0, 'Records identified through\ndatabase searching\n(n = 168)', 'D6E4F0', 9, False, 6)
    empty_cell(t1, 0, 1, 3)
    box_text(t1, 0, 2, 'Additional records identified\nthrough citation tracking\n(n = 12)', 'D6E4F0', 9, False, 6)

    # Arrow down
    t_arr = doc.add_table(rows=1, cols=1)
    t_arr.alignment = WD_TABLE_ALIGNMENT.CENTER
    arrow_cell(t_arr, 0, 0, '▼')

    # === STAGE: SCREENING ===
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = p.add_run('SCREENING')
    run.bold = True
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor(0, 51, 102)

    t2 = doc.add_table(rows=1, cols=1)
    t2.alignment = WD_TABLE_ALIGNMENT.CENTER
    box_text(t2, 0, 0, 'Records after duplicates removed\n(n = 152)', 'E2EFDA', 9, False, 10)

    t_arr2 = doc.add_table(rows=1, cols=1)
    t_arr2.alignment = WD_TABLE_ALIGNMENT.CENTER
    arrow_cell(t_arr2, 0, 0, '▼')

    t3 = doc.add_table(rows=1, cols=1)
    t3.alignment = WD_TABLE_ALIGNMENT.CENTER
    box_text(t3, 0, 0, 'Records screened by title and abstract\n(n = 152)', 'E2EFDA', 9, False, 10)

    t_arr3 = doc.add_table(rows=1, cols=3)
    t_arr3.alignment = WD_TABLE_ALIGNMENT.CENTER
    empty_cell(t_arr3, 0, 0, 5)
    arrow_cell(t_arr3, 0, 1, '▼', 3)
    empty_cell(t_arr3, 0, 2, 5)

    t4 = doc.add_table(rows=1, cols=3)
    t4.alignment = WD_TABLE_ALIGNMENT.CENTER
    box_text(t4, 0, 0, 'Records excluded\n(n = 100)', 'F4CCCC', 9, False, 6)
    arrow_cell(t4, 0, 1, '→', 1.5)
    box_text(t4, 0, 2, 'Potentially relevant\n(n = 52)', 'E2EFDA', 9, False, 6)

    # Arrow down
    t_arr4 = doc.add_table(rows=1, cols=1)
    t_arr4.alignment = WD_TABLE_ALIGNMENT.CENTER
    arrow_cell(t_arr4, 0, 0, '▼')

    # === STAGE: ELIGIBILITY ===
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = p.add_run('ELIGIBILITY')
    run.bold = True
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor(0, 51, 102)

    t5 = doc.add_table(rows=1, cols=1)
    t5.alignment = WD_TABLE_ALIGNMENT.CENTER
    box_text(t5, 0, 0, 'Full-text articles assessed for eligibility\n(n = 52)', 'FCE4D6', 9, False, 10)

    t_arr5 = doc.add_table(rows=1, cols=3)
    t_arr5.alignment = WD_TABLE_ALIGNMENT.CENTER
    empty_cell(t_arr5, 0, 0, 5)
    arrow_cell(t_arr5, 0, 1, '▼', 3)
    empty_cell(t_arr5, 0, 2, 5)

    t6 = doc.add_table(rows=1, cols=3)
    t6.alignment = WD_TABLE_ALIGNMENT.CENTER
    box_text(t6, 0, 0, 'Articles excluded (n = 27)\n\n• Not peer-reviewed (8)\n• Insufficient RQ relevance (11)\n• Low-quality venue (5)\n• Duplicated findings (3)', 'F4CCCC', 9, False, 6)
    arrow_cell(t6, 0, 1, '→', 1.5)
    box_text(t6, 0, 2, '', 'FFFFFF', 9, False, 6)
    # Overwrite the right cell for included
    cell = t6.cell(0, 2)
    make_box_border(cell)
    set_cell_shading(cell, 'C6EFCE')
    cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.0
    run = p.add_run('Studies included in\nthematic synthesis\n(n = 25)')
    run.font.size = Pt(10)
    run.font.name = 'Times New Roman'
    run.bold = True

    # === STAGE: INCLUDED ===
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = p.add_run('INCLUDED')
    run.bold = True
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor(0, 102, 0)

    doc.add_paragraph()  # spacing


# =====================================================================
# TABLE & GENERAL HELPERS
# =====================================================================

def parse_table(line_idx):
    """Parse a markdown table starting at line_idx. Returns (rows, next_idx)."""
    rows = []
    i = line_idx
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
    """Add a formatted table to the document."""
    if not rows:
        return
    num_cols = len(rows[0])
    table = doc.add_table(rows=len(rows), cols=num_cols)
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    for r_idx, row in enumerate(rows):
        for c_idx, cell_text in enumerate(row):
            if c_idx >= num_cols:
                break
            cell = table.cell(r_idx, c_idx)
            cell.text = ''
            p = cell.paragraphs[0]
            p.style = doc.styles['Normal']
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.line_spacing = 1.0

            if r_idx == 0:
                run = p.add_run(cell_text.replace('**', ''))
                run.bold = True
                run.font.size = Pt(9)
                set_cell_shading(cell, 'D9E2F3')
            else:
                add_formatted_text_with_citations(p, cell_text)
                for run in p.runs:
                    run.font.size = Pt(9)
    doc.add_paragraph()


# =====================================================================
# READ MARKDOWN
# =====================================================================

with open('SLR.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()


# =====================================================================
# PROCESS LINES
# =====================================================================

i = 0
in_code = False
code_lines = []
skip_prisma_code = False  # Flag to skip the ASCII PRISMA block

while i < len(lines):
    line = lines[i]
    stripped = line.strip()

    # Code block handling
    if stripped.startswith('```'):
        if in_code:
            # End of code block — if it was the PRISMA block, insert flowchart instead
            if skip_prisma_code:
                add_prisma_flowchart()
                skip_prisma_code = False
            code_lines = []
            in_code = False
        else:
            in_code = True
            # Check if next lines contain PRISMA content
            if i + 2 < len(lines) and 'Records identified' in lines[i + 1]:
                skip_prisma_code = True
        i += 1
        continue

    if in_code:
        if not skip_prisma_code:
            code_lines.append(line.rstrip())
        i += 1
        continue

    # Skip horizontal rules
    if stripped == '---':
        i += 1
        continue

    # Empty line
    if not stripped:
        i += 1
        continue

    # Headings
    if stripped.startswith('# '):
        doc.add_heading(stripped[2:], level=1)
        i += 1
        continue
    if stripped.startswith('## '):
        doc.add_heading(stripped[3:], level=2)
        i += 1
        continue
    if stripped.startswith('### '):
        doc.add_heading(stripped[4:], level=3)
        i += 1
        continue

    # Table
    if stripped.startswith('|'):
        rows, i = parse_table(i)
        add_table(rows)
        continue

    # Numbered list
    m = re.match(r'^(\d+)\.\s+(.*)', stripped)
    if m:
        p = doc.add_paragraph(style='List Number')
        add_formatted_text_with_citations(p, m.group(2))
        i += 1
        continue

    # Bullet list
    if stripped.startswith('- '):
        p = doc.add_paragraph(style='List Bullet')
        add_formatted_text_with_citations(p, stripped[2:])
        i += 1
        continue

    # Figure/Table caption
    if stripped.startswith('**Table') or stripped.startswith('**Figure'):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        add_formatted_text_with_citations(p, stripped)
        i += 1
        continue

    # Reference entries [N] — add bookmarks
    ref_match = re.match(r'^\[(\d+)\]\s+(.*)', stripped)
    if ref_match:
        ref_num = int(ref_match.group(1))
        ref_text = ref_match.group(2)
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.5)
        p.paragraph_format.first_line_indent = Inches(-0.5)
        run = p.add_run(f'[{ref_num}] ')
        run.bold = True
        run.font.size = Pt(11)
        # Add bookmark
        bookmark_name = f'ref_{ref_num}'
        add_bookmark(p, bookmark_name)
        # Add the rest of the reference text with italic handling
        add_formatted_text_with_citations(p, ref_text)
        i += 1
        continue

    # Regular paragraph
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    add_formatted_text_with_citations(p, stripped)
    i += 1


# =====================================================================
# SET MARGINS & SAVE
# =====================================================================

for section in doc.sections:
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1.25)
    section.right_margin = Inches(1.25)

doc.save('SLR.docx')
print("SLR.docx created successfully!")
print("  - PRISMA flowchart: visual boxes with color-coded stages")
print("  - Citations: clickable links (Ctrl+Click) to jump to references")
