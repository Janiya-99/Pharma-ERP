package services

import (
	"errors"

	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/repositories"
	"gorm.io/gorm"
)

type PrintFormatService struct {
	repo *repositories.PrintFormatRepository
}

func NewPrintFormatService(repo *repositories.PrintFormatRepository) *PrintFormatService {
	return &PrintFormatService{repo: repo}
}

var validPrintDocumentTypes = map[string]bool{
	"sales_order":      true,
	"proforma_invoice": true,
	"sales_invoice":    true,
	"credit_note":      true,
	"debit_note":       true,
	"customer_receipt": true,
}

func defaultPrintFields() []models.InvoicePrintFormatField {
	fields := []struct {
		key   string
		label string
		width int
		align string
	}{
		{"line_no", "No", 60, "center"},
		{"product_code", "Code", 110, "left"},
		{"product_name", "Product", 220, "left"},
		{"batch_number", "Batch", 110, "left"},
		{"expiry_date", "Expiry", 100, "center"},
		{"quantity", "Qty", 90, "right"},
		{"unit_price", "Unit Price", 110, "right"},
		{"discount_amount", "Discount", 110, "right"},
		{"tax_amount", "Tax", 100, "right"},
		{"line_total", "Total", 120, "right"},
	}
	result := make([]models.InvoicePrintFormatField, 0, len(fields))
	for idx, field := range fields {
		result = append(result, models.InvoicePrintFormatField{
			FieldKey:     field.key,
			FieldLabel:   field.label,
			IsVisible:    true,
			DisplayOrder: idx + 1,
			ColumnWidth:  field.width,
			Alignment:    field.align,
		})
	}
	return result
}

func normalizePrintFormat(req dto.PrintFormatRequest, companyID, userID uint64, existing *models.InvoicePrintFormat) (*models.InvoicePrintFormat, error) {
	if !validPrintDocumentTypes[req.DocumentType] {
		return nil, errors.New("invalid document_type")
	}
	if req.PaperSize == "" {
		req.PaperSize = "A4"
	}
	if req.Orientation == "" {
		req.Orientation = "portrait"
	}
	if req.LogoPosition == "" {
		req.LogoPosition = "left"
	}
	if req.HeaderLayout == "" {
		req.HeaderLayout = "standard"
	}
	if req.FooterLayout == "" {
		req.FooterLayout = "standard"
	}
	if req.PrimaryColor == "" {
		req.PrimaryColor = "#2563eb"
	}
	if req.FontFamily == "" {
		req.FontFamily = "Inter"
	}

	format := existing
	if format == nil {
		format = &models.InvoicePrintFormat{
			CompanyID: companyID,
			CreatedBy: &userID,
		}
	}
	format.BranchID = req.BranchID
	format.FormatName = req.FormatName
	format.DocumentType = req.DocumentType
	format.PaperSize = req.PaperSize
	format.Orientation = req.Orientation
	format.LogoPosition = req.LogoPosition
	format.HeaderLayout = req.HeaderLayout
	format.FooterLayout = req.FooterLayout
	format.PrimaryColor = req.PrimaryColor
	format.FontFamily = req.FontFamily
	format.ShowCompanyLogo = req.ShowCompanyLogo
	format.ShowCompanyName = req.ShowCompanyName
	format.ShowBranchDetails = req.ShowBranchDetails
	format.ShowCustomerDetails = req.ShowCustomerDetails
	format.ShowDocumentStatus = req.ShowDocumentStatus
	format.ShowPaymentTerms = req.ShowPaymentTerms
	format.ShowBankDetails = req.ShowBankDetails
	format.ShowSignatureSection = req.ShowSignatureSection
	format.ShowQRCode = req.ShowQRCode
	format.TermsAndConditions = req.TermsAndConditions
	format.FooterNote = req.FooterNote
	format.IsDefault = req.IsDefault
	format.IsActive = req.IsActive
	format.UpdatedBy = &userID

	fields := make([]models.InvoicePrintFormatField, 0, len(req.Fields))
	for idx, field := range req.Fields {
		order := field.DisplayOrder
		if order <= 0 {
			order = idx + 1
		}
		width := field.ColumnWidth
		if width <= 0 {
			width = 120
		}
		align := field.Alignment
		if align == "" {
			align = "left"
		}
		fields = append(fields, models.InvoicePrintFormatField{
			FieldKey:     field.FieldKey,
			FieldLabel:   field.FieldLabel,
			IsVisible:    field.IsVisible,
			DisplayOrder: order,
			ColumnWidth:  width,
			Alignment:    align,
		})
	}
	if len(fields) == 0 {
		fields = defaultPrintFields()
	}
	format.Fields = fields
	return format, nil
}

func (s *PrintFormatService) List(db *gorm.DB, companyID uint64, documentType string) ([]models.InvoicePrintFormat, error) {
	return s.repo.List(db, companyID, documentType)
}

func (s *PrintFormatService) Get(db *gorm.DB, companyID, id uint64) (*models.InvoicePrintFormat, error) {
	return s.repo.Get(db, companyID, id)
}

func (s *PrintFormatService) Create(db *gorm.DB, companyID, userID uint64, req dto.PrintFormatRequest) (*models.InvoicePrintFormat, error) {
	format, err := normalizePrintFormat(req, companyID, userID, nil)
	if err != nil {
		return nil, err
	}
	if err := s.repo.SaveWithFields(db, format); err != nil {
		return nil, err
	}
	return s.repo.Get(db, companyID, format.ID)
}

func (s *PrintFormatService) Update(db *gorm.DB, companyID, userID, id uint64, req dto.PrintFormatRequest) (*models.InvoicePrintFormat, error) {
	existing, err := s.repo.Get(db, companyID, id)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, errors.New("print format not found")
	}
	format, err := normalizePrintFormat(req, companyID, userID, existing)
	if err != nil {
		return nil, err
	}
	if err := s.repo.SaveWithFields(db, format); err != nil {
		return nil, err
	}
	return s.repo.Get(db, companyID, id)
}

func (s *PrintFormatService) Delete(db *gorm.DB, companyID, id uint64) error {
	return s.repo.SoftDelete(db, companyID, id)
}

func (s *PrintFormatService) SetDefault(db *gorm.DB, companyID, id uint64) error {
	return s.repo.SetDefault(db, companyID, id)
}

func (s *PrintFormatService) Default(db *gorm.DB, companyID uint64, branchID *uint64, documentType string) (*models.InvoicePrintFormat, error) {
	if !validPrintDocumentTypes[documentType] {
		return nil, errors.New("invalid document_type")
	}
	return s.repo.FindDefault(db, companyID, branchID, documentType)
}
