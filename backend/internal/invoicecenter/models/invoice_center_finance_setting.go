package models

import (
	"time"

	"gorm.io/gorm"
)

// InvoiceCenterFinanceSetting stores account mappings used when Invoice Center documents are posted to Finance.
type InvoiceCenterFinanceSetting struct {
	ID uint64 `gorm:"primaryKey;autoIncrement" json:"id"`

	CompanyID uint64  `gorm:"not null;index" json:"company_id"`
	BranchID  *uint64 `gorm:"index" json:"branch_id"`

	AccountsReceivableAccountID uint64 `gorm:"not null" json:"accounts_receivable_account_id"`

	SalesRevenueAccountID  uint64  `gorm:"not null" json:"sales_revenue_account_id"`
	SalesDiscountAccountID *uint64 `json:"sales_discount_account_id"`
	OutputTaxAccountID     *uint64 `json:"output_tax_account_id"`

	CreditNoteAdjustmentAccountID uint64 `gorm:"not null" json:"credit_note_adjustment_account_id"`
	DebitNoteIncomeAccountID      uint64 `gorm:"not null" json:"debit_note_income_account_id"`

	CashAccountID           *uint64 `json:"cash_account_id"`
	BankTransferAccountID   *uint64 `json:"bank_transfer_account_id"`
	ChequeClearingAccountID *uint64 `json:"cheque_clearing_account_id"`
	CardClearingAccountID   *uint64 `json:"card_clearing_account_id"`
	OnlinePaymentAccountID  *uint64 `json:"online_payment_account_id"`
	OtherReceiptAccountID   *uint64 `json:"other_receipt_account_id"`

	CustomerAdvanceAccountID *uint64 `json:"customer_advance_account_id"`

	IsActive bool `gorm:"default:true" json:"is_active"`

	CreatedBy *uint64        `json:"created_by"`
	UpdatedBy *uint64        `json:"updated_by"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
