package repositories

import (
	"github.com/pixandco/erp-phrma/internal/invoicecenter/dto"
	"gorm.io/gorm"
)

type InvoiceCenterReportRepository interface {
	GetDashboardSummary(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) (dto.DashboardSummaryReportDTO, error)
	GetCustomerBalanceSummary(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerBalanceRowDTO, int64, error)
	GetCustomerStatementTransactions(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerStatementRowDTO, dto.CustomerStatementHeaderDTO, error)
	GetCustomerAging(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerAgingRowDTO, int64, error)
	GetSalesOrderRegister(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.SalesOrderRegisterRowDTO, int64, dto.SalesOrderRegisterSummaryDTO, error)
	GetSalesInvoiceRegister(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.SalesInvoiceRegisterRowDTO, int64, dto.SalesInvoiceRegisterSummaryDTO, error)
	GetCreditNoteRegister(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CreditNoteRegisterRowDTO, int64, dto.CreditNoteRegisterSummaryDTO, error)
	GetDebitNoteRegister(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.DebitNoteRegisterRowDTO, int64, dto.DebitNoteRegisterSummaryDTO, error)
	GetCustomerReceiptRegister(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerReceiptRegisterRowDTO, int64, dto.CustomerReceiptRegisterSummaryDTO, error)
	GetOutstandingInvoices(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.OutstandingInvoiceRowDTO, int64, dto.OutstandingInvoiceSummaryDTO, error)
	GetSalesByCustomer(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.SalesByCustomerRowDTO, int64, dto.SalesByCustomerSummaryDTO, error)
	GetSalesByProduct(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.SalesByProductRowDTO, int64, dto.SalesByProductSummaryDTO, error)
	GetCollectionSummary(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CollectionSummaryRowDTO, int64, dto.CollectionSummarySummaryDTO, error)
	GetFinancePostingStatus(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.FinancePostingStatusRowDTO, int64, dto.FinancePostingStatusSummaryDTO, error)
}

type invoiceCenterReportRepository struct{}

func NewInvoiceCenterReportRepository() InvoiceCenterReportRepository {
	return &invoiceCenterReportRepository{}
}

func (r *invoiceCenterReportRepository) applyCommonFilters(query *gorm.DB, filters dto.ReportFilterDTO) *gorm.DB {
	if filters.BranchID != nil {
		query = query.Where("branch_id = ?", *filters.BranchID)
	}
	if filters.CustomerID != nil {
		query = query.Where("customer_id = ?", *filters.CustomerID)
	}
	return query
}

func (r *invoiceCenterReportRepository) GetDashboardSummary(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) (dto.DashboardSummaryReportDTO, error) {
	var summary dto.DashboardSummaryReportDTO

	baseCustQuery := func() *gorm.DB {
		q := db.Table("customers").Where("company_id = ? AND deleted_at IS NULL", companyID)
		if filters.BranchID != nil {
			q = q.Where("branch_id = ?", *filters.BranchID)
		}
		return q
	}

	baseCustQuery().Count(&summary.TotalCustomers)
	baseCustQuery().Where("status = ?", "active").Count(&summary.ActiveCustomers)
	baseCustQuery().Where("status = ?", "blocked").Count(&summary.BlockedCustomers)
	baseCustQuery().Where("current_balance > credit_limit AND credit_limit > 0").Count(&summary.CustomersOverCreditLimit)

	baseSoQuery := func() *gorm.DB {
		q := db.Table("sales_orders").Where("company_id = ? AND deleted_at IS NULL", companyID)
		q = r.applyCommonFilters(q, filters)
		if filters.DateFrom != nil {
			q = q.Where("sales_order_date >= ?", *filters.DateFrom)
		}
		if filters.DateTo != nil {
			q = q.Where("sales_order_date <= ?", *filters.DateTo)
		}
		return q
	}
	baseSoQuery().Count(&summary.TotalSalesOrders)
	baseSoQuery().Where("approval_status = ?", "approved").Count(&summary.ApprovedSalesOrders)
	baseSoQuery().Where("approval_status = ?", "pending").Count(&summary.PendingSalesOrders)
	baseSoQuery().Where("order_status = ?", "closed").Count(&summary.ClosedSalesOrders)

	baseSiQuery := func() *gorm.DB {
		q := db.Table("sales_invoices").Where("company_id = ? AND deleted_at IS NULL", companyID)
		q = r.applyCommonFilters(q, filters)
		if filters.DateFrom != nil {
			q = q.Where("invoice_date >= ?", *filters.DateFrom)
		}
		if filters.DateTo != nil {
			q = q.Where("invoice_date <= ?", *filters.DateTo)
		}
		return q
	}
	baseSiQuery().Count(&summary.TotalSalesInvoices)
	baseSiQuery().Where("posted_status = ?", "posted").Count(&summary.PostedSalesInvoices)
	baseSiQuery().Where("posted_status != ?", "posted").Count(&summary.UnpostedSalesInvoices)

	baseSiQuery().Where("posted_status = ?", "posted").Where("payment_status = ?", "unpaid").Count(&summary.UnpaidInvoices)
	baseSiQuery().Where("posted_status = ?", "posted").Where("payment_status = ?", "partially_paid").Count(&summary.PartiallyPaidInvoices)
	baseSiQuery().Where("posted_status = ?", "posted").Where("payment_status = ?", "paid").Count(&summary.PaidInvoices)

	// Totals from Invoices
	type InvoiceTotals struct {
		TotalAmount   float64
		PaidAmount    float64
		BalanceAmount float64
	}
	var ivT InvoiceTotals
	baseSiQuery().Where("posted_status = ?", "posted").Select("COALESCE(SUM(total_amount), 0) as total_amount, COALESCE(SUM(paid_amount), 0) as paid_amount, COALESCE(SUM(balance_amount), 0) as balance_amount").Scan(&ivT)
	summary.TotalInvoiceAmount = ivT.TotalAmount
	summary.TotalPaidAmount = ivT.PaidAmount
	summary.TotalBalanceAmount = ivT.BalanceAmount

	// Credit Notes
	cnQuery := db.Table("credit_notes").Where("company_id = ? AND deleted_at IS NULL AND posted_status = 'posted'", companyID)
	cnQuery = r.applyCommonFilters(cnQuery, filters)
	if filters.DateFrom != nil {
		cnQuery = cnQuery.Where("credit_note_date >= ?", *filters.DateFrom)
	}
	if filters.DateTo != nil {
		cnQuery = cnQuery.Where("credit_note_date <= ?", *filters.DateTo)
	}
	cnQuery.Select("COALESCE(SUM(total_amount), 0)").Scan(&summary.TotalCreditNoteAmount)

	// Debit Notes
	dnQuery := db.Table("debit_notes").Where("company_id = ? AND deleted_at IS NULL AND posted_status = 'posted'", companyID)
	dnQuery = r.applyCommonFilters(dnQuery, filters)
	if filters.DateFrom != nil {
		dnQuery = dnQuery.Where("debit_note_date >= ?", *filters.DateFrom)
	}
	if filters.DateTo != nil {
		dnQuery = dnQuery.Where("debit_note_date <= ?", *filters.DateTo)
	}
	dnQuery.Select("COALESCE(SUM(total_amount), 0)").Scan(&summary.TotalDebitNoteAmount)

	// Customer Receipts
	crQuery := db.Table("customer_receipts").Where("company_id = ? AND deleted_at IS NULL AND posted_status = 'posted'", companyID)
	crQuery = r.applyCommonFilters(crQuery, filters)
	if filters.DateFrom != nil {
		crQuery = crQuery.Where("receipt_date >= ?", *filters.DateFrom)
	}
	if filters.DateTo != nil {
		crQuery = crQuery.Where("receipt_date <= ?", *filters.DateTo)
	}

	type ReceiptTotals struct {
		ReceiptAmount     float64
		AllocatedAmount   float64
		UnallocatedAmount float64
	}
	var crT ReceiptTotals
	crQuery.Select("COALESCE(SUM(received_amount), 0) as receipt_amount, COALESCE(SUM(allocated_amount), 0) as allocated_amount, COALESCE(SUM(unallocated_amount), 0) as unallocated_amount").Scan(&crT)
	summary.TotalReceiptAmount = crT.ReceiptAmount
	summary.TotalAllocatedReceiptAmount = crT.AllocatedAmount
	summary.TotalUnallocatedReceiptAmount = crT.UnallocatedAmount

	// Finance Postings
	var postedDocs, unpostedDocs int64

	countFinance := func(table string, dateField string) (int64, int64) {
		var p, u int64

		qBase := func() *gorm.DB {
			q := db.Table(table).Where("company_id = ? AND deleted_at IS NULL AND posted_status = 'posted'", companyID)
			q = r.applyCommonFilters(q, filters)
			if filters.DateFrom != nil {
				q = q.Where(dateField+" >= ?", *filters.DateFrom)
			}
			if filters.DateTo != nil {
				q = q.Where(dateField+" <= ?", *filters.DateTo)
			}
			return q
		}

		qBase().Where("finance_post_status = ?", "posted").Count(&p)
		qBase().Where("finance_post_status = ?", "unposted").Count(&u)
		return p, u
	}

	sp, su := countFinance("sales_invoices", "invoice_date")
	postedDocs += sp
	unpostedDocs += su

	cp, cu := countFinance("credit_notes", "credit_note_date")
	postedDocs += cp
	unpostedDocs += cu

	dp, du := countFinance("debit_notes", "debit_note_date")
	postedDocs += dp
	unpostedDocs += du

	rp, ru := countFinance("customer_receipts", "receipt_date")
	postedDocs += rp
	unpostedDocs += ru

	summary.FinancePostedDocuments = postedDocs
	summary.FinanceUnpostedDocuments = unpostedDocs

	return summary, nil
}

func (r *invoiceCenterReportRepository) GetCustomerBalanceSummary(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerBalanceRowDTO, int64, error) {
	query := db.Table("customers").Where("company_id = ? AND deleted_at IS NULL", companyID)

	// Customers are company-level in the current schema. Branch filtering applies
	// to document reports, not to the customer master balance summary.
	if filters.CustomerID != nil {
		query = query.Where("id = ?", *filters.CustomerID)
	}
	if filters.CustomerCategoryID != nil {
		query = query.Where("customer_category_id = ?", *filters.CustomerCategoryID)
	}
	if filters.CustomerType != nil {
		query = query.Where("customer_type = ?", *filters.CustomerType)
	}
	if filters.Status != nil {
		query = query.Where("status = ?", *filters.Status)
	}
	if filters.OverCreditLimit != nil && *filters.OverCreditLimit {
		query = query.Where("current_balance > credit_limit AND credit_limit > 0")
	}
	if filters.Search != "" {
		search := "%" + filters.Search + "%"
		query = query.Where("(LOWER(customer_code) LIKE LOWER(?) OR LOWER(customer_name) LIKE LOWER(?) OR LOWER(primary_email) LIKE LOWER(?))", search, search, search)
	}

	var total int64
	query.Count(&total)

	offset := (filters.Page - 1) * filters.Limit
	query = query.Limit(filters.Limit).Offset(offset).Order("customer_name ASC")

	var rows []dto.CustomerBalanceRowDTO
	err := query.Select(`
		customer_code, 
		customer_name, 
		(SELECT name FROM customer_categories WHERE id = customers.customer_category_id) as customer_category,
		customer_type, 
		primary_contact_number, 
		primary_email, 
		credit_limit, 
		credit_days, 
		current_balance,
		CASE WHEN credit_limit > 0 THEN credit_limit - current_balance ELSE 0 END as available_credit,
		CASE WHEN credit_limit = 0 THEN 'No Credit Limit' WHEN current_balance > credit_limit THEN 'Over Limit' ELSE 'Within Limit' END as credit_status,
		status
	`).Scan(&rows).Error

	return rows, total, err
}

func (r *invoiceCenterReportRepository) GetCustomerStatementTransactions(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerStatementRowDTO, dto.CustomerStatementHeaderDTO, error) {
	var header dto.CustomerStatementHeaderDTO
	if filters.CustomerID == nil {
		return nil, header, nil
	}

	err := db.Table("customers").Where("id = ? AND company_id = ?", *filters.CustomerID, companyID).
		Select("customer_code, customer_name, customer_type, credit_limit, credit_days, current_balance as closing_balance").
		Scan(&header).Error
	if err != nil {
		return nil, header, err
	}

	header.DateFrom = filters.DateFrom
	header.DateTo = filters.DateTo

	var rows []dto.CustomerStatementRowDTO

	statusFilter := "posted_status = 'posted'"
	if filters.IncludeUnposted != nil && *filters.IncludeUnposted {
		statusFilter = "1=1" // All statuses except deleted
	}

	branchFilter := ""
	if filters.BranchID != nil {
		branchFilter = " AND branch_id = " + db.Dialector.Explain("?", *filters.BranchID)
	}

	query := `
		SELECT 
			created_at, invoice_date as transaction_date, 'Sales Invoice' as document_type, invoice_number as document_number, 
			sales_order_number as reference_number, 'Sales Invoice' as description, 
			total_amount as debit_amount, 0 as credit_amount, 0 as running_balance, 
			posted_status as operational_status, finance_post_status
		FROM sales_invoices 
		WHERE customer_id = ? AND company_id = ? AND deleted_at IS NULL AND ` + statusFilter + branchFilter + `
		
		UNION ALL
		
		SELECT 
			created_at, debit_note_date as transaction_date, 'Debit Note' as document_type, debit_note_number as document_number, 
			reference_number, 'Debit Note' as description, 
			total_amount as debit_amount, 0 as credit_amount, 0 as running_balance, 
			posted_status as operational_status, finance_post_status
		FROM debit_notes 
		WHERE customer_id = ? AND company_id = ? AND deleted_at IS NULL AND ` + statusFilter + branchFilter + `
		
		UNION ALL
		
		SELECT 
			created_at, credit_note_date as transaction_date, 'Credit Note' as document_type, credit_note_number as document_number, 
			reference_number, 'Credit Note' as description, 
			0 as debit_amount, total_amount as credit_amount, 0 as running_balance, 
			posted_status as operational_status, finance_post_status
		FROM credit_notes 
		WHERE customer_id = ? AND company_id = ? AND deleted_at IS NULL AND ` + statusFilter + branchFilter + `
		
		UNION ALL
		
		SELECT 
			created_at, receipt_date as transaction_date, 'Customer Receipt' as document_type, receipt_number as document_number, 
			reference_number, 'Customer Receipt (' || payment_method || ')' as description, 
			0 as debit_amount, allocated_amount as credit_amount, 0 as running_balance, 
			posted_status as operational_status, finance_post_status
		FROM customer_receipts 
		WHERE customer_id = ? AND company_id = ? AND deleted_at IS NULL AND ` + statusFilter + branchFilter + `
		
		ORDER BY transaction_date ASC, created_at ASC
	`

	err = db.Raw(query, *filters.CustomerID, companyID, *filters.CustomerID, companyID, *filters.CustomerID, companyID, *filters.CustomerID, companyID).Scan(&rows).Error

	return rows, header, err
}

func (r *invoiceCenterReportRepository) GetCustomerAging(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerAgingRowDTO, int64, error) {
	// Implemented in service using raw invoices and processing.
	return nil, 0, nil
}

func (r *invoiceCenterReportRepository) GetSalesOrderRegister(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.SalesOrderRegisterRowDTO, int64, dto.SalesOrderRegisterSummaryDTO, error) {
	return nil, 0, dto.SalesOrderRegisterSummaryDTO{}, nil
}

func (r *invoiceCenterReportRepository) GetSalesInvoiceRegister(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.SalesInvoiceRegisterRowDTO, int64, dto.SalesInvoiceRegisterSummaryDTO, error) {
	return nil, 0, dto.SalesInvoiceRegisterSummaryDTO{}, nil
}

func (r *invoiceCenterReportRepository) GetCreditNoteRegister(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CreditNoteRegisterRowDTO, int64, dto.CreditNoteRegisterSummaryDTO, error) {
	return nil, 0, dto.CreditNoteRegisterSummaryDTO{}, nil
}

func (r *invoiceCenterReportRepository) GetDebitNoteRegister(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.DebitNoteRegisterRowDTO, int64, dto.DebitNoteRegisterSummaryDTO, error) {
	return nil, 0, dto.DebitNoteRegisterSummaryDTO{}, nil
}

func (r *invoiceCenterReportRepository) GetCustomerReceiptRegister(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CustomerReceiptRegisterRowDTO, int64, dto.CustomerReceiptRegisterSummaryDTO, error) {
	return nil, 0, dto.CustomerReceiptRegisterSummaryDTO{}, nil
}

func (r *invoiceCenterReportRepository) GetOutstandingInvoices(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.OutstandingInvoiceRowDTO, int64, dto.OutstandingInvoiceSummaryDTO, error) {
	return nil, 0, dto.OutstandingInvoiceSummaryDTO{}, nil
}

func (r *invoiceCenterReportRepository) GetSalesByCustomer(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.SalesByCustomerRowDTO, int64, dto.SalesByCustomerSummaryDTO, error) {
	return nil, 0, dto.SalesByCustomerSummaryDTO{}, nil
}

func (r *invoiceCenterReportRepository) GetSalesByProduct(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.SalesByProductRowDTO, int64, dto.SalesByProductSummaryDTO, error) {
	return nil, 0, dto.SalesByProductSummaryDTO{}, nil
}

func (r *invoiceCenterReportRepository) GetCollectionSummary(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.CollectionSummaryRowDTO, int64, dto.CollectionSummarySummaryDTO, error) {
	return nil, 0, dto.CollectionSummarySummaryDTO{}, nil
}

func (r *invoiceCenterReportRepository) GetFinancePostingStatus(db *gorm.DB, companyID uint64, filters dto.ReportFilterDTO) ([]dto.FinancePostingStatusRowDTO, int64, dto.FinancePostingStatusSummaryDTO, error) {
	return nil, 0, dto.FinancePostingStatusSummaryDTO{}, nil
}
