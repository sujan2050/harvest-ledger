import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Radio, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, asArray, normalizeStatus, type Center, type QueueToken } from "@/lib/api";

export const Route = createFileRoute("/display")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Live Queue Board — KrishiSetu" },
      {
        name: "description",
        content: "Public display board showing the token now being served at a procurement centre.",
      },
      { property: "og:title", content: "Live Queue Board — KrishiSetu" },
      {
        property: "og:description",
        content: "Now serving and upcoming tokens at the procurement centre.",
      },
    ],
  }),
  component: DisplayPage,
});

function DisplayPage() {
  const [centerId, setCenterId] = useState("");

  const centers = useQuery({
    queryKey: ["centers-public"],
    queryFn: async () => asArray<Center>(await api("/centers", { auth: false })),
  });

  useEffect(() => {
    if (!centerId && centers.data?.length) setCenterId(String(centers.data[0]!.id));
  }, [centers.data, centerId]);

  const queue = useQuery({
    queryKey: ["queue-status", centerId],
    queryFn: async () => asArray<QueueToken>(await api(`/queue/status/${centerId}`, { auth: false })),
    enabled: !!centerId,
    refetchInterval: 5000,
  });

  const tokens = queue.data ?? [];
  const serving = tokens.find((t) => normalizeStatus(t.status) === "CALLED");
  const waiting = tokens.filter((t) => normalizeStatus(t.status) === "WAITING");

  return (
    <main className="min-h-screen overflow-hidden bg-primary px-5 py-6 text-primary-foreground sm:px-10 sm:py-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between border-b border-primary-foreground/15 pb-5">
        <div><p className="flex items-center gap-2 text-[10px] font-semibold text-display-soft uppercase"><Radio size={14} /> Live terminal</p><h1 className="mt-1 font-display text-2xl font-semibold">KrishiSetu Queue</h1></div>
        <select
          value={centerId}
          onChange={(e) => setCenterId(e.target.value)}
          className="rounded-md border border-primary-foreground/25 bg-transparent px-3 py-1.5 text-sm text-primary-foreground outline-none"
        >
          {centers.data?.map((c) => (
            <option key={c.id} value={c.id} className="text-foreground">
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {(centers.isError || queue.isError) && (
        <p className="mx-auto mt-6 max-w-6xl text-center text-sm text-[#F4B0A0]">
          {(centers.error ?? queue.error) instanceof Error
            ? ((centers.error ?? queue.error) as Error).message
            : "Could not reach the procurement API."}
        </p>
      )}

      <section className="mx-auto mt-8 max-w-7xl">
        <p className="text-center text-sm tracking-[0.3em] text-primary-foreground/60 uppercase">
          Now serving
        </p>
        <div
          className={`queue-spotlight relative mt-4 overflow-hidden rounded-lg border border-primary-foreground/20 py-10 text-center shadow-[inset_0_0_80px_rgba(0,0,0,0.12),0_24px_70px_rgba(0,0,0,0.18)] ${
            serving ? "pulse-called" : ""
          }`}
        >
          <p
            className="font-mono leading-none font-bold"
            className="font-mono leading-none font-bold text-display-soft drop-shadow-[0_0_32px_rgba(201,132,60,0.28)]"
            style={{ fontSize: "clamp(88px, 18vw, 210px)" }}
          >
            {serving ? String(serving.tokenNumber ?? serving.id) : "—"}
          </p>
          {serving && (
            <p className="mt-6 text-2xl text-primary-foreground/80">
              {serving.farmerName ?? serving.farmer?.fullName ?? ""}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-7xl">
        <div className="flex items-center justify-between"><p className="text-sm tracking-[0.24em] text-primary-foreground/60 uppercase">Waiting · {waiting.length}</p><Users size={20} className="text-primary-foreground/40" /></div>
        {waiting.length === 0 ? (
          <p className="mt-6 text-primary-foreground/50">No farmers in queue yet.</p>
        ) : (
          <div className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-8">
            {waiting.map((t) => (
              <div
                key={t.id}
                className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 py-4 text-center font-mono text-3xl font-medium"
              >
                {String(t.tokenNumber ?? t.id)}
              </div>
            ))}
          </div>
        )}
        <div className="mt-7 flex items-center gap-4">
          <span className="text-[10px] font-semibold text-primary-foreground/45 uppercase">Next up</span>
          <div className="relative h-0.5 flex-1 overflow-hidden bg-primary-foreground/10"><span className="queue-progress absolute inset-y-0 left-0 w-1/3 bg-secondary" /></div>
          <div className="flex gap-1.5">{[0,1,2].map((n) => <span key={n} className={`size-1.5 rounded-full ${n === 0 ? "bg-secondary" : "bg-primary-foreground/20"}`} />)}</div>
        </div>
      </section>
    </main>
  );
}
