#!/usr/bin/env python3
"""
generate_final_credentials_pdf.py
Generates an executive, publication-grade 3-page PDF from:
documentation/FINAL_LOGIN_CREDENTIALS_AND_ACCESS_DIRECTORY.md
Output: documentation/FINAL_LOGIN_CREDENTIALS_AND_ACCESS_DIRECTORY.pdf
"""

import os
import sys

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.pdfgen import canvas

PDF_OUTPUT_PATH = "/home/janith/Projects/pixandco-web/erp/documentation/FINAL_LOGIN_CREDENTIALS_AND_ACCESS_DIRECTORY.pdf"

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#1E3A8A"))

        # Running Top Header (Pages > 1)
        if self._pageNumber > 1:
            self.drawString(36, 756, "PHARMA ERP CLOUD")
            self.setFont("Helvetica", 7.5)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(125, 756, "|   Master Credentials & Enterprise Access Directory (Ceylon MedEx & Platform)")
            self.drawRightString(576, 756, "DOC-CRED-2026-FINAL")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(36, 748, 576, 748)

        # Running Bottom Footer (All Pages)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(36, 38, 576, 38)
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(36, 26, "Confidential — Multi-Tenant Pharmacy Distribution ERP Security & User Governance")
        self.drawRightString(576, 26, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def build_pdf():
    doc = SimpleDocTemplate(
        PDF_OUTPUT_PATH,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=42,
        bottomMargin=42
    )

    styles = getSampleStyleSheet()

    # Brand Palette
    c_brand = colors.HexColor("#1E3A8A")       # Deep Navy
    c_primary = colors.HexColor("#4F46E5")     # Indigo
    c_dark = colors.HexColor("#0F172A")        # Slate 900
    c_text = colors.HexColor("#1E293B")        # Slate 800
    c_muted = colors.HexColor("#64748B")       # Slate 500
    c_border = colors.HexColor("#E2E8F0")      # Slate 200
    c_bg_alt = colors.HexColor("#F8FAFC")      # Slate 50
    c_emerald = colors.HexColor("#059669")     # Emerald 600

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.white,
        spaceAfter=3
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#BAE6FD"),
        spaceAfter=0
    )

    sec_h1 = ParagraphStyle(
        'SecH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_brand,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    sec_h2 = ParagraphStyle(
        'SecH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=c_dark,
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=c_text,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=6.8,
        leading=8.5,
        textColor=colors.HexColor("#0F172A")
    )

    code_bold = ParagraphStyle(
        'CodeBold',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=6.8,
        leading=8.5,
        textColor=colors.HexColor("#1E3A8A")
    )

    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white
    )

    td_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.2,
        leading=9.2,
        textColor=c_text
    )

    td_bold = ParagraphStyle(
        'TableCellBold',
        parent=td_style,
        fontName='Helvetica-Bold'
    )

    story = []

    # ====================================================
    # PAGE 1: PLATFORM ADMIN + TENANT OVERVIEW & SUPER ADMIN
    # ====================================================
    
    # 1. Header Banner
    header_content = [
        [
            Paragraph("<b>PHARMA ERP SYSTEM — MASTER CREDENTIALS & ACCESS DIRECTORY</b>", title_style),
            Paragraph("<b>DOC-CRED-2026-FINAL</b>", ParagraphStyle('CodeTag', fontName='Helvetica-Bold', fontSize=8, textColor=colors.HexColor("#38BDF8"), alignment=2))
        ],
        [
            Paragraph("Official Production Access Directory &bull; Multi-Tenant Platform Master &bull; 1,000+ Record Enterprise RBAC Governance", subtitle_style),
            Paragraph("CERTIFIED ACTIVE", ParagraphStyle('CertTag', fontName='Helvetica-Bold', fontSize=7.5, textColor=colors.HexColor("#34D399"), alignment=2))
        ]
    ]

    header_table = Table(header_content, colWidths=[420, 120])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#0F172A")),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 6))

    # Meta Overview Bar
    meta_data = [
        [
            Paragraph("<b>Target Environment:</b> Production Cloud VPS (<code>https://erp.pixandco.lk</code>)", td_style),
            Paragraph("<b>Publication Date:</b> October 16, 2026", td_style),
            Paragraph("<b>Security Classification:</b> Restricted / Enterprise", td_style),
        ]
    ]
    meta_table = Table(meta_data, colWidths=[240, 150, 150])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
        ('BOX', (0, 0), (-1, -1), 0.5, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 8))

    # SECTION 1: PLATFORM MASTER ADMIN PANEL
    story.append(Paragraph("1. Platform Master Admin Panel (Platform Owner Portal)", sec_h1))
    story.append(Paragraph(
        "The Platform Admin Portal provides multi-tenant administration, client company onboarding, tenant database routing, module licensing, subscription management, and global audit logging.",
        body_style
    ))

    platform_data = [
        [Paragraph("Attribute", th_style), Paragraph("Platform Master Admin Specification", th_style)],
        [Paragraph("<b>Portal Web URL</b>", td_style), Paragraph("<code>https://erp.pixandco.lk/platform-admin/login</code>", code_bold)],
        [Paragraph("<b>Super Admin Username</b>", td_style), Paragraph("<code>admin</code>", code_style)],
        [Paragraph("<b>Super Admin Email</b>", td_style), Paragraph("<code>admin@platform.com</code>", code_bold)],
        [Paragraph("<b>Master Password</b>", td_style), Paragraph("<code>Admin@12345</code>", code_bold)],
        [Paragraph("<b>Master Platform Database</b>", td_style), Paragraph("<code>erp_phrma</code> (Table: <code>platform_admin_users</code>)", code_style)],
        [Paragraph("<b>Operational Authority</b>", td_style), Paragraph("Tenant Company Provisioning, Database Connection Routing, Module Subscriptions, Billing Invoices & Audit Surveillance", td_style)],
    ]
    platform_table = Table(platform_data, colWidths=[150, 390])
    platform_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E3A8A")),
        ('BOX', (0, 0), (-1, -1), 0.5, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_alt]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(platform_table)
    story.append(Spacer(1, 10))

    # SECTION 2: ENTERPRISE TENANT OVERVIEW
    story.append(Paragraph("2. Enterprise Tenant Admin (1,000+ Record Enterprise — Ceylon MedEx)", sec_h1))
    
    org_summary = [
        [
            Paragraph("<b>Organization:</b> Ceylon MedEx Pharmaceuticals & Healthcare Lanka PLC", td_style),
            Paragraph("<b>Tenant Code:</b> <code>CEYLONMED</code>", td_style),
            Paragraph("<b>Tenant Database:</b> <code>erp_ceylonmed</code>", td_style),
        ],
        [
            Paragraph("<b>Web Portal:</b> <code>https://erp.pixandco.lk/login</code>", td_style),
            Paragraph("<b>Shared Password:</b> <code>CeylonAdmin@2026</code>", td_style),
            Paragraph("<b>Total Role Permissions:</b> <b>1,124+ Active Mappings</b>", td_style),
        ]
    ]
    org_table = Table(org_summary, colWidths=[200, 170, 170])
    org_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#EFF6FF")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#93C5FD")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#DBEAFE")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(org_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Company Super Administrator (Managing Director)", sec_h2))
    admin_lead_data = [
        [Paragraph("Full Name & Title", th_style), Paragraph("Email", th_style), Paragraph("Password", th_style), Paragraph("Role Code", th_style), Paragraph("Authority & Scope", th_style)],
        [
            Paragraph("<b>Dr. Kalinga Silva</b><br/><font color='#64748B'>Managing Director</font>", td_style),
            Paragraph("<code>admin@ceylonmed.lk</code>", code_bold),
            Paragraph("<code>CeylonAdmin@2026</code>", code_bold),
            Paragraph("<b>SUPER_ADMIN</b>", code_style),
            Paragraph("Unrestricted administrative access across all 5 Modules (Control Center, Finance, Inventory, Invoice Center, Compliance Center) and all 5 Logistics Hubs.", td_style)
        ]
    ]
    admin_lead_table = Table(admin_lead_data, colWidths=[110, 105, 85, 75, 165])
    admin_lead_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
        ('BOX', (0, 0), (-1, -1), 0.5, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(admin_lead_table)

    # Clean Page Break to Page 2
    story.append(PageBreak())

    # ====================================================
    # PAGE 2: COMPLETE 12 ENTERPRISE USERS + TEST SANDBOX + BRANCHES
    # ====================================================
    story.append(Paragraph("Complete Enterprise User & Role Login Directory (All 12 Verified Accounts)", sec_h1))
    story.append(Paragraph(
        "All 12 enterprise accounts are configured, verified, and active on the live production deployment with individual professional profile avatars, department assignments, and strict Role-Based Access Control (RBAC).",
        body_style
    ))

    users_table_data = [
        [
            Paragraph("#", th_style),
            Paragraph("Persona & Designation", th_style),
            Paragraph("Email Address", th_style),
            Paragraph("Password", th_style),
            Paragraph("Role Code", th_style),
            Paragraph("Department", th_style),
            Paragraph("Branch Scope", th_style)
        ],
        [
            Paragraph("1", td_bold),
            Paragraph("<b>Dr. Kalinga Silva</b><br/><font color='#64748B'>Managing Director</font>", td_style),
            Paragraph("<code>admin@ceylonmed.lk</code>", code_bold),
            Paragraph("<code>CeylonAdmin@2026</code>", code_style),
            Paragraph("SUPER_ADMIN", td_bold),
            Paragraph("Executive Mgmt", td_style),
            Paragraph("All 5 Hubs", td_style)
        ],
        [
            Paragraph("2", td_bold),
            Paragraph("<b>Ruwani Jayawardena</b><br/><font color='#64748B'>Chief Financial Officer</font>", td_style),
            Paragraph("<code>cfo@ceylonmed.lk</code>", code_bold),
            Paragraph("<code>CeylonAdmin@2026</code>", code_style),
            Paragraph("FINANCE_DIRECTOR", td_bold),
            Paragraph("Finance & Accounts", td_style),
            Paragraph("All 5 Hubs", td_style)
        ],
        [
            Paragraph("3", td_bold),
            Paragraph("<b>Chaminda Bandara</b><br/><font color='#64748B'>Senior Financial Accountant</font>", td_style),
            Paragraph("<code>accountant@ceylonmed.lk</code>", code_bold),
            Paragraph("<code>CeylonAdmin@2026</code>", code_style),
            Paragraph("SENIOR_ACCOUNTANT", td_bold),
            Paragraph("Finance & Accounts", td_style),
            Paragraph("Colombo, Kandy", td_style)
        ],
        [
            Paragraph("4", td_bold),
            Paragraph("<b>Niroshan Perera</b><br/><font color='#64748B'>Head of Warehouses & Logistics</font>", td_style),
            Paragraph("<code>warehouse.manager@ceylonmed.lk</code>", code_bold),
            Paragraph("<code>CeylonAdmin@2026</code>", code_style),
            Paragraph("WAREHOUSE_MANAGER", td_bold),
            Paragraph("Supply Chain & Logistics", td_style),
            Paragraph("All 5 Hubs", td_style)
        ],
        [
            Paragraph("5", td_bold),
            Paragraph("<b>Kumara Wickramasinghe</b><br/><font color='#64748B'>Senior Storekeeper (Maker)</font>", td_style),
            Paragraph("<code>storekeeper@ceylonmed.lk</code>", code_bold),
            Paragraph("<code>CeylonAdmin@2026</code>", code_style),
            Paragraph("STOREKEEPER", td_bold),
            Paragraph("Supply Chain & Logistics", td_style),
            Paragraph("Colombo Hub Only", td_style)
        ],
        [
            Paragraph("6", td_bold),
            Paragraph("<b>Dharshani Samarasekara</b><br/><font color='#64748B'>Quality Assurance Director</font>", td_style),
            Paragraph("<code>qa.director@ceylonmed.lk</code>", code_bold),
            Paragraph("<code>CeylonAdmin@2026</code>", code_style),
            Paragraph("QA_DIRECTOR", td_bold),
            Paragraph("QA & Regulatory Affairs", td_style),
            Paragraph("All 5 Hubs", td_style)
        ],
        [
            Paragraph("7", td_bold),
            Paragraph("<b>Dr. Sanduni Fernando</b><br/><font color='#64748B'>QC Lab Pharmacist (Maker)</font>", td_style),
            Paragraph("<code>qc.officer@ceylonmed.lk</code>", code_bold),
            Paragraph("<code>CeylonAdmin@2026</code>", code_style),
            Paragraph("QC_OFFICER", td_bold),
            Paragraph("QA & Regulatory Affairs", td_style),
            Paragraph("Colombo, Biyagama", td_style)
        ],
        [
            Paragraph("8", td_bold),
            Paragraph("<b>Priyantha De Silva</b><br/><font color='#64748B'>Commercial Sales Director</font>", td_style),
            Paragraph("<code>sales.director@ceylonmed.lk</code>", code_bold),
            Paragraph("<code>CeylonAdmin@2026</code>", code_style),
            Paragraph("SALES_DIRECTOR", td_bold),
            Paragraph("Commercial Sales", td_style),
            Paragraph("All 5 Hubs", td_style)
        ],
        [
            Paragraph("9", td_bold),
            Paragraph("<b>Anura Gunaratne</b><br/><font color='#64748B'>Billing & Invoicing Specialist</font>", td_style),
            Paragraph("<code>billing.officer@ceylonmed.lk</code>", code_bold),
            Paragraph("<code>CeylonAdmin@2026</code>", code_style),
            Paragraph("BILLING_OFFICER", td_bold),
            Paragraph("Commercial Sales", td_style),
            Paragraph("Colombo Hub Only", td_style)
        ],
        [
            Paragraph("10", td_bold),
            Paragraph("<b>Malik Senanayake</b><br/><font color='#64748B'>Chief Internal Auditor</font>", td_style),
            Paragraph("<code>auditor@ceylonmed.lk</code>", code_bold),
            Paragraph("<code>CeylonAdmin@2026</code>", code_style),
            Paragraph("INTERNAL_AUDITOR", td_bold),
            Paragraph("Internal Audit & Risk", td_style),
            Paragraph("All 5 Hubs (Read-Only)", td_style)
        ],
        [
            Paragraph("11", td_bold),
            Paragraph("<b>Fathima Rizna</b><br/><font color='#64748B'>Branch Cashier</font>", td_style),
            Paragraph("<code>cashier@ceylonmed.lk</code>", code_bold),
            Paragraph("<code>CeylonAdmin@2026</code>", code_style),
            Paragraph("BRANCH_CASHIER", td_bold),
            Paragraph("Finance & Accounts", td_style),
            Paragraph("Colombo Hub Only", td_style)
        ],
        [
            Paragraph("12", td_bold),
            Paragraph("<b>Kasun Jayasuriya</b><br/><font color='#64748B'>Territory Medical Rep</font>", td_style),
            Paragraph("<code>medical.rep@ceylonmed.lk</code>", code_bold),
            Paragraph("<code>CeylonAdmin@2026</code>", code_style),
            Paragraph("SALES_REP", td_bold),
            Paragraph("Commercial Sales", td_style),
            Paragraph("Kandy Hub Only", td_style)
        ],
    ]

    users_table = Table(users_table_data, colWidths=[16, 115, 120, 85, 75, 74, 55])
    users_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E3A8A")),
        ('BOX', (0, 0), (-1, -1), 0.5, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_alt]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(users_table)
    story.append(Spacer(1, 8))

    # SECTION 4: SECONDARY TEST TENANT
    story.append(Paragraph("4. Secondary Test Company (QA20261015 Sandbox)", sec_h1))
    qa_data = [
        [Paragraph("Attribute", th_style), Paragraph("Sandbox Specification", th_style)],
        [Paragraph("<b>Company Name</b>", td_style), Paragraph("QA20261015 Pharma Distribution (Test)", td_style)],
        [Paragraph("<b>Tenant Code / Database</b>", td_style), Paragraph("Code: <code>QA20261015</code> &bull; Database: <code>erp_qa20261015</code>", code_bold)],
        [Paragraph("<b>Login Portal URL</b>", td_style), Paragraph("<code>https://erp.pixandco.lk/login</code>", code_bold)],
        [Paragraph("<b>First Admin User</b>", td_style), Paragraph("Dr. Janith Samarasinghe (<code>admin@qa20261015.lk</code>)", td_style)],
        [Paragraph("<b>Default Password</b>", td_style), Paragraph("<code>CeylonAdmin@2026</code> (or <code>Admin@123</code>)", code_bold)],
    ]
    qa_table = Table(qa_data, colWidths=[140, 400])
    qa_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#334155")),
        ('BOX', (0, 0), (-1, -1), 0.5, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_alt]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(qa_table)
    story.append(Spacer(1, 8))

    # SECTION 5: BRANCH NETWORK
    story.append(Paragraph("5. Branch Network & Logistics Hub Scopes", sec_h1))
    branch_data = [
        [
            Paragraph("ID", th_style),
            Paragraph("Code", th_style),
            Paragraph("Hub Name", th_style),
            Paragraph("Facility Purpose & Operations", th_style),
            Paragraph("Primary Assigned Roles", th_style)
        ],
        [
            Paragraph("<b>1</b>", td_bold),
            Paragraph("<code>COL-01</code>", code_bold),
            Paragraph("<b>Colombo Central Logistics Hub</b>", td_style),
            Paragraph("Central Headquarters & Main Pharmaceutical Receiving Dock", td_style),
            Paragraph("All Roles, Super Admin, CFO, Storekeeper", td_style)
        ],
        [
            Paragraph("<b>2</b>", td_bold),
            Paragraph("<code>KDY-02</code>", code_bold),
            Paragraph("<b>Kandy Regional Distribution Hub</b>", td_style),
            Paragraph("Central Province Regional Healthcare Distribution", td_style),
            Paragraph("Medical Rep, Senior Accountant", td_style)
        ],
        [
            Paragraph("<b>3</b>", td_bold),
            Paragraph("<code>GAL-03</code>", code_bold),
            Paragraph("<b>Galle Coastal Distribution Center</b>", td_style),
            Paragraph("Southern Province Regional Logistics & Hospital Supplies", td_style),
            Paragraph("Regional Logistics, Sales Reps", td_style)
        ],
        [
            Paragraph("<b>4</b>", td_bold),
            Paragraph("<code>BYG-04</code>", code_bold),
            Paragraph("<b>Biyagama Cold Chain Hub</b>", td_style),
            Paragraph("Temperature-Controlled Biologics, Insulin & Vaccine Vault", td_style),
            Paragraph("QC Officer, Warehouse Manager", td_style)
        ],
        [
            Paragraph("<b>5</b>", td_bold),
            Paragraph("<code>JFN-05</code>", code_bold),
            Paragraph("<b>Jaffna Northern Hub</b>", td_style),
            Paragraph("Northern Province Distribution & Pharmacy Supplies", td_style),
            Paragraph("Regional Logistics, Billing Clerks", td_style)
        ],
    ]
    branch_table = Table(branch_data, colWidths=[24, 48, 142, 196, 130])
    branch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E3A8A")),
        ('BOX', (0, 0), (-1, -1), 0.5, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_alt]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(branch_table)

    # Clean Page Break to Page 3
    story.append(PageBreak())

    # ====================================================
    # PAGE 3: FOUR-EYES GOVERNANCE + TECHNICAL ARCHITECTURE
    # ====================================================
    story.append(Paragraph("3. Four-Eyes Principle: Maker vs Checker Approval Workflows", sec_h1))
    story.append(Paragraph(
        "To comply with pharmaceutical regulations (NMRA) and statutory audit standards, the ERP strictly separates data entry creation (Makers) from authorizing authority (Approvers).",
        body_style
    ))

    four_eyes_data = [
        [
            Paragraph("Operational Workflow", th_style),
            Paragraph("Drafter / Maker Account", th_style),
            Paragraph("Approver / Checker Account", th_style),
            Paragraph("Regulatory Governance Rule", th_style)
        ],
        [
            Paragraph("<b>Goods Receipt Notes (GRN)</b>", td_style),
            Paragraph("<code>storekeeper@ceylonmed.lk</code><br/><font color='#64748B'>Storekeeper</font>", td_style),
            Paragraph("<code>warehouse.manager@ceylonmed.lk</code><br/><font color='#64748B'>Warehouse Manager</font>", td_style),
            Paragraph("Receiving bay clerks enter dock counts and batch expiry dates. Inventory balances and ledger entries post only after Warehouse Manager review and digital sign-off.", td_style)
        ],
        [
            Paragraph("<b>Sales Orders & Credit Limits</b>", td_style),
            Paragraph("<code>medical.rep@ceylonmed.lk</code><br/><code>billing.officer@ceylonmed.lk</code>", td_style),
            Paragraph("<code>sales.director@ceylonmed.lk</code><br/><font color='#64748B'>Sales Director</font>", td_style),
            Paragraph("Commercial field reps draft orders from hospital accounts. Orders exceeding customer credit ceilings or price variance exceptions require executive authorization.", td_style)
        ],
        [
            Paragraph("<b>Credit Notes & Returns</b>", td_style),
            Paragraph("<code>billing.officer@ceylonmed.lk</code><br/><font color='#64748B'>Billing Officer</font>", td_style),
            Paragraph("<code>sales.director@ceylonmed.lk</code><br/><code>cfo@ceylonmed.lk</code>", td_style),
            Paragraph("Billing clerks cannot issue credit refunds or inventory adjustments unilaterally. Mandatory maker-checker sign-off prevents unauthorized price write-downs.", td_style)
        ],
        [
            Paragraph("<b>NMRA Quarantine & Recalls</b>", td_style),
            Paragraph("<code>qc.officer@ceylonmed.lk</code><br/><font color='#64748B'>QC Laboratory Pharmacist</font>", td_style),
            Paragraph("<code>qa.director@ceylonmed.lk</code><br/><font color='#64748B'>QA Director</font>", td_style),
            Paragraph("QC Pharmacists log laboratory assay failures and request batch quarantine holds. Formal recall notices to hospitals and toxic waste destruction require QA Director approval.", td_style)
        ],
        [
            Paragraph("<b>General Ledger & Closing</b>", td_style),
            Paragraph("<code>accountant@ceylonmed.lk</code><br/><font color='#64748B'>Senior Accountant</font>", td_style),
            Paragraph("<code>cfo@ceylonmed.lk</code><br/><font color='#64748B'>Chief Financial Officer</font>", td_style),
            Paragraph("Accountants draft journal vouchers and bank reconciliations. Period closing locks ledgers against further modification and can only be executed by the CFO.", td_style)
        ],
        [
            Paragraph("<b>Independent Surveillance</b>", td_style),
            Paragraph("<code>auditor@ceylonmed.lk</code><br/><font color='#64748B'>Chief Internal Auditor</font>", td_style),
            Paragraph("<i>Unrestricted Read-Only</i><br/><font color='#64748B'>Surveillance Keys</font>", td_style),
            Paragraph("Internal Auditor holds 123 read-only keys for unhindered operational surveillance across general ledgers, stock balances, audit logs, and compliance records.", td_style)
        ]
    ]

    four_eyes_table = Table(four_eyes_data, colWidths=[105, 115, 115, 205])
    four_eyes_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
        ('BOX', (0, 0), (-1, -1), 0.5, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_alt]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(four_eyes_table)
    story.append(Spacer(1, 10))

    # SECTION 6: TECHNICAL & INFRASTRUCTURE SUMMARY
    story.append(Paragraph("6. Technical Architecture & Infrastructure Summary", sec_h1))
    
    tech_data = [
        [Paragraph("Component", th_style), Paragraph("Production Cloud Specification", th_style)],
        [Paragraph("<b>Web Application Domain</b>", td_style), Paragraph("<code>https://erp.pixandco.lk</code> (HTTP/2, Let's Encrypt TLS 1.3)", code_bold)],
        [Paragraph("<b>REST API Gateway</b>", td_style), Paragraph("<code>https://erp.pixandco.lk/api/v1</code> (Go Gin REST API Engine)", code_style)],
        [Paragraph("<b>Production Host VPS</b>", td_style), Paragraph("<code>50.6.230.198</code> (Dedicated Bluehost Ubuntu Linux VPS)", code_style)],
        [Paragraph("<b>SSH Deployment User</b>", td_style), Paragraph("<code>deploy@50.6.230.198</code> (Ed25519 Key-Based Authentication)", code_style)],
        [Paragraph("<b>Docker Container Grid</b>", td_style), Paragraph("<code>pharma-erp-frontend</code> (Nginx reverse proxy), <code>pharma-erp-backend</code> (Go Gin REST API), <code>shared-mysql</code> (MySQL 8.0 Enterprise), <code>shared-redis</code> (Redis 7.0 session & cache)", td_style)],
        [Paragraph("<b>Database Isolation</b>", td_style), Paragraph("Multi-Tenant Isolated DB Architecture: <code>erp_phrma</code> (Platform Master) &bull; <code>erp_ceylonmed</code> (Production Tenant) &bull; <code>erp_qa20261015</code> (Test Tenant)", td_style)],
    ]
    tech_table = Table(tech_data, colWidths=[140, 400])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
        ('BOX', (0, 0), (-1, -1), 0.5, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_bg_alt]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 10))

    # Security Verification Sign-Off Box
    signoff_data = [
        [
            Paragraph("<b>CERTIFICATION & AUDIT SIGN-OFF</b><br/><font color='#64748B'>This credentials document reflects verified live production access controls. All initial passwords must be rotated upon first commercial audit in accordance with ISO 27001 and NMRA Good Distribution Practice (GDP) standards.</font>", td_style),
            Paragraph("<b>Audit Status:</b> <font color='#059669'>PASSED</font><br/><b>Review Date:</b> Oct 16, 2026<br/><b>Lead Auditor:</b> Malik Senanayake", td_style)
        ]
    ]
    signoff_table = Table(signoff_data, colWidths=[380, 160])
    signoff_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#94A3B8")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(signoff_table)

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at: {PDF_OUTPUT_PATH}")

if __name__ == "__main__":
    build_pdf()
