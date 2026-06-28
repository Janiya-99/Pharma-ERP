package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	controlDto "github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/services"
	"gorm.io/gorm"
)

type InvoiceCenterReportHandler struct {
	service services.InvoiceCenterReportService
}

func NewInvoiceCenterReportHandler(service services.InvoiceCenterReportService) *InvoiceCenterReportHandler {
	return &InvoiceCenterReportHandler{service: service}
}

func (h *InvoiceCenterReportHandler) getCompanyID(c *gin.Context) (uint64, *gorm.DB, bool) {
	companyID, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, controlDto.ErrorResponse("Unauthorized company context", nil))
		return 0, nil, false
	}
	companyDB, dbExists := c.Get("companyDB")
	if !dbExists {
		c.JSON(http.StatusInternalServerError, controlDto.ErrorResponse("Database context missing", nil))
		return 0, nil, false
	}
	return companyID.(uint64), companyDB.(*gorm.DB), true
}

func (h *InvoiceCenterReportHandler) bindFilters(c *gin.Context) (dto.ReportFilterDTO, bool) {
	var filters dto.ReportFilterDTO
	if err := c.ShouldBindQuery(&filters); err != nil {
		c.JSON(http.StatusBadRequest, controlDto.ErrorResponse("Invalid filter parameters", err.Error()))
		return filters, false
	}
	return filters, true
}

func (h *InvoiceCenterReportHandler) GetDashboardSummary(c *gin.Context) {
	companyID, db, ok := h.getCompanyID(c)
	if !ok {
		return
	}
	filters, ok := h.bindFilters(c)
	if !ok {
		return
	}

	result, err := h.service.GetDashboardSummaryReport(db, companyID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, controlDto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}
	c.JSON(http.StatusOK, controlDto.SuccessResponse("Invoice Center dashboard summary loaded successfully", result))
}

func (h *InvoiceCenterReportHandler) GetCustomerBalances(c *gin.Context) {
	companyID, db, ok := h.getCompanyID(c)
	if !ok {
		return
	}
	filters, ok := h.bindFilters(c)
	if !ok {
		return
	}

	rows, pagination, err := h.service.GetCustomerBalanceReport(db, companyID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, controlDto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	data := dto.ReportResponseDTO{
		Summary: map[string]interface{}{},
		Rows:    rows,
	}
	c.JSON(http.StatusOK, controlDto.PaginatedResponse("Customer balances loaded successfully", data, pagination))
}

func (h *InvoiceCenterReportHandler) GetCustomerStatement(c *gin.Context) {
	companyID, db, ok := h.getCompanyID(c)
	if !ok {
		return
	}
	filters, ok := h.bindFilters(c)
	if !ok {
		return
	}

	rows, header, err := h.service.GetCustomerStatementReport(db, companyID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, controlDto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	data := dto.ReportResponseDTO{
		Summary: header,
		Rows:    rows,
	}
	c.JSON(http.StatusOK, controlDto.SuccessResponse("Customer statement loaded successfully", data))
}

func (h *InvoiceCenterReportHandler) GetCustomerAging(c *gin.Context) {
	companyID, db, ok := h.getCompanyID(c)
	if !ok {
		return
	}
	filters, ok := h.bindFilters(c)
	if !ok {
		return
	}

	rows, pagination, err := h.service.GetCustomerAgingReport(db, companyID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, controlDto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	data := dto.ReportResponseDTO{
		Summary: map[string]interface{}{},
		Rows:    rows,
	}
	c.JSON(http.StatusOK, controlDto.PaginatedResponse("Customer aging loaded successfully", data, pagination))
}

func (h *InvoiceCenterReportHandler) GetSalesOrderRegister(c *gin.Context) {
	companyID, db, ok := h.getCompanyID(c)
	if !ok {
		return
	}
	filters, ok := h.bindFilters(c)
	if !ok {
		return
	}

	rows, summary, pagination, err := h.service.GetSalesOrderRegisterReport(db, companyID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, controlDto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	data := dto.ReportResponseDTO{
		Summary: summary,
		Rows:    rows,
	}
	c.JSON(http.StatusOK, controlDto.PaginatedResponse("Sales order register loaded successfully", data, pagination))
}

func (h *InvoiceCenterReportHandler) GetSalesInvoiceRegister(c *gin.Context) {
	companyID, db, ok := h.getCompanyID(c)
	if !ok {
		return
	}
	filters, ok := h.bindFilters(c)
	if !ok {
		return
	}

	rows, summary, pagination, err := h.service.GetSalesInvoiceRegisterReport(db, companyID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, controlDto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	data := dto.ReportResponseDTO{
		Summary: summary,
		Rows:    rows,
	}
	c.JSON(http.StatusOK, controlDto.PaginatedResponse("Sales invoice register loaded successfully", data, pagination))
}

func (h *InvoiceCenterReportHandler) GetCreditNoteRegister(c *gin.Context) {
	companyID, db, ok := h.getCompanyID(c)
	if !ok {
		return
	}
	filters, ok := h.bindFilters(c)
	if !ok {
		return
	}

	rows, summary, pagination, err := h.service.GetCreditNoteRegisterReport(db, companyID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, controlDto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	data := dto.ReportResponseDTO{
		Summary: summary,
		Rows:    rows,
	}
	c.JSON(http.StatusOK, controlDto.PaginatedResponse("Credit note register loaded successfully", data, pagination))
}

func (h *InvoiceCenterReportHandler) GetDebitNoteRegister(c *gin.Context) {
	companyID, db, ok := h.getCompanyID(c)
	if !ok {
		return
	}
	filters, ok := h.bindFilters(c)
	if !ok {
		return
	}

	rows, summary, pagination, err := h.service.GetDebitNoteRegisterReport(db, companyID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, controlDto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	data := dto.ReportResponseDTO{
		Summary: summary,
		Rows:    rows,
	}
	c.JSON(http.StatusOK, controlDto.PaginatedResponse("Debit note register loaded successfully", data, pagination))
}

func (h *InvoiceCenterReportHandler) GetCustomerReceiptRegister(c *gin.Context) {
	companyID, db, ok := h.getCompanyID(c)
	if !ok {
		return
	}
	filters, ok := h.bindFilters(c)
	if !ok {
		return
	}

	rows, summary, pagination, err := h.service.GetCustomerReceiptRegisterReport(db, companyID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, controlDto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	data := dto.ReportResponseDTO{
		Summary: summary,
		Rows:    rows,
	}
	c.JSON(http.StatusOK, controlDto.PaginatedResponse("Customer receipt register loaded successfully", data, pagination))
}

func (h *InvoiceCenterReportHandler) GetOutstandingInvoices(c *gin.Context) {
	companyID, db, ok := h.getCompanyID(c)
	if !ok {
		return
	}
	filters, ok := h.bindFilters(c)
	if !ok {
		return
	}

	rows, summary, pagination, err := h.service.GetOutstandingInvoiceReport(db, companyID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, controlDto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	data := dto.ReportResponseDTO{
		Summary: summary,
		Rows:    rows,
	}
	c.JSON(http.StatusOK, controlDto.PaginatedResponse("Outstanding invoices loaded successfully", data, pagination))
}

func (h *InvoiceCenterReportHandler) GetSalesByCustomer(c *gin.Context) {
	companyID, db, ok := h.getCompanyID(c)
	if !ok {
		return
	}
	filters, ok := h.bindFilters(c)
	if !ok {
		return
	}

	rows, summary, pagination, err := h.service.GetSalesByCustomerReport(db, companyID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, controlDto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	data := dto.ReportResponseDTO{
		Summary: summary,
		Rows:    rows,
	}
	c.JSON(http.StatusOK, controlDto.PaginatedResponse("Sales by customer loaded successfully", data, pagination))
}

func (h *InvoiceCenterReportHandler) GetSalesByProduct(c *gin.Context) {
	companyID, db, ok := h.getCompanyID(c)
	if !ok {
		return
	}
	filters, ok := h.bindFilters(c)
	if !ok {
		return
	}

	rows, summary, pagination, err := h.service.GetSalesByProductReport(db, companyID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, controlDto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	data := dto.ReportResponseDTO{
		Summary: summary,
		Rows:    rows,
	}
	c.JSON(http.StatusOK, controlDto.PaginatedResponse("Sales by product loaded successfully", data, pagination))
}

func (h *InvoiceCenterReportHandler) GetCollectionSummary(c *gin.Context) {
	companyID, db, ok := h.getCompanyID(c)
	if !ok {
		return
	}
	filters, ok := h.bindFilters(c)
	if !ok {
		return
	}

	rows, summary, pagination, err := h.service.GetCollectionSummaryReport(db, companyID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, controlDto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	data := dto.ReportResponseDTO{
		Summary: summary,
		Rows:    rows,
	}
	c.JSON(http.StatusOK, controlDto.PaginatedResponse("Collection summary loaded successfully", data, pagination))
}

func (h *InvoiceCenterReportHandler) GetFinancePostingStatus(c *gin.Context) {
	companyID, db, ok := h.getCompanyID(c)
	if !ok {
		return
	}
	filters, ok := h.bindFilters(c)
	if !ok {
		return
	}

	rows, summary, pagination, err := h.service.GetFinancePostingStatusReport(db, companyID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, controlDto.ErrorResponse("Failed to generate report", err.Error()))
		return
	}

	data := dto.ReportResponseDTO{
		Summary: summary,
		Rows:    rows,
	}
	c.JSON(http.StatusOK, controlDto.PaginatedResponse("Finance posting status loaded successfully", data, pagination))
}
