import React from "react";
import { Hammer } from "lucide-react";
import EmptyState from "../../components/common/EmptyState";

const PlaceholderPage = ({ title }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
      <EmptyState
        title="Under Construction"
        description="This screen will be built in the next steps."
        icon={Hammer}
      />
    </div>
  );
};

export default PlaceholderPage;
