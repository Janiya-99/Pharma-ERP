import React, { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { useAuth } from "../../../auth/AuthContext";
import PermissionGuard from "../../../auth/PermissionGuard";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { toast } from "sonner";
import type { CreditNote, PaginatedResponse } from "../../../types/invoice-center";
import { 
  CreditNoteApprovalStatusBadge, 
  CreditNotePostedStatusBadge,
  CreditNoteTypeBadge 
} from "../../../components/invoice-center";

const CreditNotesPage: React.FC = () => {
  const { activeSoftware } = useAuth();
  const navigate = useNavigate();
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [approvalStatus, setApprovalStatus] = useState<string>("all");
  const [postedStatus, setPostedStatus] = useState<string>("all");
  const [creditNoteType, setCreditNoteType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCreditNotes = async () => {
    if (activeSoftware?.software_code !== "INVOICE_CENTER") return;
    
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (approvalStatus && approvalStatus !== "all") params.approval_status = approvalStatus;
      if (postedStatus && postedStatus !== "all") params.posted_status = postedStatus;
      if (creditNoteType && creditNoteType !== "all") params.credit_note_type = creditNoteType;
      
      const res = await invoiceCenterApi.getCreditNotes(params);
      const payload = res.data as PaginatedResponse<CreditNote>;
      setCreditNotes(payload.data || []);
      setTotalPages(payload.pagination?.total_pages || 1);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch credit notes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditNotes();
  }, [activeSoftware, search, approvalStatus, postedStatus, creditNoteType, page]);

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="p-8 text-center text-gray-500">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Credit Notes</h1>
          <p className="text-sm text-gray-500">Manage all your customer credit notes.</p>
        </div>
        <PermissionGuard permission="invoice_center.credit_note.create">
          <Button onClick={() => navigate("/invoice-center/credit-notes/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Credit Note
          </Button>
        </PermissionGuard>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search credit notes..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Select value={approvalStatus} onValueChange={setApprovalStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Approval Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Approvals</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={postedStatus} onValueChange={setPostedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Posted Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Postings</SelectItem>
                <SelectItem value="unposted">Unposted</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={creditNoteType} onValueChange={setCreditNoteType}>
              <SelectTrigger>
                <SelectValue placeholder="Credit Note Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sales_return">Sales Return</SelectItem>
                <SelectItem value="price_adjustment">Price Adjustment</SelectItem>
                <SelectItem value="discount_adjustment">Discount Adjustment</SelectItem>
                <SelectItem value="billing_error">Billing Error</SelectItem>
                <SelectItem value="goodwill">Goodwill</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CN No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 float-right" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 float-right" /></TableCell>
                  </TableRow>
                ))
              ) : creditNotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-gray-500">
                    No credit notes found.
                  </TableCell>
                </TableRow>
              ) : (
                creditNotes.map((cn) => (
                  <TableRow key={cn.id}>
                    <TableCell className="font-medium">{cn.credit_note_number}</TableCell>
                    <TableCell>{formatDate(cn.credit_note_date)}</TableCell>
                    <TableCell>{cn.customer?.customer_name || `Customer #${cn.customer_id}`}</TableCell>
                    <TableCell>
                      <CreditNoteTypeBadge type={cn.credit_note_type} />
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatMoney(cn.total_amount)}</TableCell>
                    <TableCell>
                      <CreditNoteApprovalStatusBadge status={cn.approval_status} />
                    </TableCell>
                    <TableCell>
                      <CreditNotePostedStatusBadge status={cn.posted_status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/invoice-center/credit-notes/${cn.id}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CreditNotesPage;
