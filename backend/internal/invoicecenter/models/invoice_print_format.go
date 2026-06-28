package models

import (
	"time"

	"gorm.io/gorm"
)

type InvoicePrintFormat struct {
	ID                   uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	CompanyID            uint64         `gorm:"not null;index" json:"company_id"`
	BranchID             *uint64        `gorm:"index" json:"branch_id"`
	FormatName           string         `gorm:"type:varchar(150);not null" json:"format_name"`
	DocumentType         string         `gorm:"type:varchar(50);not null;index" json:"document_type"`
	PaperSize            string         `gorm:"type:varchar(30);default:'A4'" json:"paper_size"`
	Orientation          string         `gorm:"type:varchar(20);default:'portrait'" json:"orientation"`
	LogoPosition         string         `gorm:"type:varchar(30);default:'left'" json:"logo_position"`
	HeaderLayout         string         `gorm:"type:varchar(50);default:'standard'" json:"header_layout"`
	FooterLayout         string         `gorm:"type:varchar(50);default:'standard'" json:"footer_layout"`
	PrimaryColor         string         `gorm:"type:varchar(20);default:'#2563eb'" json:"primary_color"`
	FontFamily           string         `gorm:"type:varchar(80);default:'Inter'" json:"font_family"`
	ShowCompanyLogo      bool           `gorm:"default:true" json:"show_company_logo"`
	ShowCompanyName      bool           `gorm:"default:true" json:"show_company_name"`
	ShowBranchDetails    bool           `gorm:"default:true" json:"show_branch_details"`
	ShowCustomerDetails  bool           `gorm:"default:true" json:"show_customer_details"`
	ShowDocumentStatus   bool           `gorm:"default:true" json:"show_document_status"`
	ShowPaymentTerms     bool           `gorm:"default:true" json:"show_payment_terms"`
	ShowBankDetails      bool           `gorm:"default:false" json:"show_bank_details"`
	ShowSignatureSection bool           `gorm:"default:true" json:"show_signature_section"`
	ShowQRCode           bool           `gorm:"default:false" json:"show_qr_code"`
	TermsAndConditions   string         `gorm:"type:text" json:"terms_and_conditions"`
	FooterNote           string         `gorm:"type:text" json:"footer_note"`
	IsDefault            bool           `gorm:"default:false;index" json:"is_default"`
	IsActive             bool           `gorm:"default:true;index" json:"is_active"`
	CreatedBy            *uint64        `json:"created_by"`
	UpdatedBy            *uint64        `json:"updated_by"`
	CreatedAt            time.Time      `json:"created_at"`
	UpdatedAt            time.Time      `json:"updated_at"`
	DeletedAt            gorm.DeletedAt `gorm:"index" json:"-"`

	Fields []InvoicePrintFormatField `gorm:"foreignKey:PrintFormatID" json:"fields"`
}

func (InvoicePrintFormat) TableName() string {
	return "invoice_print_formats"
}

type InvoicePrintFormatField struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	PrintFormatID uint64    `gorm:"not null;index" json:"print_format_id"`
	FieldKey      string    `gorm:"type:varchar(80);not null" json:"field_key"`
	FieldLabel    string    `gorm:"type:varchar(120);not null" json:"field_label"`
	IsVisible     bool      `gorm:"default:true" json:"is_visible"`
	DisplayOrder  int       `gorm:"default:1" json:"display_order"`
	ColumnWidth   int       `gorm:"default:120" json:"column_width"`
	Alignment     string    `gorm:"type:varchar(20);default:'left'" json:"alignment"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (InvoicePrintFormatField) TableName() string {
	return "invoice_print_format_fields"
}
