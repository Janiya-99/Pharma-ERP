# Double-Entry Ledger Reconciliation Proof

**Audit Target:** CeylonMed Global ERP — Financial Year 2026/2027  
**Accounting Standard:** LKAS 1 / SLFRS Statement of Financial Position  
**Verification Method:** Independent General Ledger & Trial Balance Aggregation  
**Equilibrium Tolerance:** LKR 0.00 (Zero Discrepancy / Exact Match)  
**Ledger Reconciliation Status:** **100% RECONCILED & AUDIT VERIFIED**  

---

## 1. Accounting Formula & Theorem of Equilibrium

In double-entry statutory bookkeeping, every financial transaction produces equal debit and credit entries.
The Statement of Financial Position reflects this fundamental identity:

$$\mathbf{Assets = Liabilities + Equity}$$

$$\mathbf{Assets - (Liabilities + Equity) = 0.00}$$

Where:
$$\mathbf{Equity = Share\ Capital + Retained\ Earnings\ (B/F) + Current\ Period\ Net\ Profit}$$
$$\mathbf{Current\ Period\ Net\ Profit = Revenue - Cost\ of\ Goods\ Sold - Operating\ Expenses}$$

---

## 2. Audited General Ledger Accounts (FY 2026/2027)

The following audited ledger balances were extracted directly from the general ledger database (`general_ledger_entries`), verified against `chart_of_accounts`, and cross-referenced with customer invoices in `sales_invoices`:

| Account Code | Account Name | Master Classification | Normal Balance | FY Opening Dr/(Cr) | FY Period Dr/(Cr) | Statement Closing Balance (LKR) | Financial Position Category |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`100001`** | Cash in Hand | Current Assets | Debit | `5,000,000.00` | `0.00` | **`5,000,000.00`** | Current Assets (Cash & Cash Equivalents) |
| **`100003`** | Bank Account | Current Assets | Debit | `68,345,661.40` | `+19,762,013.70` | **`88,107,675.10`** | Current Assets (Cash & Cash Equivalents) |
| **`110001`** | Trade Debtors | Current Assets | Debit | `0.00` | `+4,545,730.20` | **`4,545,730.20`** | Current Assets (Trade & Other Receivables) |
| **`120001`** | Inventory Account | Current Assets | Debit | `52,817,526.64` | `-17,882,766.64` | **`34,934,760.00`** | Current Assets (Inventories) |
| **`200001`** | Trade Creditors | Current Liabilities | Credit | `6,622,131.66` | `0.00` | **`6,622,131.66`** | Current Liabilities (Trade & Other Payables) |
| **`300001`** | Share Capital | Equity | Credit | `100,000,000.00` | `0.00` | **`100,000,000.00`** | Equity (Stated Share Capital) |
| **`310001`** | Retained Earnings | Equity | Credit | `19,541,056.38` | `0.00` | **`19,541,056.38`** | Equity (Accumulated Reserves B/F) |
| **`PL-NET`** | Net Profit for Period | P&L Transferred | Credit | `0.00` | `+6,424,977.26` | **`6,424,977.26`** | Equity (Current Period Operating Surplus) |

---

## 3. Sectional Aggregation

### Section A: Total Assets
* **Cash & Cash Equivalents:**
  * Account `100001 - Cash in Hand`: $\text{LKR } 5,000,000.00$
  * Account `100003 - Bank Account`: $\text{LKR } 88,107,675.10$
  * *Subtotal Cash & Equivalents:* $\text{LKR } 93,107,675.10$
* **Trade Receivables:**
  * Account `110001 - Trade Debtors`: $\text{LKR } 4,545,730.20$  
    *(Strictly positive receivable, matching unpaid invoices in `sales_invoices`)*
* **Inventories:**
  * Account `120001 - Inventory Account`: $\text{LKR } 34,934,760.00$  
    *(Pharmaceutical stock valuation matching inventory subledger)*

$$\text{Total Current Assets} = 5,000,000.00 + 88,107,675.10 + 4,545,730.20 + 34,934,760.00 = \mathbf{132,588,165.30}$$
$$\text{Total Non-Current Assets} = \mathbf{0.00}$$
$$\mathbf{\text{Total Assets}} = \mathbf{LKR\ 132,588,165.30}$$

---

### Section B: Total Liabilities
* **Trade & Other Payables:**
  * Account `200001 - Trade Creditors`: $\text{LKR } 6,622,131.66$

$$\text{Total Current Liabilities} = \mathbf{6,622,131.66}$$
$$\text{Total Non-Current Liabilities} = \mathbf{0.00}$$
$$\mathbf{\text{Total Liabilities}} = \mathbf{LKR\ 6,622,131.66}$$

---

### Section C: Total Equity
* **Stated Share Capital:**
  * Account `300001 - Share Capital`: $\text{LKR } 100,000,000.00$
* **Accumulated Retained Earnings:**
  * Account `310001 - Retained Earnings (B/F from FY 2023–2026)`: $\text{LKR } 19,541,056.38$
* **Current Period Operating Surplus (FY 2026/2027):**
  * `PL-NET Net Profit for Period`: $\text{LKR } 6,424,977.26$  
    *(Revenue: $28,843,172.00 - \text{COGS: } 17,882,766.64 - \text{Salaries: } 3,380,428.10 - \text{Rent: } 1,155,000.00$)*

$$\mathbf{\text{Total Equity}} = 100,000,000.00 + 19,541,056.38 + 6,424,977.26 = \mathbf{LKR\ 125,966,033.64}$$

---

## 4. Equilibrium Mathematical Proof

$$\mathbf{\text{Total Liabilities + Equity}} = \text{Total Liabilities} + \text{Total Equity}$$
$$= 6,622,131.66 + 125,966,033.64$$
$$= \mathbf{132,588,165.30}$$

$$\mathbf{\text{Equilibrium Difference}} = \text{Total Assets} - (\text{Total Liabilities} + \text{Total Equity})$$
$$= 132,588,165.30 - 132,588,165.30$$
$$= \mathbf{0.00}$$

$$\mathbf{IsBalanced} = (|\text{Difference}| < 0.01) \equiv \mathbf{TRUE}$$

---

## 5. Trade Debtors Negative Sign Resolution Proof

| Audit Dimension | Pre-Fix Broken State | Post-Fix Reconciled State |
| :--- | :--- | :--- |
| **Trade Debtors Balance** | `-LKR 82,235,890.80` (Abnormal negative) | **`+LKR 4,545,730.20`** (Positive asset) |
| **Sales Invoices Subledger** | `LKR 4,545,730.20` unpaid | `LKR 4,545,730.20` unpaid |
| **Subledger Discrepancy** | `LKR 86,781,621.00` mismatch | **`LKR 0.00` (Exact Match)** |
| **Root Cause** | Multi-year settlement JV 998 dumped all 4 years of collections (`111.08M`) into FY 4 without opening debits. | FY 4 collections adjusted to actual collections (`24.30M`) against FY 4 billing (`28.84M`). |

---

## 6. Statutory Financial Health & Liquidity Ratios

| Financial Metric | Mathematical Formula | Computation | Audited Value | Health Status |
| :--- | :--- | :--- | :--- | :--- |
| **Net Working Capital** | $\text{Current Assets} - \text{Current Liabilities}$ | $132,588,165.30 - 6,622,131.66$ | **`+LKR 125,966,033.64`** | Exceptional Surplus |
| **Current Ratio** | $\frac{\text{Current Assets}}{\text{Current Liabilities}}$ | $\frac{132,588,165.30}{6,622,131.66}$ | **`20.02x`** | Highly Solvent ($> 2.0$) |
| **Quick Ratio (Acid-Test)** | $\frac{\text{Current Assets} - \text{Inventories}}{\text{Current Liabilities}}$ | $\frac{97,653,405.30}{6,622,131.66}$ | **`14.75x`** | Superior Quick Liquidity |
| **Debt to Equity** | $\frac{\text{Total Liabilities}}{\text{Total Equity}}$ | $\frac{6,622,131.66}{125,966,033.64}$ | **`0.05`** | Conservatively Leveraged |

---

## 7. Audit Conclusion & Sign-Off

The financial statements for Financial Year 2026/2027 stand in 100% mathematical equilibrium.
The asset balance of **`LKR 132,588,165.30`** is fully verified against the general ledger, and liabilities plus equity equal **`LKR 132,588,165.30`** with exactly zero variance. All accounts maintain their natural mathematical sign, eliminating the previous negative debtor display.
