import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, homeForRole } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KrishiSetu — Procurement & Queue Management" },
      {
        name: "description",
        content:
          "Sign in to generate procurement tokens, run the queue desk, or administer centres and crop types.",
      },
      { property: "og:title", content: "KrishiSetu — Procurement & Queue Management" },
      {
        property: "og:description",
        content: "Token queues, procurement records and centre administration in one place.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    void navigate({ to: user ? homeForRole(user.role) : "/login", replace: true });
  }, [ready, user, navigate]);

  return (
    <main className="grid min-h-screen place-items-center bg-background">
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold">KrishiSetu</h1>
        <p className="mt-1 text-sm text-muted-foreground">Loading your workspace…</p>
      </div>
    </main>
  );
}
