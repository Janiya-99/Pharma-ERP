package seeders

import (
	"strings"

	companyModels "github.com/pixandco/erp-phrma/internal/company/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SeedInventoryPermissions(db *gorm.DB, logger *zap.Logger) error {
	var inventoryModule companyModels.SoftwareModule
	if err := db.Where("software_code = ?", "INVENTORY").First(&inventoryModule).Error; err != nil {
		logger.Warn("INVENTORY software module not found, skipping inventory permissions")
		return nil
	}

	permissions := []struct {
		Group string
		Key   string
		Name  string
	}{
		{"Dashboard", "inventory.dashboard.view", "View Inventory Dashboard"},

		{"Warehouse", "inventory.warehouse.view", "View Warehouse"},
		{"Warehouse", "inventory.warehouse.create", "Create Warehouse"},
		{"Warehouse", "inventory.warehouse.update", "Update Warehouse"},
		{"Warehouse", "inventory.warehouse.delete", "Delete Warehouse"},

		{"Product Category", "inventory.product_category.view", "View Product Category"},
		{"Product Category", "inventory.product_category.create", "Create Product Category"},
		{"Product Category", "inventory.product_category.update", "Update Product Category"},
		{"Product Category", "inventory.product_category.delete", "Delete Product Category"},

		{"Product Master", "inventory.product_master.view", "View Product Master"},
		{"Product Master", "inventory.product_master.create", "Create Product Master"},
		{"Product Master", "inventory.product_master.update", "Update Product Master"},
		{"Product Master", "inventory.product_master.delete", "Delete Product Master"},

		{"Product Batch", "inventory.product_batch.view", "View Product Batch"},
		{"Product Batch", "inventory.product_batch.create", "Create Product Batch"},
		{"Product Batch", "inventory.product_batch.update", "Update Product Batch"},
		{"Product Batch", "inventory.product_batch.block", "Block Product Batch"},
		{"Product Batch", "inventory.product_batch.unblock", "Unblock Product Batch"},

		{"Stock Balance", "inventory.stock_balance.view", "View Stock Balance"},
		{"Stock Ledger", "inventory.stock_ledger.view", "View Stock Ledger"},

		{"Opening Stock", "inventory.opening_stock.view", "View Opening Stock"},
		{"Opening Stock", "inventory.opening_stock.create", "Create Opening Stock"},
		{"Opening Stock", "inventory.opening_stock.update", "Update Opening Stock"},
		{"Opening Stock", "inventory.opening_stock.delete", "Delete Opening Stock"},
		{"Opening Stock", "inventory.opening_stock.submit", "Submit Opening Stock"},
		{"Opening Stock", "inventory.opening_stock.approve", "Approve Opening Stock"},
		{"Opening Stock", "inventory.opening_stock.reject", "Reject Opening Stock"},
		{"Opening Stock", "inventory.opening_stock.post", "Post Opening Stock"},

		{"GRN", "inventory.grn.view", "View GRN"},
		{"GRN", "inventory.grn.create", "Create GRN"},
		{"GRN", "inventory.grn.update", "Update GRN"},
		{"GRN", "inventory.grn.delete", "Delete GRN"},
		{"GRN", "inventory.grn.submit", "Submit GRN"},
		{"GRN", "inventory.grn.approve", "Approve GRN"},
		{"GRN", "inventory.grn.reject", "Reject GRN"},
		{"GRN", "inventory.grn.post", "Post GRN"},

		{"Stock Transfer", "inventory.stock_transfer.view", "View Stock Transfer"},
		{"Stock Transfer", "inventory.stock_transfer.create", "Create Stock Transfer"},
		{"Stock Transfer", "inventory.stock_transfer.update", "Update Stock Transfer"},
		{"Stock Transfer", "inventory.stock_transfer.delete", "Delete Stock Transfer"},
		{"Stock Transfer", "inventory.stock_transfer.submit", "Submit Stock Transfer"},
		{"Stock Transfer", "inventory.stock_transfer.approve", "Approve Stock Transfer"},
		{"Stock Transfer", "inventory.stock_transfer.reject", "Reject Stock Transfer"},
		{"Stock Transfer", "inventory.stock_transfer.post", "Post Stock Transfer"},
	}

	for _, p := range permissions {
		perm := companyModels.Permission{
			SoftwareID:      inventoryModule.ID,
			PermissionGroup: p.Group,
			PermissionKey:   p.Key,
			PermissionName:  p.Name,
			Status:          "active",
		}
		db.Where("permission_key = ?", p.Key).FirstOrCreate(&perm)
	}

	// Fetch roles
	var roles []companyModels.Role
	if err := db.Find(&roles).Error; err != nil {
		return err
	}
	roleMap := make(map[string]uint64)
	for _, r := range roles {
		roleMap[r.RoleCode] = r.ID
	}

	// Fetch permissions
	var allPerms []companyModels.Permission
	db.Find(&allPerms)

	assignPermission := func(roleCode string, permFilter func(key string) bool) {
		rID, ok := roleMap[roleCode]
		if !ok {
			return
		}
		for _, p := range allPerms {
			if permFilter(p.PermissionKey) {
				rp := companyModels.RolePermission{RoleID: rID, PermissionID: p.ID}
				db.Where("role_id = ? AND permission_id = ?", rID, p.ID).FirstOrCreate(&rp)
			}
		}
	}

	// Assign roles
	assignPermission("SUPER_ADMIN", func(k string) bool { return strings.HasPrefix(k, "inventory.") })
	assignPermission("COMPANY_ADMIN", func(k string) bool { return strings.HasPrefix(k, "inventory.") })
	assignPermission("WAREHOUSE_MANAGER", func(k string) bool { return strings.HasPrefix(k, "inventory.") })

	assignPermission("STOCK_CONTROLLER", func(k string) bool {
		return k == "inventory.warehouse.view" ||
			k == "inventory.product_master.view" ||
			k == "inventory.product_batch.view" ||
			k == "inventory.stock_balance.view" ||
			k == "inventory.stock_ledger.view" ||
			k == "inventory.product_batch.create" ||
			k == "inventory.product_batch.update" ||
			k == "inventory.product_batch.unblock" ||
			k == "inventory.opening_stock.create" ||
			k == "inventory.opening_stock.update" ||
			k == "inventory.opening_stock.delete" ||
			k == "inventory.opening_stock.submit" ||
			k == "inventory.grn.create" ||
			k == "inventory.grn.update" ||
			k == "inventory.grn.delete" ||
			k == "inventory.grn.submit" ||
			k == "inventory.stock_transfer.create" ||
			k == "inventory.stock_transfer.update" ||
			k == "inventory.stock_transfer.delete" ||
			k == "inventory.stock_transfer.submit"
	})

	assignPermission("INVENTORY_VIEWER", func(k string) bool {
		return strings.HasPrefix(k, "inventory.") && strings.HasSuffix(k, ".view")
	})

	assignPermission("INVENTORY_APPROVER", func(k string) bool {
		return strings.HasPrefix(k, "inventory.") && (strings.HasSuffix(k, ".view") || strings.HasSuffix(k, ".approve") || strings.HasSuffix(k, ".reject") || strings.HasSuffix(k, ".post"))
	})

	logger.Info("Inventory Permissions seeding completed")
	return nil
}
