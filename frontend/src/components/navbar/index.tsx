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
  const user = useAuthStore((s: unknown) => s.user);
  const logout = useAuthStore((s: unknown) => s.logout);

  const handleLogout = () => {
    logout();
    navigate("/auth/sign-in", { replace: true });
  };

  return (
    <nav className="sticky top-0 z-40 flex flex-row flex-wrap items-center justify-between border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-navy-700 dark:bg-navy-800/80 md:px-6">
      <div>
        <div className="mb-0.5 flex items-center gap-1.5 text-[12px] text-gray-400">
          <span>Pages</span>
          <span>/</span>
          <span className="font-medium text-navy-700 dark:text-white">
            {brandText}
          </span>
        </div>
        <h1 className="text-lg font-bold capitalize text-navy-700 dark:text-white">
          {brandText.split(" / ").pop()}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden h-10 min-w-[200px] items-center gap-2 rounded-xl bg-gray-50 px-3 dark:bg-navy-700 md:flex">
          <FiSearch className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent text-sm text-navy-700 outline-none placeholder:text-gray-400 dark:text-white"
          />
        </div>

        {/* Mobile menu toggle */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-50 dark:hover:bg-navy-700"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5" />
        </button>

        {/* Branch Selector */}
        <Dropdown
          button={
            <button className="flex h-10 items-center gap-2 rounded-xl bg-gray-50 px-3 text-sm font-semibold text-navy-700 transition-colors hover:bg-gray-100 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600">
              <span className="hidden sm:block">
                {user?.branch || "Head Office"}
              </span>
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          }
          children={
            <div className="flex w-48 flex-col rounded-xl border border-gray-100 bg-white p-2 shadow-xl dark:border-navy-600 dark:!bg-navy-700">
              <p className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Select Branch
              </p>
              <button className="w-full rounded-lg bg-brand-50 px-2 py-2 text-left text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20">
                {user?.branch || "Head Office"}
              </button>
              <button className="w-full rounded-lg px-2 py-2 text-left text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-navy-600">
                Colombo Branch
              </button>
              <button className="w-full rounded-lg px-2 py-2 text-left text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-navy-600">
                Kandy Branch
              </button>
            </div>
          }
          classNames={"py-2 top-12 -left-[100px] w-max"}
        />

        {/* Notifications */}
        <Dropdown
          button={
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-50 dark:hover:bg-navy-700">
              <IoMdNotificationsOutline className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500" />
            </button>
          }
          animation="origin-top-right transition-all duration-200 ease-out"
          children={
            <div className="flex w-[320px] flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-xl dark:border-navy-600 dark:!bg-navy-700">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-navy-700 dark:text-white">
                  Notifications
                </p>
                <button className="text-[11px] font-semibold text-brand-500 hover:underline">
                  Mark all read
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-navy-600">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-600">
                    GR
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-navy-700 dark:text-white">
                      GRN-2024-0128 posted
                    </p>
                    <p className="text-[11px] text-gray-400">5 min ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-navy-600">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-[11px] font-bold text-amber-600">
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
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-50 dark:hover:bg-navy-700"
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
            <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-navy-700">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600">
                {user?.name?.charAt(0) || "U"}
              </div>
            </button>
          }
          children={
            <div className="flex w-56 flex-col rounded-xl border border-gray-100 bg-white p-3 shadow-xl dark:border-navy-600 dark:!bg-navy-700">
              <div className="px-2 py-2">
                <p className="text-sm font-bold text-navy-700 dark:text-white">
                  {user?.name || "User"}
                </p>
                <p className="text-[11px] text-gray-400">
                  {user?.role} — {user?.branch}
                </p>
              </div>
              <div className="my-1 h-px bg-gray-100 dark:bg-navy-600" />
              <button
                onClick={() => navigate("/admin/home")}
                className="w-full rounded-lg px-2 py-2 text-left text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-navy-600"
              >
                Module Hub
              </button>
              <button className="w-full rounded-lg px-2 py-2 text-left text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-navy-600">
                Profile Settings
              </button>
              <div className="my-1 h-px bg-gray-100 dark:bg-navy-600" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
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
