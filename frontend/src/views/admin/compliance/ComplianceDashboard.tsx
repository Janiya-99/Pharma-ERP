import React from "react";
import Widget from "components/widget/Widget";
import { MdOutlineVerifiedUser, MdWarning, MdDeleteForever } from "react-icons/md";

export default function ComplianceDashboard() {
  return (
    <div className="flex flex-col gap-5 py-5">
      <div className="flex flex-col mb-4">
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Compliance Dashboard</h1>
        <p className="text-sm text-gray-400">Realtime overview of regulations, recalls, and holds</p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3">
        <Widget
          icon={<MdOutlineVerifiedUser className="h-6 w-6 text-brand-500 dark:text-white" />}
          title="Active Licenses"
          subtitle="0"
        />
        <Widget
          icon={<MdWarning className="h-6 w-6 text-red-500 dark:text-red-400" />}
          title="Active Holds"
          subtitle="0"
        />
        <Widget
          icon={<MdDeleteForever className="h-6 w-6 text-orange-500 dark:text-orange-400" />}
          title="Pending Disposals"
          subtitle="0"
        />
      </div>
    </div>
  );
}
