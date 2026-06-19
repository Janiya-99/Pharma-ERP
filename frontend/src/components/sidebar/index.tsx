/* eslint-disable */
import React from "react";
import { HiX } from "react-icons/hi";
import Links from "./components/Links";
import routes from "routes";
import { MdLocalPharmacy } from "react-icons/md";

const Sidebar = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: React.MouseEventHandler<HTMLSpanElement>;
}) => {
  return (
    <div
      className={`sm:none duration-175 linear fixed !z-50 flex min-h-full w-[260px] flex-col bg-white pb-10 shadow-xl shadow-gray-200/50 transition-all dark:!bg-navy-800 dark:text-white md:!z-50 lg:!z-50 xl:!z-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Close button (mobile) */}
      <span
        className="absolute top-4 right-4 block cursor-pointer text-gray-400 hover:text-gray-600 xl:hidden"
        onClick={onClose}
      >
        <HiX size={20} />
      </span>

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 pt-8 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 shadow-md shadow-brand-500/30">
          <MdLocalPharmacy className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-navy-700 dark:text-white leading-tight">PharmaDist</p>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">ERP System</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6 mb-4 h-px bg-gray-100 dark:bg-white/10" />

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <Links routes={routes} />
      </div>

      {/* Bottom User Info */}
      <div className="mx-4 mt-4 rounded-xl bg-gray-50 dark:bg-navy-700 p-3">
        <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-1">Signed in as</p>
        <p className="text-sm font-bold text-navy-700 dark:text-white">Kamali Fernando</p>
        <p className="text-[11px] text-gray-400">System Admin — Head Office</p>
      </div>
    </div>
  );
};

export default Sidebar;
