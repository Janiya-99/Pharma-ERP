import React, { useState, useEffect, useRef } from "react";
import { MoreVertical } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

const ActionMenu = ({ actions, item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { hasPermission } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const visibleActions = actions.filter(
    (action) => !action.permission || hasPermission(action.permission)
  );

  if (visibleActions.length === 0) return null;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {visibleActions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsOpen(false);
                  action.onClick(item);
                }}
                className={`flex w-full items-center px-4 py-2 text-sm text-left ${
                  action.danger ? "text-red-700 hover:bg-red-50 hover:text-red-900" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                role="menuitem"
              >
                {action.icon && <action.icon className="mr-3 h-4 w-4" aria-hidden="true" />}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
