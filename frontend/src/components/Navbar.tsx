import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Monitor } from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/api";

const LINKS: Record<Role, { to: string; label: string }[]> = {
  FARMER: [{ to: "/farmer", label: "Dashboard" }],
  STAFF: [{ to: "/staff", label: "Queue Desk" }],
  ADMIN: [{ to: "/admin", label: "Admin Panel" }],
};

function initials(name: string) {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user ? LINKS[user.role] : [];

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-primary-foreground/10 bg-primary text-primary-foreground shadow-[0_6px_24px_rgba(27,67,50,0.16)]">
      <div className="mx-auto flex h-15 max-w-7xl items-center gap-8 px-6 py-3">
        <Link to="/" className="font-display text-lg font-semibold tracking-tight">
          Krishi<span className="opacity-70">Setu</span>
        </Link>

        <nav className="flex h-full items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="relative rounded-md px-3 py-2 text-primary-foreground/75 transition-colors duration-150 after:absolute after:inset-x-3 after:-bottom-1 after:h-0.5 after:scale-x-0 after:bg-secondary after:shadow-[0_0_8px_var(--secondary)] after:transition-transform hover:text-primary-foreground"
              activeProps={{
                className:
                  "relative rounded-md px-3 py-2 text-primary-foreground font-medium after:absolute after:inset-x-3 after:-bottom-1 after:h-0.5 after:scale-x-100 after:bg-secondary after:shadow-[0_0_8px_var(--secondary)]",
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/display"
            className="ml-1 inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-primary-foreground/75 transition-colors duration-150 hover:text-primary-foreground"
          >
            <Monitor size={18} strokeWidth={1.75} />
            Queue Board
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {user && (
            <>
              <div className="hidden items-center gap-3 sm:flex">
                <span className="rounded-full border border-secondary/35 bg-secondary/15 px-2.5 py-1 text-[10px] font-semibold text-display-soft">
                  {user.role}
                </span>
                <div className="text-right leading-tight">
                <div className="text-sm font-medium">{user.fullName ?? user.username}</div>
                <div className="text-[11px] text-primary-foreground/60">Verified account</div>
                </div>
              </div>
              <div className="grid size-9 place-items-center rounded-full bg-primary-hover text-sm font-medium">
                {initials(user.fullName ?? user.username)}
              </div>
              <button
                onClick={() => {
                  logout();
                  void navigate({ to: "/login", replace: true });
                }}
                aria-label="Log out"
                className="rounded-md p-2 text-primary-foreground/75 transition-colors duration-150 hover:bg-primary-hover hover:text-primary-foreground"
              >
                <LogOut size={20} strokeWidth={1.75} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
