package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pixandco/erp-phrma/internal/middleware"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type ControlDashboardHandler struct {
	logger *zap.Logger
}

func NewControlDashboardHandler(logger *zap.Logger) *ControlDashboardHandler {
	return &ControlDashboardHandler{logger: logger}
}

type RoleDistItem struct {
	Name       string `json:"name"`
	Percentage int    `json:"percentage"`
	Count      int    `json:"count"`
	Color      string `json:"color"`
}

type ModuleAdoptionItem struct {
	Name  string `json:"name"`
	Rate  string `json:"rate"`
	Color string `json:"color"`
}

type SecurityEventItem struct {
	ID          uint64     `json:"id"`
	Severity    string     `json:"severity"`
	Description string     `json:"description"`
	User        string     `json:"user"`
	IP          string     `json:"ip"`
	Time        string     `json:"time"`
	CreatedAt   *time.Time `json:"created_at,omitempty"`
}

type TelemetryItem struct {
	Day          string `json:"day"`
	Users        int    `json:"users"`
	Transactions int    `json:"transactions"`
	API          int    `json:"api"`
}

func (h *ControlDashboardHandler) GetSummary(c *gin.Context) {
	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Tenant database context missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	authCtxVal, _ := c.Get("authContext")
	authCtx, ok := authCtxVal.(*middleware.AuthContext)
	var companyID uint64
	if ok && authCtx != nil {
		companyID = authCtx.CompanyID
	} else if cid, ok2 := c.Get("company_id"); ok2 {
		companyID = cid.(uint64)
	}

	// 1. Total Branches
	var totalBranches int64
	db.Table("branches").Where("company_id = ? AND status = 'active'", companyID).Count(&totalBranches)
	if totalBranches == 0 {
		db.Table("branches").Where("company_id = ?", companyID).Count(&totalBranches)
	}

	// 2. Total Users
	var totalUsers int64
	db.Table("users").Where("status = 'active'").Count(&totalUsers)

	// 3. Activated Modules
	var activatedModules int64
	db.Table("software_modules").Where("status = 'active'").Count(&activatedModules)
	if activatedModules == 0 {
		activatedModules = 4
	}

	// 4. Security Alerts (Failed logins or critical events)
	var securityAlerts int64
	db.Table("login_logs").Where("login_status != 'success'").Count(&securityAlerts)
	if securityAlerts == 0 {
		var auditCount int64
		db.Table("audit_logs").Where("company_id = ?", companyID).Count(&auditCount)
		securityAlerts = auditCount
	}

	// 5. Telemetry Data (Last 7 Days)
	now := time.Now()
	var telemetry []TelemetryItem
	for i := 6; i >= 0; i-- {
		t := now.AddDate(0, 0, -i)
		startOfDay := time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)
		endOfDay := startOfDay.AddDate(0, 0, 1).Add(-time.Nanosecond)
		dayName := t.Format("Mon")

		var txCount int64
		var invCount, grnCount, jrnCount int64
		db.Table("sales_invoices").Where("company_id = ? AND invoice_date BETWEEN ? AND ?", companyID, startOfDay, endOfDay).Count(&invCount)
		db.Table("goods_receipt_notes").Where("company_id = ? AND grn_date BETWEEN ? AND ?", companyID, startOfDay, endOfDay).Count(&grnCount)
		db.Table("journal_entries").Where("company_id = ? AND entry_date BETWEEN ? AND ?", companyID, startOfDay, endOfDay).Count(&jrnCount)
		txCount = invCount + grnCount + jrnCount

		var apiCount int64
		db.Table("audit_logs").Where("company_id = ? AND created_at BETWEEN ? AND ?", companyID, startOfDay, endOfDay).Count(&apiCount)
		userCount := int(totalUsers)

		telemetry = append(telemetry, TelemetryItem{
			Day:          dayName,
			Users:        userCount,
			Transactions: int(txCount),
			API:          int(apiCount),
		})
	}

	// 6. Role Distribution
	type RoleCount struct {
		Name  string
		Count int
	}
	var roleCounts []RoleCount
	db.Raw(`
		SELECT r.role_name as name, COUNT(ur.user_id) as count
		FROM roles r
		LEFT JOIN user_branch_roles ur ON ur.role_id = r.id
		GROUP BY r.id, r.role_name
		ORDER BY count DESC
	`).Scan(&roleCounts)

	colors := []string{"#3b82f6", "#6366f1", "#06b6d4", "#f43f5e", "#f59e0b", "#10b981", "#8b5cf6"}
	var roleDist []RoleDistItem
	var totalRoleUsers int
	for _, rc := range roleCounts {
		totalRoleUsers += rc.Count
	}
	if totalRoleUsers == 0 {
		totalRoleUsers = 1
	}

	for idx, rc := range roleCounts {
		pct := int((float64(rc.Count) / float64(totalRoleUsers)) * 100)
		color := colors[idx%len(colors)]
		roleDist = append(roleDist, RoleDistItem{
			Name:       rc.Name,
			Percentage: pct,
			Count:      rc.Count,
			Color:      color,
		})
	}

	// 7. Module Adoption
	var prodCount, soCount, grnTotal, jrnTotal int64
	db.Table("products").Where("company_id = ?", companyID).Count(&prodCount)
	db.Table("sales_invoices").Where("company_id = ?", companyID).Count(&soCount)
	db.Table("goods_receipt_notes").Where("company_id = ?", companyID).Count(&grnTotal)
	db.Table("journal_entries").Where("company_id = ?", companyID).Count(&jrnTotal)

	rateOf := func(cnt int64) string {
		if cnt > 0 {
			return "Active"
		}
		return "0 records"
	}

	moduleAdoption := []ModuleAdoptionItem{
		{Name: "Inventory Management", Rate: rateOf(prodCount), Color: "bg-blue-500"},
		{Name: "Invoice Center & Sales", Rate: rateOf(soCount), Color: "bg-indigo-500"},
		{Name: "Procurement (GRN)", Rate: rateOf(grnTotal), Color: "bg-sky-500"},
		{Name: "Finance & Accounting", Rate: rateOf(jrnTotal), Color: "bg-cyan-500"},
		{Name: "Control Center & Security", Rate: rateOf(totalUsers), Color: "bg-teal-500"},
		{Name: "Branch & Multi-Tenant", Rate: rateOf(totalBranches), Color: "bg-emerald-500"},
	}

	// 8. Security Governance Events
	auditDateFrom := c.Query("audit_date_from")
	auditDateTo := c.Query("audit_date_to")
	auditSeverity := c.Query("audit_severity")

	var secEvents []SecurityEventItem
	auditQuery := db.Table("audit_logs a").
		Select(`
			a.id,
			CASE 
			  WHEN a.action LIKE '%delete%' OR a.action LIKE '%cancel%' THEN 'CRITICAL'
			  WHEN a.action LIKE '%assign%' OR a.action LIKE '%update%' THEN 'WARNING'
			  WHEN a.action LIKE '%login%' OR a.action LIKE '%create%' THEN 'INFO'
			  ELSE 'SUCCESS'
			END as severity,
			CONCAT(a.action, ' on ', a.entity_name) as description,
			COALESCE(u.name, 'Admin') as user,
			COALESCE(a.ip_address, '127.0.0.1') as ip,
			DATE_FORMAT(a.created_at, '%b %d, %H:%i') as time,
			a.created_at
		`).
		Joins("LEFT JOIN users u ON u.id = a.user_id").
		Where("a.company_id = ?", companyID)

	if auditDateFrom != "" {
		auditQuery = auditQuery.Where("DATE(a.created_at) >= ?", auditDateFrom)
	}
	if auditDateTo != "" {
		auditQuery = auditQuery.Where("DATE(a.created_at) <= ?", auditDateTo)
	}
	if auditSeverity != "" && auditSeverity != "ALL" {
		auditQuery = auditQuery.Where(`(CASE 
			WHEN a.action LIKE '%delete%' OR a.action LIKE '%cancel%' THEN 'CRITICAL' 
			WHEN a.action LIKE '%assign%' OR a.action LIKE '%update%' THEN 'WARNING' 
			WHEN a.action LIKE '%login%' OR a.action LIKE '%create%' THEN 'INFO' 
			ELSE 'SUCCESS' 
		END) = ?`, auditSeverity)
	}
	auditQuery.Order("a.created_at DESC, a.id DESC").Limit(20).Scan(&secEvents)

	if len(secEvents) == 0 {
		// Fallback to recent login logs
		loginQuery := db.Table("login_logs l").
			Select(`
				l.id,
				CASE WHEN l.login_status = 'success' THEN 'SUCCESS' ELSE 'WARNING' END as severity,
				CONCAT('User Login ', l.login_status) as description,
				COALESCE(u.name, l.email) as user,
				l.ip_address as ip,
				DATE_FORMAT(l.logged_at, '%b %d, %H:%i') as time,
				l.logged_at as created_at
			`).
			Joins("LEFT JOIN users u ON u.id = l.user_id")

		if auditDateFrom != "" {
			loginQuery = loginQuery.Where("DATE(l.logged_at) >= ?", auditDateFrom)
		}
		if auditDateTo != "" {
			loginQuery = loginQuery.Where("DATE(l.logged_at) <= ?", auditDateTo)
		}
		if auditSeverity != "" && auditSeverity != "ALL" {
			loginQuery = loginQuery.Where("(CASE WHEN l.login_status = 'success' THEN 'SUCCESS' ELSE 'WARNING' END) = ?", auditSeverity)
		}
		loginQuery.Order("l.logged_at DESC, l.id DESC").Limit(20).Scan(&secEvents)
	}

	if secEvents == nil {
		secEvents = []SecurityEventItem{}
	}
	if roleDist == nil {
		roleDist = []RoleDistItem{}
	}

	type rawDoc struct {
		ID        uint64    `gorm:"column:id"`
		DocNum    string    `gorm:"column:doc_num"`
		Title     string    `gorm:"column:title"`
		Category  string    `gorm:"column:category"`
		Party     string    `gorm:"column:party"`
		CreatedAt time.Time `gorm:"column:created_at"`
		Amount    float64   `gorm:"column:amount"`
		DocType   string    `gorm:"column:doc_type"`
		Status    string    `gorm:"column:status"`
		PrintPath string    `gorm:"column:print_path"`
	}
	var rawDocs []rawDoc
	db.Raw(`
		SELECT id, invoice_number as doc_num, 'Sales Invoice' as title, 'invoices' as category,
		       COALESCE((SELECT customer_name FROM customers WHERE customers.id = sales_invoices.customer_id), 'Customer') as party,
		       created_at, total_amount as amount, 'Sales Invoice' as doc_type, approval_status as status,
		       CONCAT('/invoice-center/sales-invoices/', id) as print_path
		FROM sales_invoices
		WHERE company_id = ?
		ORDER BY created_at DESC
		LIMIT 8
	`, companyID).Scan(&rawDocs)

	type RecentDocItem struct {
		ID             string `json:"id"`
		DocumentNumber string `json:"document_number"`
		Title          string `json:"title"`
		Category       string `json:"category"`
		Counterparty   string `json:"counterparty"`
		Date           string `json:"date"`
		Amount         string `json:"amount"`
		Size           string `json:"size"`
		Type           string `json:"type"`
		BadgeColor     string `json:"badgeColor"`
		Status         string `json:"status"`
		StatusColor    string `json:"statusColor"`
		PrintPath      string `json:"printPath"`
	}
	var recentDocs []RecentDocItem
	for _, d := range rawDocs {
		recentDocs = append(recentDocs, RecentDocItem{
			ID:             fmt.Sprintf("doc-%d", d.ID),
			DocumentNumber: d.DocNum,
			Title:          d.Title,
			Category:       d.Category,
			Counterparty:   d.Party,
			Date:           d.CreatedAt.Format("2006-01-02 15:04"),
			Amount:         fmt.Sprintf("LKR %.2f", d.Amount),
			Size:           "128 KB",
			Type:           d.DocType,
			BadgeColor:     "bg-blue-50 text-blue-700 border-blue-200",
			Status:         d.Status,
			StatusColor:    "text-emerald-700 bg-emerald-50 border-emerald-200",
			PrintPath:      d.PrintPath,
		})
	}
	if recentDocs == nil {
		recentDocs = []RecentDocItem{}
	}

	blockedIPs := fetchBlockedIPs(db)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Control Center dashboard loaded successfully",
		"data": gin.H{
			"total_branches":    totalBranches,
			"total_users":       totalUsers,
			"activated_modules": activatedModules,
			"total_modules":     6,
			"security_alerts":   securityAlerts,
			"telemetry":         telemetry,
			"role_distribution": roleDist,
			"module_adoption":   moduleAdoption,
			"security_events":   secEvents,
			"blocked_ips":       blockedIPs,
			"recent_documents":  recentDocs,
		},
	})
}

type BlockedIPItem struct {
	IP          string `json:"ip"`
	FailedCount int64  `json:"failed_count"`
	LastAttempt string `json:"last_attempt"`
	Reason      string `json:"reason"`
	Status      string `json:"status"` // "BLOCKED" or "FLAGGED"
	IsRule      bool   `json:"is_rule"`
}

func fetchBlockedIPs(db *gorm.DB) []BlockedIPItem {
	var items []BlockedIPItem

	type FailedIPRow struct {
		IP          string
		Count       int64
		LastAttempt time.Time
		Reason      string
	}
	var failedRows []FailedIPRow
	db.Raw(`
		SELECT ip_address as ip, COUNT(*) as count, MAX(logged_at) as last_attempt, MAX(failure_reason) as reason
		FROM login_logs
		WHERE login_status = 'failed' AND ip_address != '' AND ip_address != '127.0.0.1' AND ip_address != '::1'
		GROUP BY ip_address
		HAVING count >= 2
		ORDER BY last_attempt DESC
		LIMIT 10
	`).Scan(&failedRows)

	for _, row := range failedRows {
		status := "FLAGGED"
		if row.Count >= 4 {
			status = "BLOCKED"
		}
		timeStr := row.LastAttempt.Format("Jan 02, 15:04")
		reason := row.Reason
		if reason == "" {
			reason = "Multiple failed login attempts"
		}
		items = append(items, BlockedIPItem{
			IP:          row.IP,
			FailedCount: row.Count,
			LastAttempt: timeStr,
			Reason:      reason,
			Status:      status,
			IsRule:      false,
		})
	}

	// Also inspect trusted_ip_rules for explicit deny rules
	type DenyRuleRow struct {
		IPRange   string
		CreatedAt time.Time
		RuleName  string
	}
	var denyRules []DenyRuleRow
	db.Raw(`
		SELECT ip_range, created_at, rule_name
		FROM trusted_ip_rules
		WHERE access_type = 'deny' AND is_active = true
	`).Scan(&denyRules)

	for _, rule := range denyRules {
		found := false
		for _, it := range items {
			if it.IP == rule.IPRange {
				found = true
				break
			}
		}
		if !found {
			items = append(items, BlockedIPItem{
				IP:          rule.IPRange,
				FailedCount: 0,
				LastAttempt: rule.CreatedAt.Format("Jan 02, 15:04"),
				Reason:      "Firewall deny rule: " + rule.RuleName,
				Status:      "BLOCKED",
				IsRule:      true,
			})
		}
	}

	if items == nil {
		items = []BlockedIPItem{}
	}
	return items
}

func (h *ControlDashboardHandler) GetBlockedIPs(c *gin.Context) {
	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Tenant database context missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	blocked := fetchBlockedIPs(db)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": blocked})
}

func (h *ControlDashboardHandler) UnblockIP(c *gin.Context) {
	companyDB, exists := c.Get("companyDB")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Tenant database context missing"})
		return
	}
	db := companyDB.(*gorm.DB)

	var req struct {
		IP string `json:"ip"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.IP == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Valid IP address is required"})
		return
	}

	// 1. Reset failed login attempts in login_logs for this IP
	db.Exec("UPDATE login_logs SET login_status = 'unblocked' WHERE ip_address = ? AND login_status = 'failed'", req.IP)

	// 2. If there is a deny rule in trusted_ip_rules, disable it
	db.Exec("UPDATE trusted_ip_rules SET is_active = false WHERE ip_range = ? AND access_type = 'deny'", req.IP)

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "IP " + req.IP + " unblocked successfully. Authentication restrictions cleared."})
}
