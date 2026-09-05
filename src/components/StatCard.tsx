import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "green" | "amber" | "blue";

const accentClasses: Record<Accent, string> = {
  green: "border-l-primary bg-primary/8 text-primary",
  amber: "border-l-secondary bg-secondary/10 text-secondary",
  blue: "border-l-status-progress bg-status-progress/8 text-status-progress",
};

export function StatCard({
  icon: Icon,
  value,
  label,
  note,
  accent = "green",
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  note?: string;
  accent?: Accent;
}) {
  return (
    <article className={cn("stat-card", `border-l-${accent}`)}>
      <div className={cn("grid size-9 place-items-center rounded-full", accentClasses[accent])}>
        <Icon size={18} strokeWidth={1.75} />
      </div>
      <p className="mt-5 font-display text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{label}</p>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
    </article>
  );
}