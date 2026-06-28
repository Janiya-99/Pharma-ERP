package migrations

import (
	"github.com/pixandco/erp-phrma/internal/invoicecenter/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// RunInvoiceCenterMigrations runs AutoMigrate for all Invoice Center models in the specified order.
func RunInvoiceCenterMigrations(companyDB *gorm.DB, loggers ...*zap.Logger) error {
	var logger *zap.Logger
	if len(loggers) > 0 && loggers[0] != nil {
		logger = loggers[0]
	} else {
		logger = zap.NewNop()
	}

	logger.Info("Running Invoice Center database AutoMigrate...")

	err := companyDB.AutoMigrate(
		&models.CustomerCategory{},
		&models.Customer{},
		&models.CustomerAddress{},
		&models.CustomerContact{},
		&models.SalesOrder{},
		&models.SalesOrderLine{},
		&models.SalesOrderApproval{},
		&models.SalesInvoice{},
		&models.SalesInvoiceLine{},
		&models.SalesInvoiceApproval{},
		&models.CreditNote{},
		&models.CreditNoteLine{},
		&models.CreditNoteApproval{},
		&models.DebitNote{},
		&models.DebitNoteLine{},
		&models.DebitNoteApproval{},
		&models.CustomerReceipt{},
		&models.CustomerReceiptAllocation{},
		&models.CustomerReceiptApproval{},
		&models.InvoiceCenterFinanceSetting{},
		&models.InvoiceCenterFinancePosting{},
	)
	if err != nil {
		logger.Error("Invoice Center AutoMigrate failed", zap.Error(err))
		return err
	}

	logger.Info("Invoice Center AutoMigrate completed successfully")
	return nil
}
