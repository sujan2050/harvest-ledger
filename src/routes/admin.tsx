import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Wheat, Network, CircleCheckBig } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { StatCard } from "@/components/StatCard";
import {
  Button,
  Card,
  EmptyState,
  ErrorText,
  Field,
  PageHeader,
  Skeleton,
  TextInput,
} from "@/components/ui-bits";
import { api, asArray, centerCapacityOf, centerHoursOf, type Center, type CropType } from "@/lib/api";
import { useRequireRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Panel — KrishiSetu" },
      {
        name: "description",
        content: "Manage procurement centres and crop types, including MSP and base prices.",
      },
      { property: "og:title", content: "Admin Panel — KrishiSetu" },
      {
        property: "og:description",
        content: "Manage procurement centres and crop types, including MSP and base prices.",
      },
    ],
  }),
  component: AdminPage,
});

type Tab = "centers" | "crops";

function AdminPage() {
  const { ready } = useRequireRole(["ADMIN"]);
  const [tab, setTab] = useState<Tab>("centers");
  const centerStats = useQuery({ queryKey: ["centers"], queryFn: async () => asArray<Center>(await api("/centers")), enabled: ready });
  const cropStats = useQuery({ queryKey: ["crop-types"], queryFn: async () => asArray<CropType>(await api("/crop-types")), enabled: ready });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <PageHeader title="Admin Panel" subtitle="Reference data for the procurement network." />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard icon={Building2} value={centerStats.data?.length ?? "—"} label="Total centers" note="Procurement network" accent="green" />
          <StatCard icon={Wheat} value={cropStats.data?.length ?? "—"} label="Crop types" note="Configured commodities" accent="amber" />
          <StatCard icon={Network} value={centerStats.isError || cropStats.isError ? "Check" : "Live"} label="Network status" note="Reference services" accent="blue" />
        </div>
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <nav className="card-surface h-fit p-2">
            {[
              { id: "centers" as Tab, label: "Centers", icon: Building2 },
              { id: "crops" as Tab, label: "Crop Types", icon: Wheat },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors duration-150",
                  tab === id
                    ? "bg-muted font-medium text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon size={20} strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </nav>
          <div>{ready && (tab === "centers" ? <CentersPanel /> : <CropsPanel />)}</div>
        </div>
      </main>
    </div>
  );
}

function CentersPanel() {
  const qc = useQueryClient();
  const centers = useQuery({
    queryKey: ["centers"],
    queryFn: async () => asArray<Center>(await api("/centers")),
  });
  const [form, setForm] = useState({
    name: "",
    location: "",
    capacityPerDay: "",
    operatingStart: "",
    operatingEnd: "",
  });
  const [error, setError] = useState<string | null>(null);

  const add = useMutation({
    mutationFn: () =>
      api("/centers", {
        method: "POST",
        body: {
          name: form.name.trim(),
          location: form.location.trim(),
          capacityPerDay: Number(form.capacityPerDay) || 0,
          operatingStart: form.operatingStart ? `${form.operatingStart}:00` : null,
          operatingEnd: form.operatingEnd ? `${form.operatingEnd}:00` : null,
        },
      }),
    onSuccess: () => {
      setForm({ name: "", location: "", capacityPerDay: "", operatingStart: "", operatingEnd: "" });
      setError(null);
      void qc.invalidateQueries({ queryKey: ["centers"] });
      toast.success("Center added successfully");
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Could not add centre."),
  });


  return (
    <div className="space-y-6">
      <Card title="Procurement centres">
        {centers.isError ? (
          <ErrorText>
            {centers.error instanceof Error ? centers.error.message : "Could not load centres."}
          </ErrorText>
        ) : centers.isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-11" />
            ))}
          </div>
        ) : (centers.data ?? []).length === 0 ? (
          <EmptyState
            icon={<Building2 size={32} strokeWidth={1.25} />}
            title="No centres yet"
            description="Add your first procurement centre using the form below."
          />
        ) : (
          <div className="overflow-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted text-left text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 text-right font-medium">Capacity</th>
                  <th className="px-4 py-3 font-medium">Hours</th>
                </tr>
              </thead>
              <tbody>
                {centers.data!.map((c, i) => (
                  <tr key={c.id} className={i % 2 === 1 ? "bg-background" : undefined}>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.location ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-mono">{centerCapacityOf(c)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{centerHoursOf(c)}</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Add centre">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return setError("Centre name is required.");
            add.mutate();
          }}
          className="grid gap-5 sm:grid-cols-2"
        >
          <Field label="Name">
            <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Location">
            <TextInput
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </Field>
          <Field label="Capacity">
            <TextInput
              type="number"
              min="0"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="text-right font-mono"
            />
          </Field>
          <Field label="Operating hours">
            <TextInput
              value={form.operatingHours}
              onChange={(e) => setForm({ ...form, operatingHours: e.target.value })}
              placeholder="09:00 – 17:00"
            />
          </Field>
          <div className="sm:col-span-2">
            <ErrorText>{error}</ErrorText>
            <Button type="submit" disabled={add.isPending} className="mt-2">
              {add.isPending ? "Adding…" : "Add centre"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function CropsPanel() {
  const qc = useQueryClient();
  const crops = useQuery({
    queryKey: ["crop-types"],
    queryFn: async () => asArray<CropType>(await api("/crop-types")),
  });
  const [form, setForm] = useState({
    name: "",
    category: "",
    unit: "",
    basePrice: "",
    mspPrice: "",
  });
  const [error, setError] = useState<string | null>(null);

  const add = useMutation({
    mutationFn: () =>
      api("/crop-types", {
        method: "POST",
        body: {
          name: form.name.trim(),
          category: form.category.trim(),
          unit: form.unit.trim(),
          basePrice: Number(form.basePrice) || 0,
          mspPrice: Number(form.mspPrice) || 0,
        },
      }),
    onSuccess: () => {
      setForm({ name: "", category: "", unit: "", basePrice: "", mspPrice: "" });
      setError(null);
      void qc.invalidateQueries({ queryKey: ["crop-types"] });
      toast.success("Crop type added successfully");
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Could not add crop type."),
  });

  return (
    <div className="space-y-6">
      <Card title="Crop types">
        {crops.isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-11" />
            ))}
          </div>
        ) : (crops.data ?? []).length === 0 ? (
          <EmptyState
            icon={<Wheat size={32} strokeWidth={1.25} />}
            title="No crop types yet"
            description="Add crops with their base and MSP prices to enable token generation."
          />
        ) : (
          <div className="overflow-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted text-left text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Crop</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Unit</th>
                  <th className="px-4 py-3 text-right font-medium">Base price</th>
                  <th className="px-4 py-3 text-right font-medium">MSP price</th>
                </tr>
              </thead>
              <tbody>
                {crops.data!.map((c, i) => (
                  <tr key={c.id} className={i % 2 === 1 ? "bg-background" : undefined}>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.category ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.unit ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-mono">{c.basePrice ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-primary">
                      {c.mspPrice ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Add crop type">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return setError("Crop name is required.");
            add.mutate();
          }}
          className="grid gap-5 sm:grid-cols-2"
        >
          <Field label="Name">
            <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Category">
            <TextInput
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Cereal, Pulse, Oilseed…"
            />
          </Field>
          <Field label="Unit">
            <TextInput
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="quintal, kg"
            />
          </Field>
          <Field label="Base price">
            <TextInput
              type="number"
              min="0"
              step="0.01"
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
              className="text-right font-mono"
            />
          </Field>
          <Field label="MSP price">
            <TextInput
              type="number"
              min="0"
              step="0.01"
              value={form.mspPrice}
              onChange={(e) => setForm({ ...form, mspPrice: e.target.value })}
              className="text-right font-mono"
            />
          </Field>
          <div className="sm:col-span-2">
            <ErrorText>{error}</ErrorText>
            <Button type="submit" disabled={add.isPending} className="mt-2">
              {add.isPending ? "Adding…" : "Add crop type"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
