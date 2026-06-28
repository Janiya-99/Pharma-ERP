import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { toast } from "sonner";

interface ReportExportActionsProps {
  data: any;
  filename: string;
  disabled?: boolean;
}

export const ReportExportActions: React.FC<ReportExportActionsProps> = ({ 
  data, 
  filename,
  disabled = false
}) => {
  
  const handlePrint = () => {
    window.print();
  };

  const handleJsonExport = () => {
    try {
      if (!data) {
        toast.error("No data available to export");
        return;
      }
      
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.href = href;
      link.download = `${filename}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      
      toast.success("JSON exported successfully");
    } catch (error) {
      console.error("Export error", error);
      toast.error("Failed to export data");
    }
  };

  return (
    <div className="flex items-center space-x-2 print:hidden">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handlePrint}
        disabled={disabled}
      >
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleJsonExport}
        disabled={disabled}
      >
        <Download className="h-4 w-4 mr-2" />
        Download JSON
      </Button>
    </div>
  );
};
