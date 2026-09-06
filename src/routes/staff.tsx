import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, PhoneCall, Users, Timer, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import { StatCard } from "@/components/StatCard";
import {
  Button,
  Card,
  EmptyState,
  ErrorText,
  Field,
  PageHeader,
  Segmented,
  SelectInput,
  Skeleton,
  TextInput,
} from "@/components/ui-bits";
import {
  api,
  asArray,
  cropNameOf,
  farmerNameOf,
  normalizeStatus,
  quantityOf,
  type Center,
  type Procurement,
  type QueueToken,
} from "@/lib/api";

import { useRequireRole } from "@/lib/auth";

export const Route = createFileRoute("/staff")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Staff Queue Desk — KrishiSetu" },
      {
        name: "description",
        content: "Call the next farmer, record procurement and complete tokens at your centre.",
      },
      { property: "og:title", content: "Staff Queue Desk — KrishiSetu" },
      {
        property: "og:description",
        content: "Call the next farmer, record procurement and complete tokens at your centre.",
      },
    ],
  }),
  component: StaffPage,
});

type Grade = "A" | "B" | "C";

function StaffPage() {
  const { ready } = useRequireRole(["STAFF", "ADMIN"]);
  const qc = useQueryClient();
  const [centerId, setCenterId] = useState("");

  const centers = useQuery({
    queryKey: ["centers"],
    queryFn: async () => asArray<Center>(await api("/centers")),
    enabled: ready,
  });

  useEffect(() => {
    if (!centerId && centers.data?.length) setCenterId(String(centers.data[0]!.id));
  }, [centers.data, centerId]);

  const queue = useQuery({
    queryKey: ["queue-status", centerId],
    queryFn: async () => asArray<QueueToken>(await api(`/queue/status/${centerId}`)),
    enabled: ready && !!centerId,
    refetchInterval: 5000,
  });

  const tokens = queue.data ?? [];
  const called = useMemo(
    () => tokens.find((t) => ["CALLED", "IN_PROGRESS"].includes(normalizeStatus(t.status))),
    [tokens],
  );

  const [actionError, setActionError] = useState<string | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["queue-status"] });

  const callNext = useMutation({
    mutationFn: () => api(`/queue/call-next/${centerId}`, { method: "POST" }),
    onSuccess: () => {
      setActionError(null);
      void refresh();
      toast.success("Next farmer called");
    },
    onError: (e) => setActionError(e instanceof Error ? e.message : "Could not call the next token."),
  });

  const complete = useMutation({
    mutationFn: (tokenId: number) => api(`/queue/${tokenId}/complete`, { method: "POST" }),
    onSuccess: () => {
      setActionError(null);
      void refresh();
      toast.success("Token marked complete");
    },
    onError: (e) => setActionError(e instanceof Error ? e.message : "Could not complete the token."),
  });

  // Procurement form
  const [actualQty, setActualQty] = useState("");
  const [grade, setGrade] = useState<Grade>("A");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<{ total: number; qty: number; price: number } | null>(null);

  const record = useMutation({
    mutationFn: () =>
      api<Record<string, unknown>>("/procurement", {
        method: "POST",
        body: {
          tokenId: called?.id,
          actualQuantity: Number(actualQty),
          qualityGrade: grade,
          pricePerUnit: Number(pricePerUnit),
        },
      }),
    onSuccess: (data) => {
      const qty = Number(actualQty);
      const price = Number(pricePerUnit);
      const total = Number(data?.["totalAmount"] ?? data?.["total"] ?? qty * price);
      setResult({ total, qty, price });
      setFormError(null);
      setActualQty("");
      setPricePerUnit("");
      void refresh();
      toast.success("Procurement recorded", { description: "The total has been calculated and saved." });
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : "Could not record procurement."),
  });

  function submitProcurement(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!called) {
      setFormError("Call a token before recording procurement.");
      return;
    }
    if (!actualQty || Number(actualQty) <= 0 || !pricePerUnit || Number(pricePerUnit) <= 0) {
      setFormError("Enter a quantity and price per unit greater than zero.");
      return;
    }
    record.mutate();
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <PageHeader title="Queue Desk" subtitle="Call farmers and record procurement." />
          <div className="mb-6 w-64">
            <Field label="Procurement centre">
              <SelectInput value={centerId} onChange={(e) => setCenterId(e.target.value)}>
                {centers.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard icon={Users} value={tokens.filter((t) => normalizeStatus(t.status) === "WAITING").length} label="Waiting now" note="Live center queue" accent="green" />
          <StatCard icon={BadgeCheck} value={tokens.filter((t) => normalizeStatus(t.status) === "COMPLETED").length} label="Completed" note="Visible queue records" accent="amber" />
          <StatCard icon={Timer} value="5 sec" label="Queue refresh" note="Automatic live updates" accent="blue" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card
            title="Current queue"
            icon={<Users size={20} className="text-muted-foreground" />}
            action={
              <Button onClick={() => callNext.mutate()} disabled={!centerId || callNext.isPending}>
                <PhoneCall size={18} strokeWidth={1.75} />
                {callNext.isPending ? "Calling…" : "Call Next"}
              </Button>
            }
          >
            {(centers.isError || queue.isError) && (
              <div className="mb-4">
                <ErrorText>
                  {(centers.error ?? queue.error) instanceof Error
                    ? ((centers.error ?? queue.error) as Error).message
                    : "Could not reach the procurement API."}
                </ErrorText>
              </div>
            )}
            {actionError && (
              <div className="mb-4">
                <ErrorText>{actionError}</ErrorText>
              </div>
            )}
            {queue.isLoading ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-11" />
                ))}
              </div>
            ) : tokens.length === 0 ? (
              <EmptyState
                icon={<Users size={32} strokeWidth={1.25} />}
                title="No farmers in queue yet"
                description="Tokens generated by farmers for this centre will appear here."
              />
            ) : (
              <div className="max-h-[520px] overflow-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-muted">
                    <tr className="text-left text-xs tracking-wide text-muted-foreground uppercase">
                      <th className="px-4 py-3 font-medium">Token</th>
                      <th className="px-4 py-3 font-medium">Farmer</th>
                      <th className="px-4 py-3 font-medium">Crop</th>
                      <th className="px-4 py-3 text-right font-medium">Quantity</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.map((t, i) => (
                      <tr
                        key={t.id}
                        className={i % 2 === 1 ? "bg-background" : undefined}
                      >
                        <td className="px-4 py-3 font-mono font-medium">
                          {String(t.tokenNumber ?? t.id)}
                        </td>
                        <td className="px-4 py-3">{farmerNameOf(t)}</td>
                        <td className="px-4 py-3">{cropNameOf(t)}</td>
                        <td className="px-4 py-3 text-right font-mono">{t.quantity ?? "—"}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={t.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card title="Record Procurement">
              {called ? (
                <p className="mb-5 text-sm text-muted-foreground">
                  Serving token{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {String(called.tokenNumber ?? called.id)}
                  </span>{" "}
                  — {farmerNameOf(called)}
                </p>
              ) : (
                <p className="mb-5 text-sm text-muted-foreground">
                  No token is currently called. Use “Call Next” to begin.
                </p>
              )}

              <form onSubmit={submitProcurement} className="space-y-5">
                <Field label="Actual quantity">
                  <TextInput
                    type="number"
                    min="0"
                    step="0.01"
                    value={actualQty}
                    onChange={(e) => setActualQty(e.target.value)}
                    className="text-right font-mono"
                  />
                </Field>
                <Field label="Quality grade">
                  <Segmented
                    options={[
                      { value: "A" as Grade, label: "A" },
                      { value: "B" as Grade, label: "B" },
                      { value: "C" as Grade, label: "C" },
                    ]}
                    value={grade}
                    onChange={setGrade}
                  />
                </Field>
                <Field label="Price per unit">
                  <TextInput
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value)}
                    className="text-right font-mono"
                  />
                </Field>
                <ErrorText>{formError}</ErrorText>
                <div className="flex gap-3">
                  <Button type="submit" variant="amber" disabled={record.isPending} className="flex-1">
                    {record.isPending ? "Saving…" : "Record procurement"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!called || complete.isPending}
                    onClick={() => called && complete.mutate(called.id)}
                  >
                    <CheckCircle2 size={18} strokeWidth={1.75} />
                    Mark complete
                  </Button>
                </div>
              </form>

              {result && (
                <div className="mt-6 rounded-lg border border-border bg-muted p-5">
                  <p className="text-xs tracking-wide text-muted-foreground uppercase">
                    Computed total
                  </p>
                  <p className="mt-1 font-mono text-3xl font-bold text-primary">
                    ₹{result.total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {result.qty} × ₹{result.price} · grade {grade}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
