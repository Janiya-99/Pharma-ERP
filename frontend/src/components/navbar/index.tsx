import React from "react";
import Dropdown from "components/dropdown";
import { FiAlignJustify, FiSearch } from "react-icons/fi";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { IoMdNotificationsOutline } from "react-icons/io";
import { MdLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "store/authStore";

const Navbar = (props: {
  onOpenSidenav: () => void;
  brandText: string;
  secondary?: boolean | string;
}) => {
  const { onOpenSidenav, brandText } = props;
  const [darkmode, setDarkmode] = React.useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate("/auth/sign-in", { replace: true });
  };

  return (
    <nav className="sticky top-0 z-40 flex flex-row flex-wrap items-center justify-between bg-white/80 backdrop-blur-xl px-4 md:px-6 py-3 border-b border-gray-100 dark:bg-navy-800/80 dark:border-navy-700">
      <div>
        <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-0.5">
          <span>Pages</span>
          <span>/</span>
          <span className="text-navy-700 dark:text-white font-medium">{brandText}</span>
        </div>
        <h1 className="text-lg font-bold text-navy-700 dark:text-white capitalize">
          {brandText.split(" / ").pop()}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex h-10 items-center rounded-xl bg-gray-50 dark:bg-navy-700 px-3 gap-2 min-w-[200px]">
          <FiSearch className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-navy-700 dark:text-white outline-none placeholder:text-gray-400 w-full"
          />
        </div>

        {/* Mobile menu toggle */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5" />
        </button>

        {/* Branch Selector */}
        <Dropdown
          button={
            <button className="flex items-center gap-2 h-10 px-3 rounded-xl bg-gray-50 dark:bg-navy-700 text-sm font-semibold text-navy-700 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-600 transition-colors">
              <span className="hidden sm:block">{user?.branch || "Head Office"}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          }
          children={
            <div className="flex w-48 flex-col rounded-xl bg-white p-2 shadow-xl border border-gray-100 dark:!bg-navy-700 dark:border-navy-600">
              <p className="px-2 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Select Branch</p>
              <button className="w-full text-left px-2 py-2 rounded-lg text-sm text-brand-600 bg-brand-50 hover:bg-brand-100 dark:text-brand-400 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 transition-colors font-semibold">
                {user?.branch || "Head Office"}
              </button>
              <button className="w-full text-left px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-navy-600 transition-colors">
                Colombo Branch
              </button>
              <button className="w-full text-left px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-navy-600 transition-colors">
                Kandy Branch
              </button>
            </div>
          }
          classNames={"py-2 top-12 -left-[100px] w-max"}
        />

        {/* Notifications */}
        <Dropdown
          button={
            <button className="relative h-10 w-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors">
              <IoMdNotificationsOutline className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-500" />
            </button>
          }
          animation="origin-top-right transition-all duration-200 ease-out"
          children={
            <div className="flex w-[320px] flex-col rounded-xl bg-white p-4 shadow-xl border border-gray-100 dark:!bg-navy-700 dark:border-navy-600">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-navy-700 dark:text-white">Notifications</p>
                <button className="text-[11px] font-semibold text-brand-500 hover:underline">
                  Mark all read
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-3 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-navy-600 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center shrink-0 text-brand-600 text-[11px] font-bold">
                    GR
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-navy-700 dark:text-white">
                      GRN-2024-0128 posted
                    </p>
                    <p className="text-[11px] text-gray-400">5 min ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-navy-600 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0 text-amber-600 text-[11px] font-bold">
                    AP
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-navy-700 dark:text-white">
                      3 approvals pending
                    </p>
                    <p className="text-[11px] text-gray-400">12 min ago</p>
                  </div>
                </div>
              </div>
            </div>
          }
          classNames={"py-2 top-12 -left-[260px] w-max"}
        />

        {/* Dark Mode Toggle */}
        <button
          className="h-10 w-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors"
          onClick={() => {
            if (darkmode) {
              document.body.classList.remove("dark");
              setDarkmode(false);
            } else {
              document.body.classList.add("dark");
              setDarkmode(true);
            }
          }}
        >
          {darkmode ? (
            <RiSunFill className="h-4 w-4" />
          ) : (
            <RiMoonFill className="h-4 w-4" />
          )}
        </button>

        {/* User Profile + Dropdown */}
        <Dropdown
          button={
            <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors">
              <div className="h-9 w-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-sm">
                {user?.name?.charAt(0) || "U"}
              </div>
            </button>
          }
          children={
            <div className="flex w-56 flex-col rounded-xl bg-white p-3 shadow-xl border border-gray-100 dark:!bg-navy-700 dark:border-navy-600">
              <div className="px-2 py-2">
                <p className="text-sm font-bold text-navy-700 dark:text-white">
                  {user?.name || "User"}
                </p>
                <p className="text-[11px] text-gray-400">
                  {user?.role} — {user?.branch}
                </p>
              </div>
              <div className="h-px bg-gray-100 dark:bg-navy-600 my-1" />
              <button
                onClick={() => navigate("/admin/home")}
                className="w-full text-left px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-navy-600 transition-colors"
              >
                Module Hub
              </button>
              <button className="w-full text-left px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-navy-600 transition-colors">
                Profile Settings
              </button>
              <div className="h-px bg-gray-100 dark:bg-navy-600 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <MdLogout className="h-4 w-4" />
                Log Out
              </button>
            </div>
          }
          classNames={"py-2 top-12 -left-[190px] w-max"}
        />
      </div>
    </nav>
  );
};

export default Navbar;
