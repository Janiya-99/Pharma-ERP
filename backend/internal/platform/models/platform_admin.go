package models

import (
	"time"

	"gorm.io/gorm"
)

// PlatformAdminUser represents a platform system administrator
type PlatformAdminUser struct {
	ID           uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	Username     string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"username"`
	Email        string         `gorm:"type:varchar(150);uniqueIndex;not null" json:"email"`
	PasswordHash string         `gorm:"type:varchar(255);not null" json:"-"`
	Status       string         `gorm:"type:varchar(50);default:active" json:"status"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}

func (PlatformAdminUser) TableName() string {
	return "platform_admin_users"
}

// PlatformRole represents an admin role
type PlatformRole struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (PlatformRole) TableName() string {
	return "platform_roles"
}

// PlatformPermission represents an admin permission
type PlatformPermission struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string    `gorm:"type:varchar(100);not null" json:"name"`
	Code        string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"code"`
	Description string    `gorm:"type:text" json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (PlatformPermission) TableName() string {
	return "platform_permissions"
}

// PlatformUserRole maps platform user to roles
type PlatformUserRole struct {
	ID                  uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	PlatformAdminUserID uint      `gorm:"not null" json:"platform_admin_user_id"`
	PlatformRoleID      uint      `gorm:"not null" json:"platform_role_id"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

func (PlatformUserRole) TableName() string {
	return "platform_user_roles"
}

// PlatformAuditLog stores platform activities
type PlatformAuditLog struct {
	ID         uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID     uint      `json:"user_id"`
	Action     string    `gorm:"type:varchar(150);not null" json:"action"`
	TargetType string    `gorm:"type:varchar(100)" json:"target_type"`
	TargetID   string    `gorm:"type:varchar(100)" json:"target_id"`
	Details    string    `gorm:"type:text" json:"details"`
	IPAddress  string    `gorm:"type:varchar(50)" json:"ip_address"`
	UserAgent  string    `gorm:"type:varchar(255)" json:"user_agent"`
	CreatedAt  time.Time `json:"created_at"`
}

func (PlatformAuditLog) TableName() string {
	return "platform_audit_logs"
}

// PlatformLoginLog stores platform login activities
type PlatformLoginLog struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID       uint      `json:"user_id"`
	Email        string    `gorm:"type:varchar(150)" json:"email"`
	Status       string    `gorm:"type:varchar(50)" json:"status"`
	IPAddress    string    `gorm:"type:varchar(50)" json:"ip_address"`
	UserAgent    string    `gorm:"type:varchar(255)" json:"user_agent"`
	ErrorMessage string    `gorm:"type:text" json:"error_message"`
	CreatedAt    time.Time `json:"created_at"`
}

func (PlatformLoginLog) TableName() string {
	return "platform_login_logs"
}

// TenantCompany represents the tenant company table in the erp_platform db
type TenantCompany = PlatformCompany

// TenantCompanyDatabase maps company DB connection configurations
type TenantCompanyDatabase struct {
	ID                        uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	TenantCompanyID           uint       `gorm:"not null" json:"tenant_company_id"`
	DatabaseName              string     `gorm:"type:varchar(100);not null" json:"database_name"`
	DatabaseHost              string     `gorm:"type:varchar(100);default:localhost" json:"database_host"`
	DatabaseUsername          string     `gorm:"type:varchar(100)" json:"database_username"`
	DatabasePasswordEncrypted string     `gorm:"type:text" json:"-"`
	DatabaseStatus            string     `gorm:"type:varchar(50);default:pending" json:"database_status"` // pending, created, migration_pending, migration_completed, failed
	MigrationStatus           string     `gorm:"type:varchar(50)" json:"migration_status"`
	LastMigratedAt            *time.Time `json:"last_migrated_at"`
	CreatedAt                 time.Time  `json:"created_at"`
	UpdatedAt                 time.Time  `json:"updated_at"`
}

func (TenantCompanyDatabase) TableName() string {
	return "tenant_company_databases"
}

// TenantCompanyContact stores company contact details
type TenantCompanyContact struct {
	ID              uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	TenantCompanyID uint      `gorm:"not null" json:"tenant_company_id"`
	Name            string    `gorm:"type:varchar(150);not null" json:"name"`
	Email           string    `gorm:"type:varchar(150);not null" json:"email"`
	Phone           string    `gorm:"type:varchar(50)" json:"phone"`
	Role            string    `gorm:"type:varchar(100)" json:"role"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (TenantCompanyContact) TableName() string {
	return "tenant_company_contacts"
}

// TenantCompanyBillingProfile billing profile per tenant company
type TenantCompanyBillingProfile struct {
	ID              uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	TenantCompanyID uint      `gorm:"not null" json:"tenant_company_id"`
	BillingName     string    `gorm:"type:varchar(150);not null" json:"billing_name"`
	BillingEmail    string    `gorm:"type:varchar(150);not null" json:"billing_email"`
	BillingPhone    string    `gorm:"type:varchar(50)" json:"billing_phone"`
	BillingAddress  string    `gorm:"type:text" json:"billing_address"`
	BillingCity     string    `gorm:"type:varchar(100)" json:"billing_city"`
	BillingCountry  string    `gorm:"type:varchar(100)" json:"billing_country"`
	TaxNumber       string    `gorm:"type:varchar(100)" json:"tax_number"`
	PaymentTerms    string    `gorm:"type:varchar(100)" json:"payment_terms"`
	Currency        string    `gorm:"type:varchar(20);default:LKR" json:"currency"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (TenantCompanyBillingProfile) TableName() string {
	return "tenant_company_billing_profiles"
}

// TenantCompanySubscription controls subscriptions purchased by companies
type TenantCompanySubscription struct {
	ID                 uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	TenantCompanyID    uint      `gorm:"not null" json:"tenant_company_id"`
	SubscriptionPlanID uint      `gorm:"not null" json:"subscription_plan_id"`
	SubscriptionNumber string    `gorm:"type:varchar(100)" json:"subscription_number"`
	StartDate          time.Time `json:"start_date"`
	EndDate            time.Time `json:"end_date"`
	BillingCycle       string    `gorm:"type:varchar(50)" json:"billing_cycle"`
	Price              float64   `json:"price"`
	Currency           string    `gorm:"type:varchar(20)" json:"currency"`
	Status             string    `gorm:"type:varchar(50);default:active" json:"status"` // trial, active, past_due, suspended, expired, cancelled
	AutoRenew          bool      `gorm:"default:true" json:"auto_renew"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

func (TenantCompanySubscription) TableName() string {
	return "tenant_company_subscriptions"
}

// TenantCompanyModule mapping of modules enabled per company
type TenantCompanyModule struct {
	ID              uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	TenantCompanyID uint       `gorm:"not null" json:"tenant_company_id"`
	ModuleCode      string     `gorm:"type:varchar(50);not null" json:"module_code"`
	ModuleName      string     `gorm:"type:varchar(150);not null" json:"module_name"`
	IsEnabled       bool       `gorm:"default:true" json:"is_enabled"`
	EnabledAt       *time.Time `json:"enabled_at"`
	DisabledAt      *time.Time `json:"disabled_at"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

func (TenantCompanyModule) TableName() string {
	return "tenant_company_modules"
}

// TenantCompanyFirstUser first system owner record
type TenantCompanyFirstUser struct {
	ID                      uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	TenantCompanyID         uint      `gorm:"not null" json:"tenant_company_id"`
	CompanyDatabaseName     string    `gorm:"type:varchar(100);not null" json:"company_database_name"`
	FirstUserName           string    `gorm:"type:varchar(150);not null" json:"first_user_name"`
	FirstUserEmail          string    `gorm:"type:varchar(150);not null" json:"first_user_email"`
	FirstUserPhone          string    `gorm:"type:varchar(50)" json:"first_user_phone"`
	TemporaryPasswordHash   string    `gorm:"type:varchar(255);not null" json:"-"`
	IsCreatedInTenantDB     bool      `gorm:"default:false" json:"is_created_in_tenant_db"`
	CreatedUserIDInTenantDB uint64    `json:"created_user_id_in_tenant_db"`
	CreatedAt               time.Time `json:"created_at"`
	UpdatedAt               time.Time `json:"updated_at"`
}

func (TenantCompanyFirstUser) TableName() string {
	return "tenant_company_first_users"
}

// SubscriptionPlan represents available pricing tiers
type SubscriptionPlan struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	PlanName     string    `gorm:"type:varchar(150);not null" json:"plan_name"`
	PlanCode     string    `gorm:"type:varchar(50);uniqueIndex;not null" json:"plan_code"`
	Description  string    `gorm:"type:text" json:"description"`
	BillingCycle string    `gorm:"type:varchar(50);default:monthly" json:"billing_cycle"` // monthly, annual, one_time, custom
	MonthlyPrice float64   `json:"monthly_price"`
	AnnualPrice  float64   `json:"annual_price"`
	Currency     string    `gorm:"type:varchar(20);default:LKR" json:"currency"`
	MaxUsers     int       `json:"max_users"`
	MaxBranches  int       `json:"max_branches"`
	MaxCompanies int       `json:"max_companies"`
	IsActive     bool      `gorm:"default:true" json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (SubscriptionPlan) TableName() string {
	return "subscription_plans"
}

// SubscriptionPlanModule links modules included in subscription plans
type SubscriptionPlanModule struct {
	ID                 uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	SubscriptionPlanID uint      `gorm:"not null" json:"subscription_plan_id"`
	ModuleCode         string    `gorm:"type:varchar(50);not null" json:"module_code"` // CONTROL_CENTER, FINANCE, INVENTORY, INVOICE_CENTER
	ModuleName         string    `gorm:"type:varchar(150);not null" json:"module_name"`
	IsIncluded         bool      `gorm:"default:true" json:"is_included"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

func (SubscriptionPlanModule) TableName() string {
	return "subscription_plan_modules"
}

// SubscriptionInvoice invoicing history for tenant subscriptions
type SubscriptionInvoice struct {
	ID                 uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	TenantCompanyID    uint      `gorm:"not null" json:"tenant_company_id"`
	SubscriptionID     uint      `gorm:"not null" json:"subscription_id"`
	InvoiceNumber      string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"invoice_number"`
	InvoiceDate        time.Time `json:"invoice_date"`
	DueDate            time.Time `json:"due_date"`
	BillingPeriodStart time.Time `json:"billing_period_start"`
	BillingPeriodEnd   time.Time `json:"billing_period_end"`
	SubtotalAmount     float64   `json:"subtotal_amount"`
	DiscountAmount     float64   `json:"discount_amount"`
	TaxAmount          float64   `json:"tax_amount"`
	TotalAmount        float64   `json:"total_amount"`
	PaidAmount         float64   `json:"paid_amount"`
	BalanceAmount      float64   `json:"balance_amount"`
	InvoiceStatus      string    `gorm:"type:varchar(50);default:issued" json:"invoice_status"` // draft, issued, paid, partially_paid, overdue, cancelled
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

func (SubscriptionInvoice) TableName() string {
	return "subscription_invoices"
}

// SubscriptionPayment invoice payment receipts
type SubscriptionPayment struct {
	ID                    uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	SubscriptionInvoiceID uint      `gorm:"not null" json:"subscription_invoice_id"`
	TenantCompanyID       uint      `gorm:"not null" json:"tenant_company_id"`
	PaymentDate           time.Time `json:"payment_date"`
	PaymentMethod         string    `gorm:"type:varchar(50)" json:"payment_method"` // cash, bank_transfer, card, online, cheque, other
	ReferenceNumber       string    `gorm:"type:varchar(100)" json:"reference_number"`
	Amount                float64   `json:"amount"`
	PaymentStatus         string    `gorm:"type:varchar(50);default:confirmed" json:"payment_status"` // pending, confirmed, failed, cancelled
	Remarks               string    `gorm:"type:text" json:"remarks"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`
}

func (SubscriptionPayment) TableName() string {
	return "subscription_payments"
}

// ErpModule platform's master list of software modules
type ErpModule struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	ModuleCode  string    `gorm:"type:varchar(50);uniqueIndex;not null" json:"module_code"`
	ModuleName  string    `gorm:"type:varchar(150);not null" json:"module_name"`
	Description string    `gorm:"type:text" json:"description"`
	Status      string    `gorm:"type:varchar(50);default:active" json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (ErpModule) TableName() string {
	return "erp_modules"
}

// ErpFeature features catalog in modules
type ErpFeature struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	ModuleCode  string    `gorm:"type:varchar(50);not null" json:"module_code"`
	FeatureCode string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"feature_code"`
	FeatureName string    `gorm:"type:varchar(150);not null" json:"feature_name"`
	Description string    `gorm:"type:text" json:"description"`
	Status      string    `gorm:"type:varchar(50);default:active" json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (ErpFeature) TableName() string {
	return "erp_features"
}

// ErpVersion platform version release logs
type ErpVersion struct {
	ID            uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	VersionNumber string    `gorm:"type:varchar(50);not null" json:"version_number"`
	ReleaseDate   time.Time `json:"release_date"`
	ReleaseNotes  string    `gorm:"type:text" json:"release_notes"`
	Status        string    `gorm:"type:varchar(50);default:active" json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (ErpVersion) TableName() string {
	return "erp_versions"
}

// FeatureFlag system-wide feature toggle
type FeatureFlag struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	FlagCode    string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"flag_code"`
	FlagName    string    `gorm:"type:varchar(150);not null" json:"flag_name"`
	Description string    `gorm:"type:text" json:"description"`
	IsEnabled   bool      `gorm:"default:false" json:"is_enabled"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (FeatureFlag) TableName() string {
	return "feature_flags"
}

// SystemEmailSetting smtp configuration settings
type SystemEmailSetting struct {
	ID                    uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	SmtpHost              string    `gorm:"type:varchar(150)" json:"smtp_host"`
	SmtpPort              int       `json:"smtp_port"`
	SmtpUsername          string    `gorm:"type:varchar(150)" json:"smtp_username"`
	SmtpPasswordEncrypted string    `gorm:"type:text" json:"smtp_password_encrypted"`
	FromEmail             string    `gorm:"type:varchar(150)" json:"from_email"`
	FromName              string    `gorm:"type:varchar(150)" json:"from_name"`
	IsActive              bool      `gorm:"default:true" json:"is_active"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`
}

func (SystemEmailSetting) TableName() string {
	return "system_email_settings"
}

// SystemPaymentGatewaySetting payment configuration settings
type SystemPaymentGatewaySetting struct {
	ID                 uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	GatewayName        string    `gorm:"type:varchar(100);not null" json:"gateway_name"` // stripe, braintree, local, etc.
	ApiKeyEncrypted    string    `gorm:"type:text" json:"api_key_encrypted"`
	ApiSecretEncrypted string    `gorm:"type:text" json:"api_secret_encrypted"`
	SandboxMode        bool      `gorm:"default:true" json:"sandbox_mode"`
	IsActive           bool      `gorm:"default:true" json:"is_active"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

func (SystemPaymentGatewaySetting) TableName() string {
	return "system_payment_gateway_settings"
}

// SystemBrandingSetting white label configurations
type SystemBrandingSetting struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	PortalName   string    `gorm:"type:varchar(150);default:'Pharma ERP Admin'" json:"portal_name"`
	LogoUrl      string    `gorm:"type:text" json:"logo_url"`
	FaviconUrl   string    `gorm:"type:text" json:"favicon_url"`
	PrimaryColor string    `gorm:"type:varchar(50);default:'#1E3A8A'" json:"primary_color"`
	DarkMode     bool      `gorm:"default:true" json:"dark_mode"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (SystemBrandingSetting) TableName() string {
	return "system_branding_settings"
}

// SystemBackupSetting scheduled snapshot databases settings
type SystemBackupSetting struct {
	ID              uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	BackupProvider  string     `gorm:"type:varchar(50);default:'local'" json:"backup_provider"` // local, s3, gcs
	BucketName      string     `gorm:"type:varchar(150)" json:"bucket_name"`
	BackupFrequency string     `gorm:"type:varchar(50);default:'daily'" json:"backup_frequency"` // hourly, daily, weekly
	RetentionDays   int        `gorm:"default:30" json:"retention_days"`
	LastBackupAt    *time.Time `json:"last_backup_at"`
	IsActive        bool       `gorm:"default:true" json:"is_active"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

func (SystemBackupSetting) TableName() string {
	return "system_backup_settings"
}

// SupportTicket communication channels from clients
type SupportTicket struct {
	ID              uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	TenantCompanyID uint      `gorm:"not null" json:"tenant_company_id"`
	TicketNumber    string    `gorm:"type:varchar(50);uniqueIndex;not null" json:"ticket_number"`
	Subject         string    `gorm:"type:varchar(200);not null" json:"subject"`
	Description     string    `gorm:"type:text" json:"description"`
	Priority        string    `gorm:"type:varchar(50);default:'medium'" json:"priority"` // low, medium, high, urgent
	Status          string    `gorm:"type:varchar(50);default:'open'" json:"status"`     // open, in_progress, resolved, closed
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (SupportTicket) TableName() string {
	return "support_tickets"
}

// SupportTicketMessage message correspondence log
type SupportTicketMessage struct {
	ID              uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	SupportTicketID uint      `gorm:"not null" json:"support_ticket_id"`
	SenderType      string    `gorm:"type:varchar(50);not null" json:"sender_type"` // platform_admin, client_company
	SenderID        uint      `gorm:"not null" json:"sender_id"`                    // user ID
	MessageText     string    `gorm:"type:text;not null" json:"message_text"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (SupportTicketMessage) TableName() string {
	return "support_ticket_messages"
}
