import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sprout } from "lucide-react";
import { Button, Field, TextInput, ErrorText, Segmented } from "@/components/ui-bits";
import { api, type Role } from "@/lib/api";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — KrishiSetu" },
      {
        name: "description",
        content: "Register as a farmer, procurement staff member or administrator.",
      },
      { property: "og:title", content: "Create your account — KrishiSetu" },
      {
        property: "og:description",
        content: "Register as a farmer, procurement staff member or administrator.",
      },
    ],
  }),
  component: RegisterPage,
});

const ROLES: { value: Role; label: string }[] = [
  { value: "FARMER", label: "Farmer" },
  { value: "STAFF", label: "Staff" },
  { value: "ADMIN", label: "Admin" },
];

function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("FARMER");
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    aadharNumber: "",
    village: "",
    district: "",
    bankAccount: "",
    ifscCode: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.username.trim() || form.password.length < 6) {
      setError("Username is required and the password must be at least 6 characters.");
      return;
    }
    if (role === "FARMER" && (!form.fullName.trim() || !form.village.trim())) {
      setError("Farmers must provide at least a full name and village.");
      return;
    }
    setBusy(true);
    try {
      await api("/auth/register", {
        method: "POST",
        auth: false,
        body: {
          username: form.username.trim(),
          password: form.password,
          email: form.email.trim() || undefined,
          role,
          ...(role === "FARMER"
            ? {
                fullName: form.fullName.trim(),
                aadharNumber: form.aadharNumber.trim(),
                village: form.village.trim(),
                district: form.district.trim(),
                bankAccount: form.bankAccount.trim(),
                ifscCode: form.ifscCode.trim(),
              }
            : { fullName: form.fullName.trim() || undefined }),
        },
      });
      void navigate({ to: "/login", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  const isFarmer = role === "FARMER";

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex items-center justify-center gap-2 text-primary">
          <Sprout size={22} strokeWidth={1.75} />
          <span className="font-display text-xl font-semibold">KrishiSetu</span>
        </div>
        <div className="card-surface p-8">
          <h1 className="font-display text-2xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose your role — farmers provide a few extra details.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-5">
            <Field label="I am registering as">
              <Segmented options={ROLES} value={role} onChange={setRole} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Username">
                <TextInput value={form.username} onChange={set("username")} autoComplete="username" />
              </Field>
              <Field label="Password" hint="Minimum 6 characters">
                <TextInput
                  type="password"
                  value={form.password}
                  onChange={set("password")}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Email">
                <TextInput type="email" value={form.email} onChange={set("email")} />
              </Field>
              {!isFarmer && (
                <Field label="Full name">
                  <TextInput value={form.fullName} onChange={set("fullName")} />
                </Field>
              )}
            </div>

            <div
              className="grid transition-[grid-template-rows,opacity] duration-200 ease-out"
              style={{ gridTemplateRows: isFarmer ? "1fr" : "0fr", opacity: isFarmer ? 1 : 0 }}
            >
              <div className="overflow-hidden">
                <div className="rounded-lg border border-border bg-muted/50 p-5">
                  <h2 className="font-display text-base font-semibold">Farmer details</h2>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    <Field label="Full name">
                      <TextInput value={form.fullName} onChange={set("fullName")} />
                    </Field>
                    <Field label="Aadhar number">
                      <TextInput
                        value={form.aadharNumber}
                        onChange={set("aadharNumber")}
                        inputMode="numeric"
                        maxLength={12}
                        className="font-mono"
                      />
                    </Field>
                    <Field label="Village">
                      <TextInput value={form.village} onChange={set("village")} />
                    </Field>
                    <Field label="District">
                      <TextInput value={form.district} onChange={set("district")} />
                    </Field>
                    <Field label="Bank account number">
                      <TextInput
                        value={form.bankAccount}
                        onChange={set("bankAccount")}
                        className="font-mono"
                      />
                    </Field>
                    <Field label="IFSC code">
                      <TextInput
                        value={form.ifscCode}
                        onChange={set("ifscCode")}
                        className="font-mono uppercase"
                        maxLength={11}
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </div>

            <ErrorText>{error}</ErrorText>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
