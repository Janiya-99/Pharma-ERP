package dto

type CreateChequeBookRequest struct {
	BranchID         *uint64 `json:"branch_id"`
	BankAccountID    uint64  `json:"bank_account_id" binding:"required"`
	ChequeBookNumber string  `json:"cheque_book_number"`
	StartLeafNumber  string  `json:"start_leaf_number" binding:"required"`
	EndLeafNumber    string  `json:"end_leaf_number" binding:"required"`
	IssuedDate       *string `json:"issued_date"`
	Remarks          string  `json:"remarks"`
	Status           string  `json:"status"`
}

type UpdateChequeBookRequest struct {
	Remarks string `json:"remarks"`
	Status  string `json:"status"`
}

type CancelChequeLeafRequest struct {
	CancelReason string `json:"cancel_reason" binding:"required"`
}
