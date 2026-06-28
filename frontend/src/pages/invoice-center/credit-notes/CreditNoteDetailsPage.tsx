import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { useAuth } from "../../../auth/AuthContext";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { Skeleton } from "../../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { toast } from "sonner";
import type { CreditNote } from "../../../types/invoice-center";
import { 
  CreditNoteApprovalStatusBadge, 
  CreditNotePostedStatusBadge,
  CreditNoteTypeBadge,
  CreditNoteActionButtons,
  CreditNoteTotalsCard,
  CreditNoteCustomerBalanceCard,
  CreditNoteInvoiceLinkCard
} from "../../../components/invoice-center";
import {
  SubmitCreditNoteModal,
  ApproveCreditNoteModal,
  RejectCreditNoteModal,
  PostCreditNoteConfirmModal,
  CancelCreditNoteModal,
  DeleteCreditNoteConfirmModal
} from "./modals";

const CreditNoteDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeSoftware } = useAuth();
  const navigate = useNavigate();
  const [creditNote, setCreditNote] = useState<CreditNote | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const fetchCreditNote = async () => {
    if (!id || activeSoftware?.software_code !== "INVOICE_CENTER") return;
    setLoading(true);
    try {
      const res = await invoiceCenterApi.getCreditNoteById(id);
      setCreditNote(res.data.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch credit note.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditNote();
  }, [id, activeSoftware]);

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="p-8 text-center text-gray-500">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  if (loading) {
    return <div className="p-8"><Skeleton className="h-96 w-full" /></div>;
  }

  if (!creditNote) {
    return <div className="p-8 text-center text-gray-500">Credit Note not found.</div>;
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/invoice-center/credit-notes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Credit Note: {creditNote.credit_note_number}
            </h1>
          </div>
        </div>
        <CreditNoteActionButtons
          approvalStatus={creditNote.approval_status}
          postedStatus={creditNote.posted_status}
          onEdit={() => navigate(`/invoice-center/credit-notes/${creditNote.id}/edit`)}
          onDelete={() => setIsDeleteOpen(true)}
          onSubmit={() => setIsSubmitOpen(true)}
          onApprove={() => setIsApproveOpen(true)}
          onReject={() => setIsRejectOpen(true)}
          onPost={() => setIsPostOpen(true)}
          onCancel={() => setIsCancelOpen(true)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Credit Note Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Date</div>
                  <div className="font-medium">{new Date(creditNote.credit_note_date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Type</div>
                  <div className="font-medium"><CreditNoteTypeBadge type={creditNote.credit_note_type} /></div>
                </div>
                <div>
                  <div className="text-gray-500">Branch</div>
                  <div className="font-medium">{creditNote.branch?.branch_name || "-"}</div>
                </div>
                <div>
                  <div className="text-gray-500">Reference Number</div>
                  <div className="font-medium">{creditNote.reference_number || "-"}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-gray-500">Reason</div>
                  <div className="font-medium">{creditNote.reason || "-"}</div>
                </div>
                <div className="col-span-3">
                  <div className="text-gray-500">Remarks</div>
                  <div className="font-medium">{creditNote.remarks || "-"}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Tax</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creditNote.lines && creditNote.lines.length > 0 ? (
                      creditNote.lines.map((line, index) => (
                        <TableRow key={line.id || index}>
                          <TableCell className="text-center text-gray-500 text-sm">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            {line.product_name || `Product #${line.product_id}`}
                          </TableCell>
                          <TableCell className="text-right">{line.quantity}</TableCell>
                          <TableCell className="text-right">{formatMoney(line.unit_price)}</TableCell>
                          <TableCell className="text-right">{formatMoney(line.discount_amount)}</TableCell>
                          <TableCell className="text-right">{formatMoney(line.tax_amount)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatMoney(line.line_total)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">{line.description || "-"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                          No line items found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end mt-4">
            <div className="w-full md:w-1/2 lg:w-1/3">
              <CreditNoteTotalsCard
                subtotal={creditNote.subtotal_amount}
                discount={creditNote.discount_amount}
                tax={creditNote.tax_amount}
                total={creditNote.total_amount}
                lineCount={creditNote.lines?.length || 0}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Approval</span>
                <CreditNoteApprovalStatusBadge status={creditNote.approval_status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Posting</span>
                <CreditNotePostedStatusBadge status={creditNote.posted_status} />
              </div>
            </CardContent>
          </Card>

          <CreditNoteCustomerBalanceCard
            customer={creditNote.customer || null}
            creditNoteTotal={creditNote.total_amount}
          />

          <CreditNoteInvoiceLinkCard
            salesInvoice={creditNote.sales_invoice || null}
            creditNoteTotal={creditNote.total_amount}
          />
        </div>
      </div>

      {creditNote.approvals && creditNote.approvals.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Approval History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {creditNote.approvals.map((approval) => (
                <div key={approval.id} className="text-sm flex flex-col md:flex-row justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <span className="font-semibold capitalize">{approval.action}</span>
                    {approval.remarks && <span className="text-gray-500 ml-2">- {approval.remarks}</span>}
                  </div>
                  <div className="text-gray-400 mt-1 md:mt-0 text-xs">
                    {new Date(approval.action_at).toLocaleString()} by User {approval.action_by}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Modals */}
      <SubmitCreditNoteModal 
        isOpen={isSubmitOpen} 
        onClose={() => setIsSubmitOpen(false)} 
        onConfirm={async (remarks) => {
          await invoiceCenterApi.submitCreditNote(creditNote.id, { remarks });
          toast.success("Credit note submitted successfully.");
          fetchCreditNote();
        }} 
      />
      <ApproveCreditNoteModal 
        isOpen={isApproveOpen} 
        onClose={() => setIsApproveOpen(false)} 
        onConfirm={async (remarks) => {
          await invoiceCenterApi.approveCreditNote(creditNote.id, { remarks });
          toast.success("Credit note approved successfully.");
          fetchCreditNote();
        }} 
      />
      <RejectCreditNoteModal 
        isOpen={isRejectOpen} 
        onClose={() => setIsRejectOpen(false)} 
        onConfirm={async (remarks) => {
          await invoiceCenterApi.rejectCreditNote(creditNote.id, { remarks });
          toast.success("Credit note rejected successfully.");
          fetchCreditNote();
        }} 
      />
      <PostCreditNoteConfirmModal 
        isOpen={isPostOpen} 
        onClose={() => setIsPostOpen(false)} 
        onConfirm={async () => {
          await invoiceCenterApi.postCreditNote(creditNote.id);
          toast.success("Credit note posted successfully.");
          fetchCreditNote();
        }} 
      />
      <CancelCreditNoteModal 
        isOpen={isCancelOpen} 
        onClose={() => setIsCancelOpen(false)} 
        onConfirm={async (remarks) => {
          await invoiceCenterApi.cancelCreditNote(creditNote.id, { remarks });
          toast.success("Credit note cancelled successfully.");
          fetchCreditNote();
        }} 
      />
      <DeleteCreditNoteConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={async () => {
          await invoiceCenterApi.deleteCreditNote(creditNote.id);
          toast.success("Credit note deleted successfully.");
          navigate("/invoice-center/credit-notes");
        }} 
      />
    </div>
  );
};

export default CreditNoteDetailsPage;
