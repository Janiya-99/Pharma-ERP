import React, { useState } from "react";
import { useAuth } from "../../../auth/AuthContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { AlertTriangle, Clock, History } from "lucide-react";
import PendingFinancePostingsPage from "./PendingFinancePostingsPage";
import FinancePostingHistoryPage from "./FinancePostingHistoryPage";

const InvoiceCenterFinancePostingPage = () => {
  const { activeSoftware } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="flex h-64 items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please switch to Invoice Center module to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handlePostingComplete = () => {
    // Increment the key to trigger a refresh in the history tab
    setHistoryRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finance Posting</h1>
        <p className="mt-1 text-sm text-gray-500">
          Post operationally completed documents to the Finance General Ledger.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Pending Postings
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1.5">
            <History className="h-3.5 w-3.5" />
            Posting History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Pending Finance Postings
              </CardTitle>
              <CardDescription className="text-xs">
                Documents that are operationally posted but not yet posted to
                Finance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PendingFinancePostingsPage
                onPostingComplete={handlePostingComplete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Finance Posting History
              </CardTitle>
              <CardDescription className="text-xs">
                Documents that have been posted to the Finance General Ledger.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FinancePostingHistoryPage refreshKey={historyRefreshKey} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceCenterFinancePostingPage;
