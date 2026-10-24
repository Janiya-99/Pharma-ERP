# Double-Entry Ledger Reconciliation Proof

**Audit Target:** CeylonMed Global ERP — Financial Year 2026/2027  
**Accounting Standard:** LKAS 1 / SLFRS Statement of Financial Position  
**Verification Method:** Independent General Ledger & Trial Balance Aggregation  
**Equilibrium Tolerance:** LKR 0.00 (Zero Variance)  

---

## 1. Accounting Formula & Theorem of Equilibrium

In double-entry statutory bookkeeping, every financial transaction produces equal debit and credit entries.
The Statement of Financial Position reflects this fundamental identity:

$$\mathbf{Assets = Liabilities + Equity}$$

$$\mathbf{Assets - (Liabilities + Equity) = 0.00}$$

Where:
$$\mathbf{Equity = Share\ Capital + Retained\ Earnings + Current\ Period\ Net\ Profit}$$
$$\mathbf{Current\ Period\ Net\ Profit = Revenue - Cost\ of\ Goods\ Sold - Operating\ Expenses}$$

---

## 2. General Ledger Account Extract (FY 2026/2027)

The following ledger lines were retrieved directly from the database table `chart_of_accounts`, `journal_entries`, and `payment_vouchers`:

| Account Code | Account Name | Master Classification | Normal Balance | Period Net Balance (LKR) | Financial Position Category |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`100003`** | Bank Account | Current Assets | Debit | `40,565,999.44` | Current Assets (Cash & Cash Equivalents) |
| **`110001`** | Trade Debtors | Current Assets | Debit | `100,000,000.00` | Current Assets (Trade & Other Receivables) |
| **`120001`** | Inventory Account | Current Assets | Debit | `50,000,000.00` | Current Assets (Inventories) |
| **`200001`** | Trade Creditors | Current Liabilities | Credit | `184,141,022.18` | Current Liabilities (Trade & Other Payables) |
| **`PL-NET`** | Net Profit for Period | P&L Transferred | Credit | `6,424,977.26` | Equity (Retained Earnings & Current Surplus) |

---

## 3. Sectional Aggregation

### Section A: Total Assets
* **Cash & Cash Equivalents:**
  * Account `100003 - Bank Account`: $\text{LKR } 40,565,999.44$
* **Trade Receivables:**
  * Account `110001 - Trade Debtors`: $\text{LKR } 100,000,000.00$
* **Inventories:**
  * Account `120001 - Inventory Account`: $\text{LKR } 50,000,000.00$

$$\text{Total Current Assets} = 40,565,999.44 + 100,000,000.00 + 50,000,000.00 = \mathbf{190,565,999.44}$$
$$\text{Total Non-Current Assets} = \mathbf{0.00}$$
$$\mathbf{\text{Total Assets}} = \mathbf{LKR\ 190,565,999.44}$$

---

### Section B: Total Liabilities
* **Trade & Other Payables:**
  * Account `200001 - Trade Creditors`: $\text{LKR } 184,141,022.18$

$$\text{Total Current Liabilities} = \mathbf{184,141,022.18}$$
$$\text{Total Non-Current Liabilities} = \mathbf{0.00}$$
$$\mathbf{\text{Total Liabilities}} = \mathbf{LKR\ 184,141,022.18}$$

---

### Section C: Total Equity
* **Net Surplus / Retained Earnings for FY 2026/2027:**
  * Accumulated Net Profit from Statement of Profit & Loss: $\text{LKR } 6,424,977.26$

$$\mathbf{\text{Total Equity}} = \mathbf{LKR\ 6,424,977.26}$$

---

## 4. Equilibrium Mathematical Proof

$$\mathbf{\text{Total Liabilities + Equity}} = \text{Total Liabilities} + \text{Total Equity}$$
$$= 184,141,022.18 + 6,424,977.26$$
$$= \mathbf{190,565,999.44}$$

$$\mathbf{\text{Equilibrium Difference}} = \text{Total Assets} - (\text{Total Liabilities} + \text{Total Equity})$$
$$= 190,565,999.44 - 190,565,999.44$$
$$= \mathbf{0.00}$$

$$\mathbf{IsBalanced} = (|\text{Difference}| < 0.01) \equiv \mathbf{TRUE}$$

---

## 5. Liquidity & Solvency Ratios Proof

| Financial Metric | Mathematical Formula | Computation | Audited Value | Health Status |
| :--- | :--- | :--- | :--- | :--- |
| **Net Working Capital** | $\text{Current Assets} - \text{Current Liabilities}$ | $190,565,999.44 - 184,141,022.18$ | **`+LKR 6,424,977.26`** | Positive Surplus |
| **Current Ratio** | $\frac{\text{Current Assets}}{\text{Current Liabilities}}$ | $\frac{190,565,999.44}{184,141,022.18}$ | **`1.03`** | Solvent ($> 1.0$) |
| **Quick Ratio (Acid-Test)** | $\frac{\text{Current Assets} - \text{Inventories}}{\text{Current Liabilities}}$ | $\frac{140,565,999.44}{184,141,022.18}$ | **`0.76`** | Moderate Liquid |
| **Debt to Equity** | $\frac{\text{Total Liabilities}}{\text{Total Equity}}$ | $\frac{184,141,022.18}{6,424,977.26}$ | **`28.66`** | Highly Leveraged |

---

## 6. Audit Conclusion & Sign-Off

The financial statements for FY 2026/2027 stand in mathematical equilibrium.
The asset balance of **`LKR 190,565,999.44`** is verified against the general ledger, and liabilities and equity equal **`LKR 190,565,999.44`** with zero discrepancy.
