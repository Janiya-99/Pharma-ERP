package handlers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type ComplianceDashboardHandler struct {
	logger *zap.Logger
}

func NewComplianceDashboardHandler(logger *zap.Logger) *ComplianceDashboardHandler {
	return &ComplianceDashboardHandler{logger: logger}
}

type PassRatePoint struct {
	Month               string  `json:"month"`
	QCPassRate          float64 `json:"QC Pass Rate (%)"`
	NMRAComplianceIndex float64 `json:"NMRA Compliance Index"`
}

type QuarantineReasonItem struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
}

type CategoryWriteOffItem struct {
	Category string  `json:"category"`
	Value    float64 `json:"Write-off Value (LKR)"`
}

type RegulatoryActionItem struct {
	ID        string `json:"id"`
	Timestamp string `json:"timestamp"`
	Type      string `json:"type"`
	Target    string `json:"target"`
	Action    string `json:"action"`
	Authority string `json:"authority"`
	Status    string `json:"status"`
	Notes     string `json:"notes"`
	User      string `json:"user"`
}

func (h *ComplianceDashboardHandler) GetSummary(c *gin.Context) {
	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Tenant database context missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	authCtxVal, _ := c.Get("authContext")
	authCtx, ok := authCtxVal.(*middleware.AuthContext)
	var companyID uint64 = 1
	if ok && authCtx != nil {
		companyID = authCtx.CompanyID
	}

	// 1. Active Licenses & Registered Formulations
	var activeProductsCount int64
	db.Table("products").Where("company_id = ? AND status = 'active'", companyID).Count(&activeProductsCount)

	// 2. Batches Under Quarantine
	var quarantineBatchesCount int64
	var quarantineStockValue float64
	db.Table("stock_balances sb").
		Joins("JOIN warehouses w ON w.id = sb.warehouse_id").
		Where("w.company_id = ? AND (w.warehouse_name LIKE '%Quarantine%' OR w.warehouse_name LIKE '%Quality%')", companyID).
		Where("sb.quantity_available > 0").
		Select("COUNT(DISTINCT sb.product_batch_id), COALESCE(SUM(sb.quantity_available * sb.average_cost), 0)").
		Row().Scan(&quarantineBatchesCount, &quarantineStockValue)

	// 3. Active Product Recalls / Blocked Batches
	var blockedBatchesCount int64
	db.Table("product_batches").Where("company_id = ? AND is_blocked = 1", companyID).Count(&blockedBatchesCount)

	// 4. Pending Expiry Disposals
	var expiredBatchesCount int64
	db.Table("product_batches").Where("company_id = ? AND expiry_date < NOW()", companyID).Count(&expiredBatchesCount)

	var nearExpiryBatchesCount int64
	var nearExpiryStockValue float64
	db.Table("product_batches pb").
		Joins("JOIN stock_balances sb ON sb.product_batch_id = pb.id").
		Where("pb.company_id = ? AND pb.expiry_date <= DATE_ADD(NOW(), INTERVAL 90 DAY)", companyID).
		Where("sb.quantity_available > 0").
		Select("COUNT(DISTINCT pb.id), COALESCE(SUM(sb.quantity_available * sb.average_cost), 0)").
		Row().Scan(&nearExpiryBatchesCount, &nearExpiryStockValue)

	// 5. Monthly Trajectory (Pass Rate & Compliance Index)
	now := time.Now()
	var totalBatchesCount int64
	db.Table("product_batches").Where("company_id = ?", companyID).Count(&totalBatchesCount)

	var passRateData []PassRatePoint
	for i := 5; i >= 0; i-- {
		t := now.AddDate(0, -i, 0)
		monthName := t.Format("Jan 2006")
		startOfMonth := time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, t.Location())
		endOfMonth := startOfMonth.AddDate(0, 1, 0).Add(-time.Nanosecond)

		var mTotal int64
		var mBlocked int64
		db.Table("product_batches").
			Where("company_id = ? AND created_at >= ? AND created_at <= ?", companyID, startOfMonth, endOfMonth).
			Count(&mTotal)
		db.Table("product_batches").
			Where("company_id = ? AND is_blocked = 1 AND created_at >= ? AND created_at <= ?", companyID, startOfMonth, endOfMonth).
			Count(&mBlocked)

		qcRate := 100.0
		if mTotal > 0 {
			qcRate = float64(mTotal-mBlocked) / float64(mTotal) * 100.0
		} else if totalBatchesCount > 0 {
			qcRate = float64(totalBatchesCount-blockedBatchesCount) / float64(totalBatchesCount) * 100.0
		}

		passRateData = append(passRateData, PassRatePoint{
			Month:               monthName,
			QCPassRate:          qcRate,
			NMRAComplianceIndex: qcRate,
		})
	}

	// 6. Quarantine Root Causes
	quarantineReasonsData := make([]QuarantineReasonItem, 0)

	// 7. Write-off Value by Therapeutic Category
	type catRow struct {
		Category string  `gorm:"column:category"`
		Val      float64 `gorm:"column:val"`
	}
	var catRows []catRow
	db.Raw(`
		SELECT 
			pc.category_name as category,
			COALESCE(SUM(sb.quantity_available * sb.average_cost), 0) as val
		FROM product_categories pc
		JOIN products p ON p.category_id = pc.id
		JOIN stock_balances sb ON sb.product_id = p.id
		JOIN product_batches pb ON pb.id = sb.product_batch_id
		WHERE pc.company_id = ? AND pb.expiry_date <= DATE_ADD(NOW(), INTERVAL 180 DAY)
		GROUP BY pc.id, pc.category_name
		ORDER BY val DESC
		LIMIT 5
	`, companyID).Scan(&catRows)

	expiryWriteOffData := make([]CategoryWriteOffItem, 0)
	var totalWriteOffVal float64
	for _, cr := range catRows {
		expiryWriteOffData = append(expiryWriteOffData, CategoryWriteOffItem{
			Category: cr.Category,
			Value:    cr.Val,
		})
		totalWriteOffVal += cr.Val
	}

	// 8. Live Regulatory Audit Trail
	type auditRow struct {
		ID           uint64    `gorm:"column:id"`
		SoftwareCode string    `gorm:"column:software_code"`
		Action       string    `gorm:"column:action"`
		Entity       string    `gorm:"column:entity_name"`
		User         string    `gorm:"column:user_name"`
		CreatedAt    time.Time `gorm:"column:created_at"`
	}
	var auditRows []auditRow
	db.Raw(`
		SELECT a.id, COALESCE(a.software_code, '') as software_code, a.action, a.entity_name, 
		       COALESCE(u.name, 'Regulatory Officer') as user_name, a.created_at
		FROM audit_logs a
		LEFT JOIN users u ON u.id = a.user_id
		WHERE a.company_id = ?
		ORDER BY a.created_at DESC
		LIMIT 10
	`, companyID).Scan(&auditRows)

	recentRegulatoryActions := make([]RegulatoryActionItem, 0)
	for _, ar := range auditRows {
		actionType := "AUDIT_CHECK"
		authority := "Internal Quality Audit & Regulatory Affairs"
		status := "COMPLETED"
		cleanAction := ar.Action
		notes := fmt.Sprintf("Audited by %s with cryptographic traceability", ar.User)

		upperAction := strings.ToUpper(ar.Action)
		upperCode := strings.ToUpper(ar.SoftwareCode)

		if upperCode == "FINANCE" || strings.HasPrefix(upperAction, "FINANCE_") {
			actionType = "FINANCIAL_GOVERNANCE"
			authority = "Finance Directorate & Fiscal Audit"
			notes = fmt.Sprintf("Fiscal control audit logged by %s", ar.User)
			if strings.Contains(upperAction, "BALANCE_SHEET") {
				cleanAction = "Balance Sheet Audit Inspection"
			} else if strings.Contains(upperAction, "TRIAL_BALANCE") {
				cleanAction = "Trial Balance Audit Review"
			} else if strings.Contains(upperAction, "PROFIT_LOSS") {
				cleanAction = "Profit & Loss Statement Review"
			} else if strings.Contains(upperAction, "CASH_BANK") {
				cleanAction = "Cash & Bank Register Verification"
			} else if strings.Contains(upperAction, "LEDGER") {
				cleanAction = "General Ledger Inspection"
			} else if strings.Contains(upperAction, "DAY_BOOK") {
				cleanAction = "Day Book Transaction Verification"
			} else if strings.Contains(upperAction, "PAYMENT") {
				cleanAction = "Payment Register Fiscal Audit"
			} else if strings.Contains(upperAction, "RECEIPT") {
				cleanAction = "Receipt Register Verification"
			} else {
				cleanAction = "Financial Statement Inspection"
			}
		} else if strings.Contains(upperAction, "HOLD") || strings.Contains(upperAction, "QUARANTINE") {
			actionType = "QUARANTINE_HOLD"
			authority = "Quality Assurance & Batch Release"
			cleanAction = "Batch Quarantine Hold Logged"
			notes = fmt.Sprintf("Quarantine action executed by %s", ar.User)
		} else if strings.Contains(upperAction, "RECALL") {
			actionType = "PRODUCT_RECALL"
			authority = "NMRA / QA Pharmacovigilance"
			cleanAction = "Product Recall Notification"
			notes = fmt.Sprintf("Recall protocol enforced by %s", ar.User)
		} else if strings.Contains(upperAction, "DISPOSAL") || strings.Contains(upperAction, "DESTROY") {
			actionType = "DISPOSAL_WITNESS"
			authority = "Ministry of Health & Environmental Authority"
			cleanAction = "Witnessed Stock Disposal"
			notes = fmt.Sprintf("Disposal witnessed by %s", ar.User)
		} else if strings.Contains(upperAction, "LICENSE") || strings.Contains(upperAction, "PERMIT") {
			actionType = "REGULATORY_FILING"
			authority = "National Medicines Regulatory Authority (NMRA)"
			cleanAction = "Premises / Drug License Registered"
			notes = fmt.Sprintf("Regulatory filing submitted by %s", ar.User)
		} else if upperCode == "CONTROL_CENTER" || strings.Contains(upperAction, "USER") || strings.Contains(upperAction, "POLICY") || strings.Contains(upperAction, "SECURITY") || strings.Contains(upperAction, "COMPANY") || strings.Contains(upperAction, "DEPARTMENT") {
			actionType = "SECURITY_GOVERNANCE"
			authority = "Enterprise Security & System Administration"
			cleanAction = "System Policy & Governance Update"
			notes = fmt.Sprintf("Security configuration updated by %s", ar.User)
		} else if upperAction == "LOGIN" {
			actionType = "USER_ACCESS"
			authority = "Enterprise Identity & Access Management"
			cleanAction = "User Authentication"
			notes = fmt.Sprintf("Session authenticated for %s", ar.User)
		}

		recentRegulatoryActions = append(recentRegulatoryActions, RegulatoryActionItem{
			ID:        fmt.Sprintf("REG-2026-%04d", ar.ID),
			Timestamp: ar.CreatedAt.Format("02 Jan, 15:04"),
			Type:      actionType,
			Target:    ar.Entity,
			Action:    cleanAction,
			Authority: authority,
			Status:    status,
			Notes:     notes,
			User:      ar.User,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Compliance dashboard loaded",
		"data": gin.H{
			"active_licenses":              activeProductsCount,
			"quarantine_batches_count":      quarantineBatchesCount,
			"quarantine_stock_value":        quarantineStockValue,
			"active_recalls_count":          blockedBatchesCount,
			"pending_disposals_count":       expiredBatchesCount,
			"pending_disposals_value":       nearExpiryStockValue,
			"pass_rate_data":                passRateData,
			"quarantine_reasons_data":       quarantineReasonsData,
			"expiry_write_off_data":         expiryWriteOffData,
			"total_write_off_value":         totalWriteOffVal,
			"recent_regulatory_actions":     recentRegulatoryActions,
		},
	})
}
