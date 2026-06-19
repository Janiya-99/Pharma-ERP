package seeder

import (
	"log"

	"github.com/pixandco/erp-phrma/internal/model"
	"gorm.io/gorm"
)

// Seed runs all defined seeders.
func Seed(db *gorm.DB) error {
	log.Println("Starting database seeding...")

	if err := SeedPermissions(db); err != nil {
		return err
	}

	if err := SeedTenant(db); err != nil {
		return err
	}

	if err := SeedFinance(db); err != nil {
		return err
	}

	log.Println("Database seeding completed successfully.")
	return nil
}

// SeedPermissions inserts default permissions into the database.
func SeedPermissions(db *gorm.DB) error {
	permissions := []model.Permission{
		// Auth
		{Module: "auth", Resource: "users", Action: "create", Slug: "auth.users.create"},
		{Module: "auth", Resource: "users", Action: "read", Slug: "auth.users.read"},
		{Module: "auth", Resource: "users", Action: "update", Slug: "auth.users.update"},
		{Module: "auth", Resource: "users", Action: "delete", Slug: "auth.users.delete"},
		{Module: "auth", Resource: "roles", Action: "create", Slug: "auth.roles.create"},
		{Module: "auth", Resource: "roles", Action: "read", Slug: "auth.roles.read"},
		{Module: "auth", Resource: "roles", Action: "update", Slug: "auth.roles.update"},
		{Module: "auth", Resource: "roles", Action: "delete", Slug: "auth.roles.delete"},
		{Module: "auth", Resource: "roles", Action: "assign", Slug: "auth.roles.assign"},

		// Finance: Chart of Accounts
		{Module: "finance", Resource: "chart_of_accounts", Action: "create", Slug: "finance.chart_of_accounts.create"},
		{Module: "finance", Resource: "chart_of_accounts", Action: "read", Slug: "finance.chart_of_accounts.read"},
		{Module: "finance", Resource: "chart_of_accounts", Action: "update", Slug: "finance.chart_of_accounts.update"},
		{Module: "finance", Resource: "chart_of_accounts", Action: "delete", Slug: "finance.chart_of_accounts.delete"},

		// Finance: Journal Entries
		{Module: "finance", Resource: "journal_entries", Action: "create", Slug: "finance.journal_entries.create"},
		{Module: "finance", Resource: "journal_entries", Action: "read", Slug: "finance.journal_entries.read"},
		{Module: "finance", Resource: "journal_entries", Action: "update", Slug: "finance.journal_entries.update"},
		{Module: "finance", Resource: "journal_entries", Action: "delete", Slug: "finance.journal_entries.delete"},
		{Module: "finance", Resource: "journal_entries", Action: "submit", Slug: "finance.journal_entries.submit"},
		{Module: "finance", Resource: "journal_entries", Action: "approve", Slug: "finance.journal_entries.approve"},
		{Module: "finance", Resource: "journal_entries", Action: "post", Slug: "finance.journal_entries.post"},
		{Module: "finance", Resource: "journal_entries", Action: "void", Slug: "finance.journal_entries.void"},

		// Finance: Ledger
		{Module: "finance", Resource: "ledger", Action: "read", Slug: "finance.ledger.read"},

		// Finance: Fiscal Years
		{Module: "finance", Resource: "fiscal_years", Action: "create", Slug: "finance.fiscal_years.create"},
		{Module: "finance", Resource: "fiscal_years", Action: "read", Slug: "finance.fiscal_years.read"},
		{Module: "finance", Resource: "fiscal_years", Action: "close", Slug: "finance.fiscal_years.close"},

		// Audit
		{Module: "audit", Resource: "audit_logs", Action: "read", Slug: "audit.audit_logs.read"},
	}

	for _, p := range permissions {
		// Use FirstOrCreate to avoid duplicates if seeding multiple times
		err := db.Where("slug = ?", p.Slug).FirstOrCreate(&p).Error
		if err != nil {
			log.Printf("Error seeding permission %s: %v", p.Slug, err)
			return err
		}
	}

	log.Println("Permissions seeded.")
	return nil
}
