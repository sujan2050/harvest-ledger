import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Landmark, User, TicketCheck, Clock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Button,
  Card,
  EmptyState,
  ErrorText,
  Field,
  PageHeader,
  SelectInput,
  Skeleton,
  TextInput,
} from "@/components/ui-bits";
import {
  api,
  asArray,
  cropNameOf,
  normalizeStatus,
  type Center,
  type CropType,
  type FarmerProfile,
  type QueueToken,
} from "@/lib/api";
import { useRequireRole } from "@/lib/auth";

export const Route = createFileRoute("/farmer")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Farmer Dashboard — KrishiSetu" },
      {
        name: "description",
        content: "Generate a procurement token and follow its live queue status.",
      },
      { property: "og:title", content: "Farmer Dashboard — KrishiSetu" },
      {
        property: "og:description",
        content: "Generate a procurement token and follow its live queue status.",
      },
    ],
  }),
  component: FarmerPage,
});

function FarmerPage() {
  const { ready } = useRequireRole(["FARMER"]);
  const qc = useQueryClient();

  const profile = useQuery({
    queryKey: ["farmer-me"],
    queryFn: () => api<FarmerProfile>("/farmers/me"),
    enabled: ready,
  });

  const centers = useQuery({
    queryKey: ["centers"],
    queryFn: async () => asArray<Center>(await api("/centers")),
    enabled: ready,
  });

  const crops = useQuery({
    queryKey: ["crop-types"],
    queryFn: async () => asArray<CropType>(await api("/crop-types")),
    enabled: ready,
  });

  const [centerId, setCenterId] = useState("");
  const [cropTypeId, setCropTypeId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [token, setToken] = useState<QueueToken | null>(null);

  const liveToken = useQuery({
    queryKey: ["token-status", token?.id],
    queryFn: () => api<QueueToken>(`/queue/token/${token!.id}`),
    enabled: !!token?.id,
    refetchInterval: 5000,
    retry: false,
  });

  const current = liveToken.data ?? token;

  const createToken = useMutation({
    mutationFn: () =>
      api<QueueToken>("/queue/token", {
        method: "POST",
        body: {
          centerId: Number(centerId),
          cropTypeId: Number(cropTypeId),
          quantity: Number(quantity),
        },
      }),
    onSuccess: (data) => {
      setToken(data);
      setQuantity("");
      void qc.invalidateQueries({ queryKey: ["queue-status"] });
    },
    onError: (err) => setFormError(err instanceof Error ? err.message : "Could not create token."),
  });

  const centerName = useMemo(
    () => centers.data?.find((c) => String(c.id) === centerId)?.name,
    [centers.data, centerId],
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!centerId || !cropTypeId || !quantity || Number(quantity) <= 0) {
      setFormError("Select a centre, a crop and enter a quantity greater than zero.");
      return;
    }
    createToken.mutate();
  }

  const name = profile.data?.fullName ?? profile.data?.name ?? "—";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <PageHeader title="Farmer Dashboard" subtitle="Your profile, tokens and queue status." />

        <Card className="mb-6">
          {profile.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : profile.isError ? (
            <ErrorText>
              {profile.error instanceof Error ? profile.error.message : "Profile unavailable."}
            </ErrorText>
          ) : (
            <div className="grid gap-6 sm:grid-cols-3">
              <InfoRow icon={<User size={20} strokeWidth={1.75} />} label="Farmer" value={name} />
              <InfoRow
                icon={<MapPin size={20} strokeWidth={1.75} />}
                label="Village"
                value={profile.data?.village ?? "—"}
              />
              <InfoRow
                icon={<Landmark size={20} strokeWidth={1.75} />}
                label="District"
                value={profile.data?.district ?? "—"}
              />
            </div>
          )}
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <Card title="Generate Token" icon={<TicketCheck size={20} className="text-secondary" />}>
            <form onSubmit={submit} className="space-y-5">
              <Field label="Procurement centre">
                <SelectInput value={centerId} onChange={(e) => setCenterId(e.target.value)}>
                  <option value="">Select a centre</option>
                  {centers.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.location ? ` — ${c.location}` : ""}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Crop type">
                <SelectInput value={cropTypeId} onChange={(e) => setCropTypeId(e.target.value)}>
                  <option value="">Select a crop</option>
                  {crops.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.unit ? ` (${c.unit})` : ""}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Quantity">
                <TextInput
                  type="number"
                  min="0"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 250"
                  className="text-right font-mono"
                />
              </Field>
              <ErrorText>{formError}</ErrorText>
              <Button type="submit" variant="amber" disabled={createToken.isPending} className="w-full">
                {createToken.isPending ? "Generating…" : "Generate token"}
              </Button>
            </form>
          </Card>

          <div className="space-y-6">
            {current ? (
              <>
                <div className="ticket-stub p-7 text-center">
                  <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                    Your token
                  </p>
                  <p className="mt-2 font-mono text-6xl font-bold text-primary">
                    {String(current.tokenNumber ?? current.id)}
                  </p>
                  <div className="my-5 border-t border-dashed border-border" />
                  <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                    <span>{current.centerName ?? centerName ?? "Centre"}</span>
                    <span className="text-border">•</span>
                    <span>{cropNameOf(current)}</span>
                  </div>
                </div>
                <Card title="Live status" icon={<Clock size={20} className="text-muted-foreground" />}>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={current.status} />
                    <span className="text-xs text-muted-foreground">Refreshing every 5s</span>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {normalizeStatus(current.status) === "CALLED"
                      ? "You have been called — please proceed to the counter."
                      : normalizeStatus(current.status) === "COMPLETED"
                        ? "Procurement recorded. Thank you."
                        : "Please wait, your token will be called shortly."}
                  </p>
                </Card>
              </>
            ) : (
              <Card>
                <EmptyState
                  icon={<TicketCheck size={32} strokeWidth={1.25} />}
                  title="No active token"
                  description="Generate a token to join the queue at your procurement centre."
                />
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="mt-0.5 font-medium">{value}</p>
      </div>
    </div>
  );
}
