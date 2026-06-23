import React from "react";
import { Loader2 } from "lucide-react";

const LoadingScreen = ({ text = "Loading..." }: { text?: unknown }) => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
      <Loader2 className="h-10 w-10 animate-spin text-blue-900 mb-4" />
      <h2 className="text-xl font-semibold text-gray-700">{text}</h2>
    </div>
  );
};

export default LoadingScreen;
