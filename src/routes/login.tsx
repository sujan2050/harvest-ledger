import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sprout } from "lucide-react";
import { Button, Field, TextInput, ErrorText } from "@/components/ui-bits";
import { useAuth, homeForRole } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — KrishiSetu" },
      { name: "description", content: "Sign in to the KrishiSetu procurement and queue system." },
      { property: "og:title", content: "Sign in — KrishiSetu" },
      { property: "og:description", content: "Access your farmer, staff or admin workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError("Enter both your username and password.");
      return;
    }
    setBusy(true);
    try {
      const user = await login(username.trim(), password);
      void navigate({ to: homeForRole(user.role), replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-primary">
          <Sprout size={22} strokeWidth={1.75} />
          <span className="font-display text-xl font-semibold">KrishiSetu</span>
        </div>
        <div className="card-surface p-8">
          <h1 className="font-display text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your procurement workspace.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-5">
            <Field label="Username">
              <TextInput
                value={username}
                autoComplete="username"
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your.username"
              />
            </Field>
            <Field label="Password">
              <TextInput
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            <ErrorText>{error}</ErrorText>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/register" className="font-medium text-primary hover:text-primary-hover">
              Create an account
            </Link>
          </p>
        </div>
        <p className="mt-5 text-center text-xs text-muted-foreground">
          <Link to="/display" className="hover:text-foreground">
            Open the public queue display board
          </Link>
        </p>
      </div>
    </main>
  );
}
