package services

import (
	"errors"

	controlDto "github.com/pixandco/erp-phrma/internal/control/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/repositories"
	"gorm.io/gorm"
)

type InvoiceCenterReportService interface {
	GetDashboardSummaryReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) (dto.DashboardSummaryReportDTO, error)
	GetCustomerBalanceReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerBalanceRowDTO, *controlDto.Pagination, error)
	GetCustomerStatementReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerStatementRowDTO, dto.CustomerStatementHeaderDTO, error)
	GetCustomerAgingReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerAgingRowDTO, *controlDto.Pagination, error)
	GetSalesOrderRegisterReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.SalesOrderRegisterRowDTO, dto.SalesOrderRegisterSummaryDTO, *controlDto.Pagination, error)
	GetSalesInvoiceRegisterReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.SalesInvoiceRegisterRowDTO, dto.SalesInvoiceRegisterSummaryDTO, *controlDto.Pagination, error)
	GetCreditNoteRegisterReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CreditNoteRegisterRowDTO, dto.CreditNoteRegisterSummaryDTO, *controlDto.Pagination, error)
	GetDebitNoteRegisterReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.DebitNoteRegisterRowDTO, dto.DebitNoteRegisterSummaryDTO, *controlDto.Pagination, error)
	GetCustomerReceiptRegisterReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerReceiptRegisterRowDTO, dto.CustomerReceiptRegisterSummaryDTO, *controlDto.Pagination, error)
	GetOutstandingInvoiceReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.OutstandingInvoiceRowDTO, dto.OutstandingInvoiceSummaryDTO, *controlDto.Pagination, error)
	GetSalesByCustomerReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.SalesByCustomerRowDTO, dto.SalesByCustomerSummaryDTO, *controlDto.Pagination, error)
	GetSalesByProductReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.SalesByProductRowDTO, dto.SalesByProductSummaryDTO, *controlDto.Pagination, error)
	GetCollectionSummaryReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CollectionSummaryRowDTO, dto.CollectionSummarySummaryDTO, *controlDto.Pagination, error)
	GetFinancePostingStatusReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.FinancePostingStatusRowDTO, dto.FinancePostingStatusSummaryDTO, *controlDto.Pagination, error)
}

type invoiceCenterReportService struct {
	repo repositories.InvoiceCenterReportRepository
}

func NewInvoiceCenterReportService(repo repositories.InvoiceCenterReportRepository) InvoiceCenterReportService {
	return &invoiceCenterReportService{repo: repo}
}

func (s *invoiceCenterReportService) calculatePagination(page, limit int, total int64) *controlDto.Pagination {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	totalPages := int(total) / limit
	if int(total)%limit > 0 {
		totalPages++
	}
	return &controlDto.Pagination{
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}
}

func (s *invoiceCenterReportService) GetDashboardSummaryReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) (dto.DashboardSummaryReportDTO, error) {
	return s.repo.GetDashboardSummary(db, companyID, filters)
}

func (s *invoiceCenterReportService) GetCustomerBalanceReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerBalanceRowDTO, *controlDto.Pagination, error) {
	rows, total, err := s.repo.GetCustomerBalanceSummary(db, companyID, filters)
	if err != nil {
		return nil, nil, err
	}
	return rows, s.calculatePagination(filters.Page, filters.Limit, total), nil
}

func (s *invoiceCenterReportService) GetCustomerStatementReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerStatementRowDTO, dto.CustomerStatementHeaderDTO, error) {
	if filters.CustomerID == nil {
		return nil, dto.CustomerStatementHeaderDTO{}, errors.New("customer_id is required for statement report")
	}

	rows, header, err := s.repo.GetCustomerStatementTransactions(db, companyID, filters)
	if err != nil {
		return nil, header, err
	}

	// Calculate running balance based on date order
	runningBalance := header.OpeningBalance
	for i := range rows {
		runningBalance = runningBalance + rows[i].DebitAmount - rows[i].CreditAmount
		rows[i].RunningBalance = runningBalance
	}
	header.ClosingBalance = runningBalance

	return rows, header, nil
}

func (s *invoiceCenterReportService) GetCustomerAgingReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerAgingRowDTO, *controlDto.Pagination, error) {
	rows, total, err := s.repo.GetCustomerAging(db, companyID, filters)
	if err != nil {
		return nil, nil, err
	}
	return rows, s.calculatePagination(filters.Page, filters.Limit, total), nil
}

func (s *invoiceCenterReportService) GetSalesOrderRegisterReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.SalesOrderRegisterRowDTO, dto.SalesOrderRegisterSummaryDTO, *controlDto.Pagination, error) {
	rows, total, summary, err := s.repo.GetSalesOrderRegister(db, companyID, filters)
	if err != nil {
		return nil, summary, nil, err
	}
	return rows, summary, s.calculatePagination(filters.Page, filters.Limit, total), nil
}

func (s *invoiceCenterReportService) GetSalesInvoiceRegisterReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.SalesInvoiceRegisterRowDTO, dto.SalesInvoiceRegisterSummaryDTO, *controlDto.Pagination, error) {
	rows, total, summary, err := s.repo.GetSalesInvoiceRegister(db, companyID, filters)
	if err != nil {
		return nil, summary, nil, err
	}
	return rows, summary, s.calculatePagination(filters.Page, filters.Limit, total), nil
}

func (s *invoiceCenterReportService) GetCreditNoteRegisterReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CreditNoteRegisterRowDTO, dto.CreditNoteRegisterSummaryDTO, *controlDto.Pagination, error) {
	rows, total, summary, err := s.repo.GetCreditNoteRegister(db, companyID, filters)
	if err != nil {
		return nil, summary, nil, err
	}
	return rows, summary, s.calculatePagination(filters.Page, filters.Limit, total), nil
}

func (s *invoiceCenterReportService) GetDebitNoteRegisterReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.DebitNoteRegisterRowDTO, dto.DebitNoteRegisterSummaryDTO, *controlDto.Pagination, error) {
	rows, total, summary, err := s.repo.GetDebitNoteRegister(db, companyID, filters)
	if err != nil {
		return nil, summary, nil, err
	}
	return rows, summary, s.calculatePagination(filters.Page, filters.Limit, total), nil
}

func (s *invoiceCenterReportService) GetCustomerReceiptRegisterReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerReceiptRegisterRowDTO, dto.CustomerReceiptRegisterSummaryDTO, *controlDto.Pagination, error) {
	rows, total, summary, err := s.repo.GetCustomerReceiptRegister(db, companyID, filters)
	if err != nil {
		return nil, summary, nil, err
	}
	return rows, summary, s.calculatePagination(filters.Page, filters.Limit, total), nil
}

func (s *invoiceCenterReportService) GetOutstandingInvoiceReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.OutstandingInvoiceRowDTO, dto.OutstandingInvoiceSummaryDTO, *controlDto.Pagination, error) {
	rows, total, summary, err := s.repo.GetOutstandingInvoices(db, companyID, filters)
	if err != nil {
		return nil, summary, nil, err
	}
	return rows, summary, s.calculatePagination(filters.Page, filters.Limit, total), nil
}

func (s *invoiceCenterReportService) GetSalesByCustomerReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.SalesByCustomerRowDTO, dto.SalesByCustomerSummaryDTO, *controlDto.Pagination, error) {
	rows, total, summary, err := s.repo.GetSalesByCustomer(db, companyID, filters)
	if err != nil {
		return nil, summary, nil, err
	}
	return rows, summary, s.calculatePagination(filters.Page, filters.Limit, total), nil
}

func (s *invoiceCenterReportService) GetSalesByProductReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.SalesByProductRowDTO, dto.SalesByProductSummaryDTO, *controlDto.Pagination, error) {
	rows, total, summary, err := s.repo.GetSalesByProduct(db, companyID, filters)
	if err != nil {
		return nil, summary, nil, err
	}
	return rows, summary, s.calculatePagination(filters.Page, filters.Limit, total), nil
}

func (s *invoiceCenterReportService) GetCollectionSummaryReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CollectionSummaryRowDTO, dto.CollectionSummarySummaryDTO, *controlDto.Pagination, error) {
	rows, total, summary, err := s.repo.GetCollectionSummary(db, companyID, filters)
	if err != nil {
		return nil, summary, nil, err
	}
	return rows, summary, s.calculatePagination(filters.Page, filters.Limit, total), nil
}

func (s *invoiceCenterReportService) GetFinancePostingStatusReport(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.FinancePostingStatusRowDTO, dto.FinancePostingStatusSummaryDTO, *controlDto.Pagination, error) {
	rows, total, summary, err := s.repo.GetFinancePostingStatus(db, companyID, filters)
	if err != nil {
		return nil, summary, nil, err
	}
	return rows, summary, s.calculatePagination(filters.Page, filters.Limit, total), nil
}
