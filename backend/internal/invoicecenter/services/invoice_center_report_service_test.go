package services_test

import (
	"errors"
	"testing"

	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/repositories"
	"github.com/pixandco/erp-phrma/internal/invoicecenter/services"
	"gorm.io/gorm"
)

type mockReportRepo struct {
	repositories.InvoiceCenterReportRepository
	getCustomerBalanceSummaryFn func(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerBalanceRowDTO, int64, dto.CustomerBalanceSummaryDTO, error)
}

func (m *mockReportRepo) GetCustomerBalanceSummary(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerBalanceRowDTO, int64, dto.CustomerBalanceSummaryDTO, error) {
	if m.getCustomerBalanceSummaryFn != nil {
		return m.getCustomerBalanceSummaryFn(db, companyID, filters)
	}
	return nil, 0, dto.CustomerBalanceSummaryDTO{}, nil
}

func TestGetCustomerBalanceReport_Success(t *testing.T) {
	mockRepo := &mockReportRepo{
		getCustomerBalanceSummaryFn: func(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerBalanceRowDTO, int64, dto.CustomerBalanceSummaryDTO, error) {
			rows := []dto.CustomerBalanceRowDTO{
				{
					CustomerCode:          "CUST-001",
					CustomerName:          "Apex Pharmacy",
					CreditLimit:           50000,
					CurrentBalance:        12500,
					AvailableCredit:       37500,
					CreditStatus:          "normal",
					Status:                "active",
					ReceivableAccountCode: "1100",
					ReceivableAccountName: "Accounts Receivable Trade",
				},
				{
					CustomerCode:          "CUST-002",
					CustomerName:          "BioCare Labs",
					CreditLimit:           20000,
					CurrentBalance:        25000,
					AvailableCredit:       -5000,
					CreditStatus:          "over_limit",
					Status:                "active",
					ReceivableAccountCode: "",
					ReceivableAccountName: "",
				},
			}
			summary := dto.CustomerBalanceSummaryDTO{
				TotalCustomers:           2,
				TotalCreditLimit:         70000,
				TotalCurrentBalance:      37500,
				TotalAvailableCredit:     32500,
				CustomersOverCreditLimit: 1,
			}
			return rows, 2, summary, nil
		},
	}

	service := services.NewInvoiceCenterReportService(mockRepo)
	filters := dto.ReportFilterDTO{
		Page:  1,
		Limit: 10,
	}

	rows, summary, pagination, err := service.GetCustomerBalanceReport(nil, 1, filters)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(rows) != 2 {
		t.Fatalf("expected 2 rows, got %d", len(rows))
	}
	if rows[0].CustomerName != "Apex Pharmacy" {
		t.Errorf("expected customer Apex Pharmacy, got %s", rows[0].CustomerName)
	}
	if rows[0].ReceivableAccountCode != "1100" {
		t.Errorf("expected receivable account code 1100, got %s", rows[0].ReceivableAccountCode)
	}
	if rows[0].ReceivableAccountName != "Accounts Receivable Trade" {
		t.Errorf("expected receivable account name Accounts Receivable Trade, got %s", rows[0].ReceivableAccountName)
	}
	if rows[1].ReceivableAccountCode != "" {
		t.Errorf("expected empty receivable account code for CUST-002, got %s", rows[1].ReceivableAccountCode)
	}

	// Verify Summary
	if summary.TotalCustomers != 2 {
		t.Errorf("expected TotalCustomers=2, got %d", summary.TotalCustomers)
	}
	if summary.TotalCreditLimit != 70000 {
		t.Errorf("expected TotalCreditLimit=70000, got %f", summary.TotalCreditLimit)
	}
	if summary.TotalCurrentBalance != 37500 {
		t.Errorf("expected TotalCurrentBalance=37500, got %f", summary.TotalCurrentBalance)
	}
	if summary.CustomersOverCreditLimit != 1 {
		t.Errorf("expected CustomersOverCreditLimit=1, got %d", summary.CustomersOverCreditLimit)
	}

	// Verify Pagination
	if pagination == nil {
		t.Fatal("expected pagination not to be nil")
	}
	if pagination.Page != 1 || pagination.Limit != 10 || pagination.Total != 2 || pagination.TotalPages != 1 {
		t.Errorf("unexpected pagination: %+v", pagination)
	}
}

func TestGetCustomerBalanceReport_PaginationSanitization(t *testing.T) {
	mockRepo := &mockReportRepo{
		getCustomerBalanceSummaryFn: func(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerBalanceRowDTO, int64, dto.CustomerBalanceSummaryDTO, error) {
			return []dto.CustomerBalanceRowDTO{}, 0, dto.CustomerBalanceSummaryDTO{}, nil
		},
	}

	service := services.NewInvoiceCenterReportService(mockRepo)

	// Test negative/zero page and limit
	filters := dto.ReportFilterDTO{
		Page:  -5,
		Limit: 0,
	}

	_, _, pagination, err := service.GetCustomerBalanceReport(nil, 1, filters)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if pagination.Page != 1 {
		t.Errorf("expected clamped page 1, got %d", pagination.Page)
	}
	if pagination.Limit != 10 {
		t.Errorf("expected default limit 10, got %d", pagination.Limit)
	}
}

func TestGetCustomerBalanceReport_RepositoryError(t *testing.T) {
	expectedErr := errors.New("database connection refused")
	mockRepo := &mockReportRepo{
		getCustomerBalanceSummaryFn: func(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerBalanceRowDTO, int64, dto.CustomerBalanceSummaryDTO, error) {
			return nil, 0, dto.CustomerBalanceSummaryDTO{}, expectedErr
		},
	}

	service := services.NewInvoiceCenterReportService(mockRepo)
	_, _, _, err := service.GetCustomerBalanceReport(nil, 1, dto.ReportFilterDTO{})
	if err == nil || err.Error() != expectedErr.Error() {
		t.Fatalf("expected error %v, got %v", expectedErr, err)
	}
}
