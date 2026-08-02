import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-[13px]"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-300" />
            )}
            {isLast || !item.href ? (
              <span
                className={
                  isLast ? "font-semibold text-gray-800" : "text-gray-400"
                }
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="text-gray-400 transition-colors duration-150 hover:text-indigo-600"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
