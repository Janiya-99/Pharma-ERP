import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type FormPageProps = {
  children: ReactNode;
};

type FormHeaderProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  backAction?: ReactNode;
  actions?: ReactNode;
};

type FormSectionProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

type FormBodyProps = {
  children: ReactNode;
  aside?: ReactNode;
};

export const InvoiceCenterFormPage = ({ children }: FormPageProps) => (
  <div className="page-content mx-auto w-full max-w-7xl space-y-5 pb-12">
    {children}
  </div>
);

export const InvoiceCenterFormHeader = ({
  title,
  description,
  icon,
  backAction,
  actions,
}: FormHeaderProps) => (
  <div className="sticky top-14 z-30 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
    <div className="flex min-w-0 items-center gap-3">
      {backAction}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {icon}
          <h1 className="truncate text-2xl font-semibold tracking-tight text-[#111827]">
            {title}
          </h1>
        </div>
        {description && (
          <p className="mt-1 text-sm text-[#64748B]">{description}</p>
        )}
      </div>
    </div>
    {actions && (
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    )}
  </div>
);

export const InvoiceCenterFormBody = ({ children, aside }: FormBodyProps) => (
  <div
    className={
      aside
        ? "grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_330px]"
        : "space-y-5"
    }
  >
    <div className="space-y-5">{children}</div>
    {aside && (
      <aside className="space-y-5 xl:sticky xl:top-36 xl:self-start">
        {aside}
      </aside>
    )}
  </div>
);

export const InvoiceCenterFormSection = ({
  title,
  description,
  icon,
  actions,
  children,
}: FormSectionProps) => (
  <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
    <CardHeader className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#111827]">
          {icon}
          {title}
        </CardTitle>
        {description && (
          <p className="mt-1 text-sm leading-6 text-[#64748B]">{description}</p>
        )}
      </div>
      {actions}
    </CardHeader>
    <CardContent className="pt-5">{children}</CardContent>
  </Card>
);

export const InvoiceCenterFieldGrid = ({ children }: FormPageProps) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    {children}
  </div>
);
