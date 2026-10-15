# ERP Comprehensive Test Case Register

All cases start as **NOT_RUN**. The agent must execute them against the real staging system and attach UI, API and read-only database evidence; do not mark PASS based on an expected result alone. Priority is a recommended risk classification. Cases that refer to optional features are **NOT_IMPLEMENTED** when the capability is absent and not required, or **BLOCKED** when testing is impossible.

**QA ID prefix:** ENV environment, CC Control Center, TAX taxes, INV Inventory/procurement, BILL Invoice Center, FIN Finance, COMP Compliance Center, SEC security/reliability/data integrity.

## ENV — 12 test cases

| ID | Priority | Scenario | Action | Expected result |
|---|---|---|---|---|
| ENV-001 | P0 | Confirm nonproduction test environment | Inspect environment variables and resolved API/DB destinations before writes | Only approved test/staging hosts and isolated test database are targeted |
| ENV-002 | P0 | Backup and rollback readiness | Record snapshot time and trial rollback plan | Snapshot exists and rollback instructions are verified |
| ENV-003 | P1 | Frontend-Go integration baseline | Open dashboard and observe API/network requests | Real Go API is called and no mock-only responses misrepresented |
| ENV-004 | P1 | Database connectivity and migrations | Inspect schema migration state in test DB | Expected migrations applied and Go connection healthy |
| ENV-005 | P1 | Service health check | Start Vite and Go services and request health endpoints | Services start without fatal errors and return healthy response |
| ENV-006 | P1 | Capture baseline errors | Record console, Go server errors, failed requests before tests | Preexisting failures enumerated with timestamps |
| ENV-007 | P1 | Identify tenant architecture | Inspect company scoping in auth middleware/repository layer | Tenant enforcement strategy mapped to actual implementation |
| ENV-008 | P1 | Identify posting trigger boundaries | Trace GRN, invoice, receipt and journal posting handlers | Stock/GL timing and idempotency rules documented |
| ENV-009 | P1 | Identity and permissions inventory | Enumerate roles, permission codes, endpoints and guards | UI and Go authorization responsibilities recorded |
| ENV-010 | P2 | Compare project to finance plan | Inspect existing finance migration/models and supplied plan if present | Schema matches or differences reported without unapproved change |
| ENV-011 | P2 | Test automation prerequisites | Check browser automation, Go tests, DB read-only account | Tool availability and blockers logged |
| ENV-012 | P2 | Capture versions and run IDs | Collect commit hashes and dependency versions | Unique repeatable run manifest created |

## CC — 32 test cases

| ID | Priority | Scenario | Action | Expected result |
|---|---|---|---|---|
| CC-001 | P0 | Create company through platform admin UI | Sign in as authorized platform admin and submit QA company form | Exactly one new tenant created with valid response |
| CC-002 | P0 | Company DB persistence | Query test DB for new company primary key and properties after refresh | One persisted row with correct fields and creator |
| CC-003 | P0 | Tenant settings auto-provision | Check initial settings tied to new company | Required defaults exist once and belong to new tenant |
| CC-004 | P0 | Create initial company administrator | Invite/create test admin and inspect user and membership tables | Identity, tenant membership and admin role persist correctly |
| CC-005 | P0 | New company admin login | Log out platform admin and authenticate invited company admin | User sees only new company and allowed modules |
| CC-006 | P0 | Company provisioning atomicity | Simulate controlled user-provisioning failure in staging | No half-provisioned company/user with inconsistent links |
| CC-007 | P0 | Duplicate tenant registration race | Submit same registration concurrently from two sessions | Uniqueness enforced transactionally and no duplicate tenants |
| CC-008 | P0 | Company user cannot access platform admin | Open/admin API with company admin token | HTTP forbidden and no platform controls exposed |
| CC-009 | P1 | Validate mandatory company fields | Submit empty name/required legal info | Field validation prevents invalid persistence |
| CC-010 | P1 | Reject invalid company identifier | Submit invalid-format legal registration reference | Clear validation or appropriately documented acceptance |
| CC-011 | P1 | Company retry after network timeout | Submit, interrupt response, retry same command | At most one company via idempotency or clear duplicate rejection |
| CC-012 | P1 | Company branch creation and persistence | Add QA_CMB branch and reload / query DB | Correct company-scoped branch row and UI |
| CC-013 | P1 | Second branch creation | Add QA_KDY branch and switch branch context | Branch selections and scoped content consistent |
| CC-014 | P1 | Branch duplicate code constraint | Attempt duplicate QA_CMB branch code within tenant | Duplicate rejected safely; no duplicate row |
| CC-015 | P1 | User invitation activation single-use | Activate invitation and attempt reuse | First succeeds, reuse is rejected |
| CC-016 | P1 | Password storage check | Inspect stored user credential representation | Password salted/hashed; no plaintext visible |
| CC-017 | P1 | Role assignment and persistence | Create Purchase Officer role and assign to user | Pivot membership, role and audit all persist |
| CC-018 | P1 | Permission action enforcement | Attempt journal post as warehouse-only user via API | Operation denied; no journal posted |
| CC-019 | P1 | Branch scoped user | Assign QA_CMB only and request QA_KDY data | Branch data inaccessible unless permitted |
| CC-020 | P1 | Warehouse scoped user | Restrict storekeeper to QA_MAIN and access QA_SECONDARY | Warehouse operation denied backend-side |
| CC-021 | P1 | Maker-checker self approval | Create PO as Purchase Officer and attempt same-user approval | Same-user approval rejected if configured |
| CC-022 | P1 | Deactivate user mid-session | Disable logged-in user then call API | Subsequent access blocked per session revocation policy |
| CC-023 | P1 | Change user designation and department | Edit and reload metadata | Normalized FK or equivalent links remain correct |
| CC-024 | P1 | Company settings updates audit | Change timezone/locale and inspect audit | Field change actor/before-after/time recorded |
| CC-025 | P1 | Document numbering uniqueness | Issue sequential draft/posted documents from concurrent sessions | No duplicate final numbers within scoped series |
| CC-026 | P2 | User search filter pagination | Search 100+ users and navigate pages | Correct tenant-scoped result and pagination |
| CC-027 | P2 | Company preference persistence | Change currency display/date format and reload | Settings persist, historical records unchanged |
| CC-028 | P2 | Audit filtering and export | Filter logs by actor/date/action and export sanitized file | Results match audit rows, no other tenant events |
| CC-029 | P2 | Approval threshold configuration | Set threshold and create below/above-threshold documents | Expected approver steps applied and logged |
| CC-030 | P2 | Expired invitation | Attempt activate expired invitation | Activation blocked without privileged bypass |
| CC-031 | P2 | Company deactivate/reactivate | Toggle tenant status in staging with authorized admin | Access blocked/re-enabled according to explicit policy |
| CC-032 | P2 | Two company users distinct permissions | Compare admin and billing user API/UI privileges | Least privilege honored consistently |

## TAX — 33 test cases

| ID | Priority | Scenario | Action | Expected result |
|---|---|---|---|---|
| TAX-001 | P0 | VAT-exempt pharmaceutical classification | Classify approved hypothetical exempt medicine and invoice 1000 LKR | VAT 0, exemption code/reason stored, correct invoice type |
| TAX-002 | P0 | Standard VAT calculation | Invoice hypothetical taxable non-pharma item net 1000 LKR at 18 percent | VAT 180.00 and gross 1180.00 LKR |
| TAX-003 | P0 | Do not apply VAT to all pharmacy goods | Create exempt medicine and taxable other product | Tax follows product and supply classification, not industry blanket rule |
| TAX-004 | P0 | Reject VAT-tax invoice for unregistered entity | Configure non-VAT-registered company then attempt VAT tax invoice | Cannot unlawfully charge VAT / label document as VAT tax invoice |
| TAX-005 | P0 | October 2026 tax invoice format | Generate taxable VAT tax invoice dated on/after 2026-10-01 | Document complies with gazette-required fields and serial pattern |
| TAX-006 | P0 | Tax invoice document separation | Prepare taxable plus exempt product transaction | Legally valid ordinary/tax document treatment per invoice format |
| TAX-007 | P0 | Tax ledger to GL integrity | Post taxable invoice and inspect output tax journal | Exact tax amount and account mapping; no duplicate posting |
| TAX-008 | P1 | VAT tax inclusive pricing | Enter 1180 LKR tax-inclusive at 18 percent | Net 1000, VAT 180, gross 1180, no double VAT |
| TAX-009 | P1 | Discount before VAT | Three items at 250 less 10 percent at 18 percent | Net 675, VAT 121.50, gross 796.50 |
| TAX-010 | P1 | Line rounding edge case | Use 0.01-priced multiple quantities and defined rounding policy | Sum of persisted line tax equals journal/report/print after rounding |
| TAX-011 | P1 | Exempt vs zero rated distinction | Invoice two configured 0 percent categories separately | Different statutory statuses and report buckets retained |
| TAX-012 | P1 | Outside-scope classification | Post a test outside-scope item | No false output VAT and correct exclusion in return summary |
| TAX-013 | P1 | VAT effective date history | Create old and future rate with effective dates; date invoices either side | Applicable rate selected by transaction date; old invoices unchanged |
| TAX-014 | P1 | Tax class switch preserves posted invoice | Reclassify product after posted invoice | Historical invoice tax snapshots remain immutable |
| TAX-015 | P1 | Missing tax mapping | Remove GL mapping in isolated negative scenario and attempt posting | Posting blocked atomically with no partial invoice GL |
| TAX-016 | P1 | Tax account vs chart of accounts | Link VAT input/output GL accounts and query journals | Correct debit/credit account mapping by tax transaction |
| TAX-017 | P1 | Supplier input VAT eligibility | Receive taxable eligible purchase and post supplier bill | Input VAT recognized only under configured eligible legal category |
| TAX-018 | P1 | Input VAT exemption purchase | Purchase qualifying exempt product | No invented input VAT recovery |
| TAX-019 | P1 | Tax credit note reversal | Return taxable invoiced item and issue credit note | Output VAT reversed once with exact base and amount |
| TAX-020 | P1 | Debit note taxable adjustment | Issue taxable invoice adjustment | Correct additional tax and GL entry |
| TAX-021 | P1 | VAT customer TIN required fields | Generate taxable B2B tax invoice with buyer tax data | Required purchaser/supplier identifiers present per applicable template |
| TAX-022 | P1 | VAT invoice number format | Generate Oct 2026 VAT tax invoice in branch QA_CMB | Serial pattern YYMMM_QQQQ_XXXXX and unique scoped sequence |
| TAX-023 | P1 | Tax invoice date and supply date | Issue invoice with distinct supply date | Both dates retained and printed correctly |
| TAX-024 | P1 | SSCL exempt pharmaceutical turnover | Include approved exempt pharmaceutical transactions in turnover report | Excluded from liable SSCL turnover, not charged by default |
| TAX-025 | P1 | SSCL 50 percent wholesale base | Configure legally applicable wholesale taxable turnover 200000 LKR | 50 percent liable base and 2.5 percent yields 2500 LKR |
| TAX-026 | P1 | SSCL 25 percent registered distributor base | Configure legally applicable registered-distributor turnover 200000 LKR | 25 percent liable base and 2.5 percent yields 1250 LKR |
| TAX-027 | P1 | SSCL not universal invoice tax | Sell qualifying exempt pharmaceutical product | No blanket 2.5 percent SSCL invoice surcharge |
| TAX-028 | P1 | Tax report reconciliation | Reconcile tax summary to all posted source documents and ledger lines | No missing/duplicated tax and totals tie |
| TAX-029 | P1 | Tax registration state changes | Deactivate VAT registration in new effective period | Future documents change behavior, historical documents preserved |
| TAX-030 | P2 | Tax code approval and change log | Edit effective tax rule as authorized Finance role | History shows prior/new value, actor, approval, effective date |
| TAX-031 | P2 | Tax invoice printable export consistency | Compare tax invoice on screen, print and exported PDF | Same fields, totals, number and tax labels |
| TAX-032 | P2 | Cross branch tax treatment | Create taxable supply in two branches | Same legal rule applied with branch-specific identifiers |
| TAX-033 | P2 | Tax rounding on returns | Partially credit small taxable invoice lines | Net VAT after credits reconciles to rate/rounding policy |

## INV — 42 test cases

| ID | Priority | Scenario | Action | Expected result |
|---|---|---|---|---|
| INV-001 | P0 | Create warehouse under new company | Add QA_MAIN warehouse and link QA_CMB branch | Warehouse persists with correct tenant and branch FK |
| INV-002 | P0 | Create second warehouse and quarantine | Add QA_SECONDARY and restricted quarantine location | Valid sites/locations with correct ownership |
| INV-003 | P0 | Create product master | Create medicine SKU with generic, dosage, strength, units | Normalized product and classification links saved correctly |
| INV-004 | P0 | Batch identity per warehouse | Receive same product into two expiry batches and bins | Batch numbers, expiries, locations distinct and traceable |
| INV-005 | P0 | PO draft does not change stock | Save PO draft for lot A 100 and lot B 60 | No stock movement or inventory GL posting |
| INV-006 | P0 | Approved GRN increases stock exactly once | Receive lot A 100 in approved GRN | One inbound stock event, available/quarantine follows policy |
| INV-007 | P0 | Second batch receipt | Receive lot B 60 exp 2027-06-30 | Distinct lot and current total 160 before issues |
| INV-008 | P0 | Reject expired receipt for sale | Receive or attempt release expired lot | Blocked/quarantined based on policy; not sellable |
| INV-009 | P0 | Prevent negative stock | Attempt issue quantity above available | Posting rejected without negative balance |
| INV-010 | P0 | Blocked batch not allocated | Hold lot B and create new sales order | No reservation/pick from held lot |
| INV-011 | P0 | Recall blocks all relevant stock | Recall lot B and attempt issue from multiple bins | No recalled quantity available to sell |
| INV-012 | P0 | Inventory ledger persistence | Post GRN and query stock movement rows | All inbound moves append-only with source/user/lot/qty |
| INV-013 | P0 | Atomic invoice stock issue | Force controlled posting failure after inventory preparation | No one-sided stock/GL writes after failed transaction |
| INV-014 | P1 | PO create and approve | Create PO with two lines and approve using different user | Approval state and PO detail rows persist |
| INV-015 | P1 | Reject self approval on PO | Approve own PO with maker-checker enabled | Denied and logged |
| INV-016 | P1 | PO partial receipt | Receive 100 of 160 PO units | Pending 60 recorded and PO remains open |
| INV-017 | P1 | PO completion | Receive pending 60 quantity | PO fulfilled and closed according to policy |
| INV-018 | P1 | PO overreceipt tolerance | Try receive qty above outstanding without approval | Blocked or documented approved tolerance workflow |
| INV-019 | P1 | Duplicate GRN submission | Double click Post / replay same API request | One GRN posting and one ledger event per item |
| INV-020 | P1 | GRN mandatory expiry | Post medicine GRN without expiry date | Validation rejection |
| INV-021 | P1 | GRN mandatory batch number | Post batch-tracked medicine without lot number | Validation rejection |
| INV-022 | P1 | UOM quantity conversion | Buy carton and sell unit/strip using configured conversion | Canonical stock quantity correct with no fractional drift |
| INV-023 | P1 | FEFO allocation | Order 25 of available medicine across lots A/B | Lot B selected before later-expiring lot A |
| INV-024 | P1 | FEFO overridden by approved reason | Override nearest expiry with reason if supported | Reason and approver logged; no compliance breach |
| INV-025 | P1 | Reservation reduces available to promise | Reserve 25 from lot B without dispatch | Physical unchanged, ATP reduced by 25 |
| INV-026 | P1 | Cancelled order releases reservation | Cancel unposted reserved order | Reservation released once, balance restored |
| INV-027 | P1 | Stock transfer out/in | Transfer 15 lot A QA_MAIN to QA_SECONDARY | Source -15, destination +15, company net 0 |
| INV-028 | P1 | Transfer receipt confirmation | Start transfer in transit and accept in destination | Correct in-transit balance and final receiving state |
| INV-029 | P1 | Stock count variance adjustment | Count known batch variance and approve adjustment | Document/ledger/costing record exact delta |
| INV-030 | P1 | Damage writeoff | Write off 3 units of lot A with approval | Stock -3, loss GL exact amount, audit present |
| INV-031 | P1 | Stock hold and release history | Hold/release batch as Compliance Officer | Transition and reason preserved in history |
| INV-032 | P1 | Return stock enters quarantine | Process return of 5 issued units | Physical +5, available unchanged until approved release |
| INV-033 | P1 | Concurrent final-unit sale | Two sessions buy same final unit simultaneously | Only one can reserve/post final unit |
| INV-034 | P1 | Purchase return to supplier | Return 4 approved received units to supplier | Stock and AP/credit treatment consistent, no negative stock |
| INV-035 | P1 | Batch trace to supplier GRN | Open batch trace for lot B | Shows supplier, PO, GRN, location and subsequent movements |
| INV-036 | P2 | Near-expiry threshold | Configure 90-day warning and seed near-dated lot | Alert/list respects company threshold and timezone |
| INV-037 | P2 | Low stock reorder threshold | Set reorder limit and issue stock below limit | Low stock alert and reordering data consistent |
| INV-038 | P2 | Warehouse stock query filters | Filter by warehouse/product/lot/status and paginate | No cross-warehouse leakage or duplicate count |
| INV-039 | P2 | Stock valuation after two costs | Receive lots at differing costs and issue from lot B | Cost follows selected documented costing method |
| INV-040 | P2 | Warehouse bin move within site | Move lot A from bin A1 to A2 | Location changes, total quantity unaffected |
| INV-041 | P2 | Quarantine to available release | Approve released held inventory | Status transition and ATP updated once |
| INV-042 | P2 | Disposal removes stock safely | Post approved expired stock disposal | Correct stock decrease with immutable disposal trace |

## BILL — 37 test cases

| ID | Priority | Scenario | Action | Expected result |
|---|---|---|---|---|
| BILL-001 | P0 | Create synthetic customer | Add QA_CASH customer via customer workflow | Customer persists and belongs to new company |
| BILL-002 | P0 | Create credit customer with limit | Add QA_CREDIT credit terms and limit | Credit configuration persisted and historical changes tracked |
| BILL-003 | P0 | Create sales order with available stock | Submit order for 25 units lot-tracked medicine | Line quantities prices and tax classifications correct |
| BILL-004 | P0 | Invoice posting generates correct financial entries | Post approved invoice and inspect GL source | AR/revenue/tax and COGS/stock balanced once per policy |
| BILL-005 | P0 | No duplicate issue on invoice plus dispatch | Complete both dispatch and invoice lifecycle | Stock reduced exactly once at documented event |
| BILL-006 | P0 | Invoice payment fully reconciles | Post receipt equal to open invoice amount | AR balance zero and invoice marked paid |
| BILL-007 | P0 | Posted invoice locked | Attempt edit price/quantity/date of posted invoice | Modification blocked; correction document required |
| BILL-008 | P0 | Cross tenant invoice inaccessible | Access new company invoice ID using other company token | No invoice fields/download exposed |
| BILL-009 | P1 | Sales order draft no stock issue | Save order draft without approval | No stock issue and no GL posting |
| BILL-010 | P1 | Sales order approval transition | Approve as separate authorized Sales Manager | Correct status history and role enforcement |
| BILL-011 | P1 | Credit limit within threshold | Post invoice that keeps AR at or under customer limit | Transaction allowed if other validations pass |
| BILL-012 | P1 | Credit limit exceeded | Submit customer invoice beyond credit limit | Blocked or authorized override with reason/trace |
| BILL-013 | P1 | Reserved quantity released on cancel | Cancel reserved sales order before dispatch | ATP restored once |
| BILL-014 | P1 | FEFO batch choice in invoice | Issue 25 when lot B expires before lot A | Earlier lot B used and printed/stored appropriately |
| BILL-015 | P1 | Sales invoice item tax snapshot | Post taxable item then edit product tax profile | Historic invoice remains unchanged |
| BILL-016 | P1 | Cash sale with receipt | Create cash sale and apply cash receipt | Cash GL increases, customer open AR zero |
| BILL-017 | P1 | Partial credit payment | Apply 40 percent of credit invoice due amount | Invoice PARTIALLY_PAID and exact remaining due |
| BILL-018 | P1 | Complete credit payment | Apply remainder after partial receipt | Invoice PAID, AR zero, no over-allocation |
| BILL-019 | P1 | Receipt across two invoices | Allocate one receipt to two outstanding invoices | Allocation sums equal receipt and both balances correct |
| BILL-020 | P1 | Reject excess allocation | Allocate receipt more than available amount | Rejected or explicit unapplied credit preserved |
| BILL-021 | P1 | Sales return references sold item | Return 5 units from original invoice | Return line links original invoice item and batch |
| BILL-022 | P1 | Return quarantine and credit note | Approve return and issue customer credit | Stock quarantine +5, AR/tax/revenue reversed once |
| BILL-023 | P1 | Return amount exceeds original sale | Attempt return more than invoiced/remaining | Rejected |
| BILL-024 | P1 | Partial return rounding | Return subset of taxable line with discount | Credit base/VAT align to original price/tax snapshots |
| BILL-025 | P1 | Debit note price correction | Create approved debit note for price difference | AR/revenue/output tax posting and history correct |
| BILL-026 | P1 | Refund via bank and credit | Refund eligible customer credit balance | Refund voucher and bank GL reconcile |
| BILL-027 | P1 | Invoice retry on lost response | Submit invoice, lose response, retry | Exactly one invoice and no duplicate stock/GL |
| BILL-028 | P1 | Invoice numbering concurrent requests | Post two invoices same branch simultaneously | Unique valid sequential numbers |
| BILL-029 | P1 | Unpaid invoice aging | Advance test clock or seed due dates appropriately | Aging bucket reflects actual due dates |
| BILL-030 | P1 | Delivery note batch trace | Generate delivery note for lot B shipment | Quantity batch customer and invoice reference correct |
| BILL-031 | P2 | Invoice printable totals match DB | Print/PDF invoice and inspect amounts | All subtotals, tax, discount, grand total and identifiers agree |
| BILL-032 | P2 | Invoice filtering and pagination | Filter invoices by customer/date/status | Accurate status and totals without extra tenants |
| BILL-033 | P2 | Cancel draft invoice | Cancel unposted invoice | No GL/stock impact and cancellation logged |
| BILL-034 | P2 | Posted correction uses credit/debit note | Attempt cancel posted invoice through standard UI | Require valid reversal/credit path per policy |
| BILL-035 | P2 | Customer deactivated sale | Attempt sale to inactive customer | Blocked before posting |
| BILL-036 | P2 | Zero quantity sales line | Try submit invoice quantity zero | Rejected with clear validation |
| BILL-037 | P2 | Different branch invoice numbering | Create invoices in each company branch | Branch-qualified series and report filtering correct |

## FIN — 39 test cases

| ID | Priority | Scenario | Action | Expected result |
|---|---|---|---|---|
| FIN-001 | P0 | Create company chart of accounts | Configure assets liabilities equity revenue COGS expenses | All COA leaf codes persist with correct hierarchy |
| FIN-002 | P0 | Journal balanced validation | Try journal debit 100 credit 90 | Post blocked with nonzero variance |
| FIN-003 | P0 | Balanced journal posting | Post 100 debit to cash and 100 credit to opening equity | Exact two equal journal lines, ledger persisted |
| FIN-004 | P0 | Purchase GRN no double invoice recognition | Post GRN then supplier bill matching same stock | Inventory recognized once, GRNI cleared when appropriate |
| FIN-005 | P0 | Invoice receivable journal reconciliation | Post sale invoice and inspect AR lines | AR equals invoice balance and journal balances |
| FIN-006 | P0 | Inventory COGS journal reconciliation | Issue 25 units from known lot cost | COGS/stock debit and credit equal costing value |
| FIN-007 | P0 | Receipt bank to AR posting | Apply valid receipt | Cash/bank debit and AR credit match exactly |
| FIN-008 | P0 | Return/credit GL reversals | Post credit against original invoice | Balanced proper reversals, no duplicate entries |
| FIN-009 | P0 | No phantom posted GL entries | Save draft PO GRN invoice journal | No posted journal/GL/stock side effects before configured post event |
| FIN-010 | P0 | Journal immutable after posting | Attempt SQL/API/UI edit of posted journal via authorized app actions | Edit forbidden; posted reversal created as new entry |
| FIN-011 | P0 | No unbalanced posted journal in DB | Query all company posted journal grouping lines | Every posted journal sum debit minus credit = 0 |
| FIN-012 | P1 | Company fiscal year setup | Create year with expected start/end and periods | Period rows unique and scoped correctly |
| FIN-013 | P1 | Prevent overlapping fiscal periods | Attempt create overlapping fiscal period | Validation prevents ambiguous posting period |
| FIN-014 | P1 | Create multiple branches COA mapping | Map company accounts to branch postings | Correct branch dimension in financial lines |
| FIN-015 | P1 | Supplier bill AP recognition | Create supplier bill from GRN and inspect payable | AP increases by eligible billed amount exactly once |
| FIN-016 | P1 | Supplier partial payment | Pay part of supplier bill | AP outstanding decreases by allocated amount |
| FIN-017 | P1 | Supplier final settlement | Apply balance supplier payment | AP zero, bank decreases, paid status correct |
| FIN-018 | P1 | Supplier payment advance | Make advance and apply to later bill if supported | Advance reclassified to payable only once |
| FIN-019 | P1 | Customer aging matches invoice balances | Reconcile customer aging to invoices minus allocations | Aging grand total equals outstanding AR |
| FIN-020 | P1 | Supplier aging matches bill balances | Reconcile AP aging to bills minus payments | Aging grand total equals outstanding AP |
| FIN-021 | P1 | Trial balance equals zero net | Run trial balance after all postings | Total debits equal credits, no absent accounts |
| FIN-022 | P1 | Profit and loss reconciliation | Compare sales COGS expense journal lines with P&L | P&L totals reconcile to GL |
| FIN-023 | P1 | Balance sheet reconciliation | Compare assets liabilities and equity at date | Balance sheet accounting identity holds |
| FIN-024 | P1 | Bank transfer accounting | Transfer fixed amount from account 1 to account 2 | Two-sided cash/bank entries no net gain |
| FIN-025 | P1 | Bank reconciliation matching | Upload synthetic statement and match GL bank lines | Matched totals/cutoff agree, unmatched retained |
| FIN-026 | P1 | Bank statement duplicates | Import same statement row twice | Duplicate recognized, not double applied |
| FIN-027 | P1 | Accounting tax GL mapping | Post taxable invoice and eligible supplier purchase | Input/output tax balances correct; exemptions excluded |
| FIN-028 | P1 | Financial period locking | Close period and try journal backdating | Posting rejected unless approved reopening |
| FIN-029 | P1 | Inactive account posting rejection | Deactivate expense GL and attempt posting to it | Blocked without journal creation |
| FIN-030 | P1 | Missing mapping atomicity | Remove stock COGS mapping in isolated fixture, attempt posting | Whole operation rejected with no inconsistent ledger |
| FIN-031 | P1 | Journal reversal references original | Reverse posted journal with permission and reason | New balanced reversal journal linked; original unchanged |
| FIN-032 | P1 | Maker-checker approval on journal | Creator submits journal then attempts self approval | Self-approval denied when maker-checker policy enabled |
| FIN-033 | P2 | Chart of accounts hierarchy 3NF | Inspect leaves and account category chains | No redundant contradictory parent classifications |
| FIN-034 | P2 | Bank cashbook filters | Filter bank ledger by date/branch/account | Running balance matches source posted entries |
| FIN-035 | P2 | Payment methods cash card cheque transfer | Post representative settlement per supported method | Correct GL and transaction details |
| FIN-036 | P2 | Petty cash expense and reimbursement | Create authorized petty cash expense and replenish if supported | Ledger balanced, no double expense |
| FIN-037 | P2 | Fixed asset depreciation | Create eligible test asset and run period depreciation if supported | Scheduled depreciation journal and NBV correct |
| FIN-038 | P2 | Report export repeatability | Export trial balance twice same filters | Same totals and period metadata |
| FIN-039 | P2 | Multi period tax return schedule | Run tax report across valid two periods | Transactions assigned by correct applicable dates |

## COMP — 23 test cases

| ID | Priority | Scenario | Action | Expected result |
|---|---|---|---|---|
| COMP-001 | P0 | Batch recall trace sold lots | Recall lot B after selling 25 units | Trace links exact batch to invoice/customer/delivery and quantities |
| COMP-002 | P0 | Recall batch blocked from issuing | Attempt create pick from recalled lot B | Blocked by Go backend and UI |
| COMP-003 | P0 | Hold action permission | Try batch hold as unprivileged billing user | Forbidden and audit logged |
| COMP-004 | P0 | Release after recall controls | Try release recalled lot without compliant clearance | Denied pending configured compliance approval |
| COMP-005 | P1 | Product regulatory record creation | Register fake test registration metadata | Record saved with expiry and company-scoped document link |
| COMP-006 | P1 | Supplier license expiry control | Mark synthetic supplier document expired and attempt affected operation | Defined configured hold/alert behavior enforced |
| COMP-007 | P1 | Customer license expiry control | Set pharmacy customer's license expired | Sale restriction/approval follows configurable compliance policy |
| COMP-008 | P1 | Batch quarantine workflow | Put specific lot/quantity on hold and inspect inventory | Sellable ATP excludes quarantined quantity |
| COMP-009 | P1 | Batch release with approval | Have Compliance Officer approve release | Stock becomes available and approval history written |
| COMP-010 | P1 | Recall quantities reconcile | Reconcile recalled initial sold held returned disposed and unresolved | Recall report quantities reconcile to source records |
| COMP-011 | P1 | Recall notification report | Generate recall list of impacted customers | Only customers who got affected batch included |
| COMP-012 | P1 | Complaint case against batch | Log complaint linked to product lot invoice | Investigation and source references persist |
| COMP-013 | P1 | Expiry disposal approval | Dispose expired lot from quarantine with authorized approval | Inventory decreased, GL expense and audit reference recorded |
| COMP-014 | P1 | Disposal double submit | Retry same disposal approval | Only one stock writeoff and financial posting |
| COMP-015 | P1 | Disposal evidence mandatory | Attempt disposal without mandatory reason or evidence | Validation blocks completion |
| COMP-016 | P1 | Attached compliance document controls | Upload safe file and attempt disallowed type | Only allowed content stored; retrieval access scoped |
| COMP-017 | P1 | Historical regulatory change audit | Edit non-posted license details | Old/new status values and actor retained |
| COMP-018 | P1 | Pharmacovigilance record scope | Create adverse event metadata without patient identifiers | Sensitive data protections applied per configured requirements |
| COMP-019 | P2 | License expiry warnings | Configure alert threshold and check expiring documents | Alerts fire at threshold and are company-scoped |
| COMP-020 | P2 | Recall closeout requirements | Try close recall with outstanding unresolved quantity | Policy requires review/justification and records final disposition |
| COMP-021 | P2 | Batch identity after reclassification | Change product master after historic sale | Recall linkage to original batch and invoice preserved |
| COMP-022 | P2 | Multi warehouse recall coverage | Place same lot in two warehouses and recall | Both sites blocked and accounted for |
| COMP-023 | P2 | Regulatory report export | Export recall and disposal reports | Contents reflect DB records and no unauthorized customers |

## SEC — 43 test cases

| ID | Priority | Scenario | Action | Expected result |
|---|---|---|---|---|
| SEC-001 | P0 | Cross tenant company details | Use company B token to retrieve A settings by known identifier | No company A details disclosed |
| SEC-002 | P0 | Cross tenant users and roles | Use company B to read/edit company A user/role endpoints | Forbidden without observable mutation |
| SEC-003 | P0 | Cross tenant products and batches | Query company A SKU/lot under company B credentials | No data leaked via API, filters, exports |
| SEC-004 | P0 | Cross tenant invoices and receipts | Request A invoice PDF/receipt using company B token | Cannot access content or file |
| SEC-005 | P0 | Cross tenant GL and reports | Query A GL report with company B token | No A lines/aggregates returned |
| SEC-006 | P0 | Cross tenant audit trail | Query platform/company A audit with company B context | No other tenant audit rows |
| SEC-007 | P0 | Privilege escalation by crafted API payload | Try set company_id/approved_by/role fields on create/update | Backend ignores/rejects unauthorized fields |
| SEC-008 | P0 | Unprivileged direct API posting | Issue signed POST to finance post endpoint as billing-only user | 403 and no DB side effects |
| SEC-009 | P0 | Sensitive token and password exposure | Inspect frontend bundle network Go logs DB audit storage | No auth secrets or plaintext password leakage |
| SEC-010 | P0 | Delete posted ledger record | Attempt delete posted journal/stock movement via public APIs | Hard delete disallowed; history preserved |
| SEC-011 | P1 | Cross branch read permission | Access QA_KDY records with QA_CMB only user | No unauthorized data |
| SEC-012 | P1 | Permission change session refresh | Revoke user permission while session active then retry | New unauthorized action denied per policy |
| SEC-013 | P1 | Account disable session handling | Disable user and reuse token | Token/session rejected according to policy |
| SEC-014 | P1 | Login invalid credential | Attempt wrong password on test user | Generic safe error, no login and no sensitive disclosure |
| SEC-015 | P1 | Login rate limits | Burst wrong-password attempts within safe threshold | Rate limiting/lockout behavior observed and logged |
| SEC-016 | P1 | Password reset token single use | Use activation/reset link twice | Second attempt fails |
| SEC-017 | P1 | SQL injection probe | Send harmless SQL meta characters in search/filter | No SQL errors, data leak or query manipulation |
| SEC-018 | P1 | Stored XSS probe | Save inert test payload in remarks and reopen | Output safely encoded, no script execution |
| SEC-019 | P1 | Attachment path traversal probe | Request safe test path escape in file endpoint | Unauthorized file path inaccessible |
| SEC-020 | P1 | Concurrent invoice posting | Send two identical invoice post requests | One financial and stock posting |
| SEC-021 | P1 | Concurrent stock reserve race | Two users reserve same final unit | No oversell or negative available stock |
| SEC-022 | P1 | GRN retry after timeout | Timeout client after write then repeat same command | Exactly one receipt stock event |
| SEC-023 | P1 | Accounting partial failure rollback | Inject controlled error in posting chain in staging | No half posted journal/stock or outbox inconsistency |
| SEC-024 | P1 | Audit actor integrity | Perform edits/post/reversal with separate test users | Correct actor and company recorded for each event |
| SEC-025 | P1 | Audit old and new values | Edit product price or customer credit limit | Before/after and change reason visible, no secret fields |
| SEC-026 | P1 | Status history sequence | Draft submit approve post reverse document | Statuses chronological, actor and timestamp complete |
| SEC-027 | P1 | FK orphan scan | Query all important details with left joins to headers | No orphan details or invalid company refs |
| SEC-028 | P1 | Duplicate source GL posting scan | Group journal source reference and idempotency key | No accidental duplicate transaction postings |
| SEC-029 | P1 | Duplicate invoice numbers scan | Group by scoped final invoice numbering dimensions | No duplicates |
| SEC-030 | P1 | Company scope FK consistency | Join invoice customer batch journal company identifiers | All participating records belong to same authorized tenant |
| SEC-031 | P1 | Financial integrity after rollback | Force failure and reconcile stock/GL before/after | No partial changes |
| SEC-032 | P1 | Historical snapshot immutability | Change product name tax rate customer address after sale | Posted documents retain original legally required values |
| SEC-033 | P2 | Safe pagination limits | Request very large page size and negative offset | Capped validated pagination |
| SEC-034 | P2 | Large product list performance | Seed 1000 products safely and measure common list/query | Stable response and UI; measured timings recorded |
| SEC-035 | P2 | Large stock ledger performance | Generate/test 10000 ledger rows safely | Pagination and indexes avoid timeouts |
| SEC-036 | P2 | Responsive ERP rendering | Navigate five modules at desktop tablet mobile widths | No blocked essential action, no unreadable tables |
| SEC-037 | P2 | Keyboard and accessibility | Navigate forms modal dialogs tables by keyboard | Labels focus order and errors accessible |
| SEC-038 | P2 | Timezone and clock boundary | Post near Asia/Colombo midnight in controlled test | Correct local dates and UTC timestamps |
| SEC-039 | P2 | Currency precision and floating point | Submit decimal price/discount/tax edge cases | No floating point drift beyond explicit rounding rule |
| SEC-040 | P2 | Print and export injection protection | Use harmless spreadsheet-formula-like test text | Safe escaping in CSV/Excel and output |
| SEC-041 | P2 | Error and retry UX | Simulate 429 500 and offline network | Clear error with no false success or duplicates |
| SEC-042 | P2 | Audit retention and edit access | Attempt edit/delete audit as normal company admin | Immutable or appropriately protected |
| SEC-043 | P2 | Cross module reference normalization | Inspect product/customer/supplier entity keys and FK relationships | No independent duplicate master records per module |

