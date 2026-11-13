"""Generate clearly labeled sample resume downloads. Requires reportlab."""
from pathlib import Path
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'src' / 'resumes'
OUTPUT.mkdir(exist_ok=True)
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='PersonName', fontName='Times-Roman', fontSize=28, leading=32, textColor=colors.HexColor('#30342e'), spaceAfter=8))
styles.add(ParagraphStyle(name='RoleTitle', fontName='Helvetica', fontSize=12, leading=17, textColor=colors.HexColor('#3d6660'), spaceAfter=15))
styles.add(ParagraphStyle(name='SectionTitle', fontName='Helvetica-Bold', fontSize=10, leading=15, spaceBefore=18, spaceAfter=8, textColor=colors.HexColor('#30342e')))
styles.add(ParagraphStyle(name='Copy', fontName='Helvetica', fontSize=10, leading=15, spaceAfter=7))
styles.add(ParagraphStyle(name='Sample', fontName='Helvetica', fontSize=9, leading=13, textColor=colors.HexColor('#697165'), spaceAfter=10))

def paragraph(text, style='Copy'):
    return Paragraph(text, styles[style])

def make(filename, role, focus, projects):
    doc=SimpleDocTemplate(str(OUTPUT/filename),pagesize=(612,792),rightMargin=52,leftMargin=52,topMargin=46,bottomMargin=44,title=f'Stella Hwang - {role} - SAMPLE',author='Stella Hwang',subject='Illustrative resume layout, not verified professional history')
    story=[paragraph('Stella Hwang','PersonName'),paragraph(role,'RoleTitle'),paragraph('SAMPLE RESUME | Website preview only','Sample'),paragraph('This is an illustrative resume layout. Employment, education, skills, and project descriptions have not been verified. This document is not intended for job applications.','Sample'),HRFlowable(width='100%',thickness=.5,color=colors.HexColor('#e0e5da')),paragraph('PROFILE','SectionTitle'),paragraph(focus),paragraph('EXPERIENCE','SectionTitle'),paragraph('<b>Software &amp; Infrastructure Engineer</b>'),paragraph('Organization and dates to be added.','Sample'),paragraph('Replace this entry with confirmed responsibilities, technical contributions, and outcomes. No employer or employment dates are claimed in this sample.'),paragraph('ILLUSTRATIVE PROJECTS','SectionTitle')]
    for title, text in projects:
        story.extend([paragraph(f'<b>{title}</b>'), paragraph(text)])
    story.extend([paragraph('EDUCATION','SectionTitle'),paragraph('Institution, degree, and dates to be added.','Sample'),paragraph('CONTACT','SectionTitle'),paragraph('Public contact information will be added to the website.','Sample')])
    def footer(c, d):
        c.saveState();c.setFont('Helvetica',8);c.setFillColor(colors.HexColor('#697165'));c.drawString(52,28,'SAMPLE ONLY - Replace with verified resume before sharing professionally.');c.drawRightString(560,28,str(d.page));c.restoreState()
    doc.build(story,onFirstPage=footer,onLaterPages=footer)

make('stella-hwang-ai-infrastructure-sample.pdf','AI & Infrastructure Engineer','Software and infrastructure engineer focused on AI and data, with an interest in agentic systems. Values reliability, observability, and recovery as foundations for confident experimentation.',[
 ('Agent Trace Explorer (concept)','Connect model calls, tool outputs, and retries in a task timeline so an operator can identify where an agent went off course.'),
 ('Data Pipeline Checks (concept)','Organize freshness, completeness, and schema checks around actionable failures and clear recovery steps.')])
make('stella-hwang-full-stack-sample.pdf','Full Stack Engineer','Software engineer interested in building useful applications from interface to backend. Focuses on understandable behavior, clear data models, and dependable product experiences.',[
 ('Experiment Log (concept)','A proposed workspace that keeps experiment configurations, results, and notes together for straightforward comparison.'),
 ('Personal Website (current site)','A static personal website with accessible navigation, original sample notes, responsive layouts, and downloadable sample resumes.')])
print('Generated 2 sample PDFs.')
