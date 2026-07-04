import React, { useState, useEffect } from "react";
import { getUserAccessPreview } from "@/api/controlApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X } from "lucide-react";

interface EffectiveAccessPreviewProps {
  userId?: string | number;
  previewData?: any; // Allow passing static preview if not saved yet
}

export const EffectiveAccessPreview: React.FC<EffectiveAccessPreviewProps> = ({
  userId, previewData
}) => {
  const [access, setAccess] = useState<any>(previewData || null);
  const [loading, setLoading] = useState(!!userId && !previewData);

  useEffect(() => {
    if (userId && !previewData) {
      fetchAccessPreview();
    } else if (previewData) {
      setAccess(previewData);
    }
  }, [userId, previewData]);

  const fetchAccessPreview = async () => {
    try {
      setLoading(true);
      const res = await getUserAccessPreview(userId!);
      setAccess(res.data || res);
    } catch (err) {
      console.error("Failed to fetch access preview", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Skeleton className="h-40 w-full rounded-xl" />;

  if (!access) return (
    <div className="text-center p-6 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 text-sm">
      Save the user or select roles to preview effective access.
    </div>
  );

  const permissions = access.effective_permissions || [];

  if (permissions.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 text-sm">
        No permissions found. Ensure roles are assigned.
      </div>
    );
  }

  // Group by module/resource
  const grouped = permissions.reduce((acc: any, perm: any) => {
    const r = perm.resource || "General";
    if (!acc[r]) acc[r] = [];
    acc[r].push(perm);
    return acc;
  }, {});

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
      {Object.keys(grouped).sort().map(resource => (
        <div key={resource} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 font-semibold text-[#052659] text-sm">
            {resource}
          </div>
          <div className="divide-y divide-gray-100">
            {grouped[resource].map((perm: any, idx: number) => (
              <div key={idx} className="px-4 py-2 flex justify-between items-center hover:bg-gray-50">
                <span className="text-sm text-gray-700">{perm.action}</span>
                {perm.granted ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
