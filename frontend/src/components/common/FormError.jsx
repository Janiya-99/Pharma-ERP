import React from "react";
import { AlertCircle } from "lucide-react";

const FormError = ({ message }) => {
  if (!message) return null;

  return (
    <div className="rounded-md bg-red-50 p-4 mb-4 border border-red-200">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{message}</h3>
        </div>
      </div>
    </div>
  );
};

export default FormError;
