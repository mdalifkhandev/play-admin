import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { cn } from "../components/ui/utils";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-white">{title}</h1>
        {subtitle && <p className="text-[#A0A0A0] mt-1 text-sm">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  change,
  positive = true,
  isLoading = false,
}: {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div className="rounded-xl bg-[#1A1A1A] border border-white/5 p-5">
      <p className="text-[#A0A0A0] text-sm">{label}</p>
      <div className="mt-2 flex items-end justify-between">
        {isLoading ? (
          <div className="h-9 w-24 animate-pulse rounded-md bg-white/10" />
        ) : (
          <span className="text-3xl font-semibold text-white tracking-tight">{value}</span>
        )}
        {isLoading ? (
          <div className="h-5 w-14 animate-pulse rounded-full bg-white/10" />
        ) : change && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-sm",
              positive ? "text-[#84CC16]" : "text-red-400",
            )}
          >
            {positive ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

export function SectionLoading({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 py-10 text-[#A0A0A0]", className)}>
      <div className="size-4 animate-spin rounded-full border-2 border-[#84CC16] border-t-transparent" />
      {label}
    </div>
  );
}

export function TableLoadingRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr className="border-white/5 hover:bg-transparent">
      <td colSpan={colSpan} className="py-8 text-center text-[#A0A0A0]">
        <SectionLoading label={label} className="py-0" />
      </td>
    </tr>
  );
}

export function Panel({
  title,
  children,
  className,
  action,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-xl bg-[#1A1A1A] border border-white/5 p-5", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-white">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  Active: "bg-[#84CC16]/15 text-[#84CC16] border-[#84CC16]/30",
  Completed: "bg-[#84CC16]/15 text-[#84CC16] border-[#84CC16]/30",
  Paid: "bg-[#84CC16]/15 text-[#84CC16] border-[#84CC16]/30",
  Banned: "bg-red-500/15 text-red-400 border-red-500/30",
  Rejected: "bg-red-500/15 text-red-400 border-red-500/30",
  Expired: "bg-red-500/15 text-red-400 border-red-500/30",
  Suspended: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Warned: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Held: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Paused: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Processing: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Canceled: "bg-white/10 text-[#A0A0A0] border-white/15",
  Ended: "bg-white/10 text-[#A0A0A0] border-white/15",
  Sent: "bg-[#84CC16]/15 text-[#84CC16] border-[#84CC16]/30",
  "Force ended": "bg-red-500/15 text-red-400 border-red-500/30",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("rounded-full px-2.5 py-0.5", statusStyles[status] ?? "bg-white/10 text-[#A0A0A0] border-white/15")}>
      {status}
    </Badge>
  );
}

export function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-[#A0A0A0]">
      <span>
        Page {page} of {total}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 bg-transparent hover:bg-white/5"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </Button>
        {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="sm"
            className={p === page ? "bg-[#84CC16] text-black hover:bg-[#84CC16]/90" : "border-white/10 bg-transparent hover:bg-white/5"}
            onClick={() => onChange(p)}
          >
            {p}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 bg-transparent hover:bg-white/5"
          disabled={page >= total}
          onClick={() => onChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export function ApproveButton(props: React.ComponentProps<typeof Button>) {
  return <Button {...props} className={cn("bg-[#84CC16] text-black hover:bg-[#84CC16]/90", props.className)} size="sm" />;
}

export function RejectButton(props: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      variant="outline"
      size="sm"
      className={cn("border-red-500/40 text-red-400 hover:bg-red-500/10 bg-transparent", props.className)}
    />
  );
}
