import React, { useState, useEffect } from "react";
import { financeApi } from "../../api/financeApi";
import { Check, ChevronsUpDown } from "lucide-react";

const FixedAssetSelect = ({
  value,
  onChange,
  error,
  disabled,
  className = "",
  statusFilter = "active",
}: {
  value?: unknown;
  onChange?: unknown;
  error?: unknown;
  disabled?: unknown;
  className?: unknown;
  statusFilter?: unknown;
}) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAssets();
  }, [statusFilter]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = { limit: 200 };
      if (statusFilter) {
        params.asset_status = statusFilter;
      }
      const res = await financeApi.getFixedAssets(params);
      setAssets(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load fixed assets", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedAsset = assets.find((a: unknown) => a.id === value);
  const filteredAssets = assets.filter(
    (a: unknown) =>
      a.asset_name.toLowerCase().includes(search.toLowerCase()) ||
      a.asset_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative ${className}`}>
      <div
        className={`flex w-full cursor-pointer items-center justify-between rounded-xl border bg-white p-2.5 dark:bg-navy-800 ${
          error ? "border-red-500" : "border-gray-200 dark:border-navy-600"
        } ${
          disabled
            ? "cursor-not-allowed bg-gray-50 opacity-50"
            : "hover:border-brand-500"
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span
          className={`truncate text-sm ${
            !selectedAsset ? "text-gray-400" : "text-gray-800 dark:text-white"
          }`}
        >
          {selectedAsset
            ? `${selectedAsset.asset_code} - ${
                selectedAsset.asset_name
              } (NBV: ${Number(
                selectedAsset.net_book_value || 0
              ).toLocaleString()})`
            : "Select Fixed Asset..."}
        </span>
        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg dark:border-navy-600 dark:bg-navy-800">
          <div className="border-b border-gray-100 p-2 dark:border-navy-700">
            <input
              type="text"
              placeholder="Search asset..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              onClick={(e: any) => e.stopPropagation()}
            />
          </div>
          <div className="scrollbar-thin max-h-60 overflow-y-auto p-1">
            {loading ? (
              <div className="p-3 text-center text-sm text-gray-500">
                Loading...
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="p-3 text-center text-sm text-gray-500">
                No assets found.
              </div>
            ) : (
              filteredAssets.map((asset: unknown) => (
                <div
                  key={asset.id}
                  className={`flex cursor-pointer flex-col rounded-lg p-2 text-sm hover:bg-gray-50 dark:hover:bg-navy-700 ${
                    value === asset.id ? "bg-brand-50 dark:bg-navy-700" : ""
                  }`}
                  onClick={() => {
                    onChange(asset.id, asset);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  <div className="flex w-full items-center justify-between">
                    <span
                      className={`font-medium ${
                        value === asset.id
                          ? "text-brand-600"
                          : "text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {asset.asset_code} - {asset.asset_name}
                    </span>
                    {value === asset.id && (
                      <Check className="h-4 w-4 text-brand-600" />
                    )}
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>
                      NBV: LKR{" "}
                      {Number(asset.net_book_value || 0).toLocaleString()}
                    </span>
                    <span>Status: {asset.asset_status?.replace("_", " ")}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {error && (
        <span className="mt-1 block text-xs text-red-500">{error}</span>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default FixedAssetSelect;
