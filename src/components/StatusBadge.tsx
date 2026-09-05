import { normalizeStatus, type QueueStatus } from "@/lib/api";

const LABELS: Record<QueueStatus, string> = {
  WAITING: "Waiting",
  CALLED: "Called",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const VARS: Record<QueueStatus, string> = {
  WAITING: "var(--status-waiting)",
  CALLED: "var(--status-called)",
  IN_PROGRESS: "var(--status-progress)",
  COMPLETED: "var(--status-completed)",
  CANCELLED: "var(--status-cancelled)",
};

export function StatusBadge({ status }: { status: string | undefined }) {
  const s = normalizeStatus(status);
  const color = VARS[s];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium"
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {LABELS[s]}
    </span>
  );
}
