package dto

type PrintFormatFieldRequest struct {
	FieldKey     string `json:"field_key" binding:"required"`
	FieldLabel   string `json:"field_label" binding:"required"`
	IsVisible    bool   `json:"is_visible"`
	DisplayOrder int    `json:"display_order"`
	ColumnWidth  int    `json:"column_width"`
	Alignment    string `json:"alignment"`
}

type PrintFormatRequest struct {
	BranchID             *uint64                   `json:"branch_id"`
	FormatName           string                    `json:"format_name" binding:"required"`
	DocumentType         string                    `json:"document_type" binding:"required"`
	PaperSize            string                    `json:"paper_size"`
	Orientation          string                    `json:"orientation"`
	LogoPosition         string                    `json:"logo_position"`
	HeaderLayout         string                    `json:"header_layout"`
	FooterLayout         string                    `json:"footer_layout"`
	PrimaryColor         string                    `json:"primary_color"`
	FontFamily           string                    `json:"font_family"`
	ShowCompanyLogo      bool                      `json:"show_company_logo"`
	ShowCompanyName      bool                      `json:"show_company_name"`
	ShowBranchDetails    bool                      `json:"show_branch_details"`
	ShowCustomerDetails  bool                      `json:"show_customer_details"`
	ShowDocumentStatus   bool                      `json:"show_document_status"`
	ShowPaymentTerms     bool                      `json:"show_payment_terms"`
	ShowBankDetails      bool                      `json:"show_bank_details"`
	ShowSignatureSection bool                      `json:"show_signature_section"`
	ShowQRCode           bool                      `json:"show_qr_code"`
	TermsAndConditions   string                    `json:"terms_and_conditions"`
	FooterNote           string                    `json:"footer_note"`
	IsDefault            bool                      `json:"is_default"`
	IsActive             bool                      `json:"is_active"`
	Fields               []PrintFormatFieldRequest `json:"fields"`
}
