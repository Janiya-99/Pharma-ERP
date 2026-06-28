import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

interface Action {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  permission?: string;
  danger?: boolean;
  onClick: (item: unknown) => void;
}

const ActionMenu = ({
  actions,
  item,
}: {
  actions?: Action[];
  item?: unknown;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { hasPermission } = useAuth();

  const visibleActions = (actions || []).filter(
    (action) => !action.permission || hasPermission(action.permission)
  );

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 192; // w-48
    const menuHeight = visibleActions.length * 40 + 16;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceRight = window.innerWidth - rect.right;

    let top = rect.bottom + 4;
    let left = rect.right - menuWidth;

    if (spaceBelow < menuHeight && rect.top > menuHeight) {
      top = rect.top - menuHeight - 4;
    }
    if (spaceRight < menuWidth) {
      left = rect.left - menuWidth + rect.width;
    }
    if (left < 8) left = 8;

    setMenuPos({ top, left });
  }, [visibleActions.length]);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    updatePosition();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => setIsOpen(false);
    document.addEventListener("mousedown", handleClose);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClose);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  if (visibleActions.length === 0) return null;

  const menu = isOpen ? (
    <div
      ref={menuRef}
      style={{ top: menuPos.top, left: menuPos.left }}
      className="fixed z-[9999] w-48 rounded-xl bg-white py-1.5 shadow-xl ring-1 ring-gray-200 duration-100 animate-in fade-in-0 zoom-in-95"
      onClick={(e) => e.stopPropagation()}
    >
      {visibleActions.map((action, index) => (
        <button
          key={index}
          onClick={() => {
            setIsOpen(false);
            action.onClick(item);
          }}
          className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-sm font-medium transition-colors ${
            action.danger
              ? "text-red-600 hover:bg-red-50 hover:text-red-700"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          {action.icon && (
            <action.icon
              className={`h-3.5 w-3.5 shrink-0 ${
                action.danger ? "text-red-500" : "text-gray-400"
              }`}
            />
          )}
          {action.label}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div className="relative inline-flex items-center justify-center">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150 ${
          isOpen
            ? "bg-gray-100 text-gray-700"
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        }`}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {typeof document !== "undefined" && createPortal(menu, document.body)}
    </div>
  );
};

export default ActionMenu;
