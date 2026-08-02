package dto

type CreateBankTransactionRequest struct {
	BranchID        *uint64 `json:"branch_id"`
	BankAccountID   uint64  `json:"bank_account_id" binding:"required"`
	TransactionDate string  `json:"transaction_date" binding:"required"`
	ValueDate       *string `json:"value_date"`
	TransactionType string  `json:"transaction_type" binding:"required"`
	ReferenceNumber string  `json:"reference_number"`
	Description     string  `json:"description"`
	DebitAmount     float64 `json:"debit_amount"`
	CreditAmount    float64 `json:"credit_amount"`
}

type UpdateBankTransactionRequest struct {
	TransactionDate string  `json:"transaction_date" binding:"required"`
	ValueDate       *string `json:"value_date"`
	ReferenceNumber string  `json:"reference_number"`
	Description     string  `json:"description"`
	DebitAmount     float64 `json:"debit_amount"`
	CreditAmount    float64 `json:"credit_amount"`
}
