package money

import (
	"database/sql/driver"
	"fmt"

	"github.com/shopspring/decimal"
)

// Amount wraps shopspring/decimal for safe DECIMAL(18,4) money operations.
// NEVER use float64 for financial calculations.
//
// Usage:
//
//	amount := money.NewFromString("1500.7500")
//	tax := money.NewFromString("150.0750")
//	total := amount.Add(tax)
type Amount struct {
	decimal.Decimal
}

// Zero returns a zero money amount.
func Zero() Amount {
	return Amount{decimal.NewFromInt(0)}
}

// NewFromString creates a Money amount from a string.
// Use this for all user input and API requests.
func NewFromString(s string) (Amount, error) {
	d, err := decimal.NewFromString(s)
	if err != nil {
		return Zero(), fmt.Errorf("invalid money amount '%s': %w", s, err)
	}
	return Amount{d}, nil
}

// MustNewFromString creates a Money amount from a string and panics on error.
// Only use for known-valid values (e.g., constants, seeds).
func MustNewFromString(s string) Amount {
	d, err := decimal.NewFromString(s)
	if err != nil {
		panic(fmt.Sprintf("invalid money amount '%s': %v", s, err))
	}
	return Amount{d}
}

// NewFromFloat creates a Money amount from float64.
// CAUTION: Prefer NewFromString for user input to avoid floating point issues.
func NewFromFloat(f float64) Amount {
	return Amount{decimal.NewFromFloat(f)}
}

// NewFromInt creates a Money amount from an integer (whole currency units).
func NewFromInt(i int64) Amount {
	return Amount{decimal.NewFromInt(i)}
}

// Add returns the sum of two amounts.
func (a Amount) Add(other Amount) Amount {
	return Amount{a.Decimal.Add(other.Decimal)}
}

// Sub returns the difference of two amounts.
func (a Amount) Sub(other Amount) Amount {
	return Amount{a.Decimal.Sub(other.Decimal)}
}

// Mul multiplies the amount by a decimal factor.
func (a Amount) Mul(factor Amount) Amount {
	return Amount{a.Decimal.Mul(factor.Decimal)}
}

// IsZero returns true if the amount is exactly zero.
func (a Amount) IsZero() bool {
	return a.Decimal.IsZero()
}

// IsPositive returns true if the amount is greater than zero.
func (a Amount) IsPositive() bool {
	return a.Decimal.IsPositive()
}

// IsNegative returns true if the amount is less than zero.
func (a Amount) IsNegative() bool {
	return a.Decimal.IsNegative()
}

// Equal returns true if both amounts are exactly equal.
func (a Amount) Equal(other Amount) bool {
	return a.Decimal.Equal(other.Decimal)
}

// StringFixed returns the amount as a string with 4 decimal places.
func (a Amount) StringFixed() string {
	return a.Decimal.StringFixed(4)
}

// Value implements driver.Valuer for database storage.
func (a Amount) Value() (driver.Value, error) {
	return a.Decimal.String(), nil
}

// Scan implements sql.Scanner for database reading.
func (a *Amount) Scan(value interface{}) error {
	if value == nil {
		a.Decimal = decimal.NewFromInt(0)
		return nil
	}

	switch v := value.(type) {
	case []byte:
		d, err := decimal.NewFromString(string(v))
		if err != nil {
			return fmt.Errorf("failed to scan money amount: %w", err)
		}
		a.Decimal = d
	case string:
		d, err := decimal.NewFromString(v)
		if err != nil {
			return fmt.Errorf("failed to scan money amount: %w", err)
		}
		a.Decimal = d
	case float64:
		a.Decimal = decimal.NewFromFloat(v)
	default:
		return fmt.Errorf("unsupported type for money amount: %T", value)
	}
	return nil
}
