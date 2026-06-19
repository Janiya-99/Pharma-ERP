package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/dto"
	"github.com/pixandco/erp-phrma/internal/dto/request"
	"github.com/pixandco/erp-phrma/internal/service"
)

type JournalController struct {
	BaseController
	journalService *service.JournalService
}

func NewJournalController(journalService *service.JournalService) *JournalController {
	return &JournalController{
		journalService: journalService,
	}
}

// List returns a paginated list of journal entries
func (ctrl *JournalController) List(c *gin.Context) {
	branchID, _ := ctrl.GetBranchID(c)
	var req dto.PaginationRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		req.Page = 1
		req.PerPage = 20
	}

	entries, total, err := ctrl.journalService.List(branchID, &req)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	ctrl.SendPaginated(c, "Journal entries retrieved successfully", entries, req.Page, req.PerPage, total)
}

// Create creates a new journal entry
func (ctrl *JournalController) Create(c *gin.Context) {
	branchID, _ := ctrl.GetBranchID(c)
	userID, _ := ctrl.GetUserID(c)

	var req request.CreateJournalEntryRequest
	if err := ctrl.BindAndValidate(c, &req); err != nil {
		return
	}

	entry, err := ctrl.journalService.Create(c, branchID, userID, &req)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Journal entry created successfully",
		"data":    entry,
	})
}

// Get returns a single journal entry
func (ctrl *JournalController) Get(c *gin.Context) {
	branchID, _ := ctrl.GetBranchID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	entry, err := ctrl.journalService.GetByID(branchID, id)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	ctrl.SendSuccess(c, "Journal entry retrieved successfully", entry)
}

// Submit submits a draft journal entry for approval
func (ctrl *JournalController) Submit(c *gin.Context) {
	branchID, _ := ctrl.GetBranchID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	userID, _ := ctrl.GetUserID(c)
	var req request.SubmitJournalEntryRequest
	if err := ctrl.BindAndValidate(c, &req); err != nil {
		return
	}

	err = ctrl.journalService.SubmitForApproval(c, branchID, id, userID, req.Comment)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	ctrl.SendSuccess(c, "Journal entry submitted for approval", nil)
}

// Approve approves a submitted journal entry (maps to SubmitForApproval)
func (ctrl *JournalController) Approve(c *gin.Context) {
	branchID, _ := ctrl.GetBranchID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	userID, _ := ctrl.GetUserID(c)
	var req request.SubmitJournalEntryRequest
	if err := ctrl.BindAndValidate(c, &req); err != nil {
		return
	}

	err = ctrl.journalService.SubmitForApproval(c, branchID, id, userID, req.Comment)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	ctrl.SendSuccess(c, "Journal entry approved", nil)
}

// Post posts an approved journal entry to the ledger
func (ctrl *JournalController) Post(c *gin.Context) {
	branchID, _ := ctrl.GetBranchID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	userID, _ := ctrl.GetUserID(c)
	err = ctrl.journalService.PostToLedger(c, branchID, id, userID)
	if err != nil {
		ctrl.HandleError(c, err)
		return
	}

	ctrl.SendSuccess(c, "Journal entry posted to ledger", nil)
}
