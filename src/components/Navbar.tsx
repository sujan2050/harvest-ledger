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
    <header className="sticky top-0 z-30 h-15 bg-primary text-primary-foreground">
      <div className="mx-auto flex h-15 max-w-7xl items-center gap-8 px-6 py-3">
        <Link to="/" className="font-display text-lg font-semibold tracking-tight">
          Krishi<span className="opacity-70">Setu</span>
        </Link>

        <nav className="flex h-full items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md border-t-[3px] border-transparent px-3 py-2 text-primary-foreground/75 transition-colors duration-150 hover:text-primary-foreground"
              activeProps={{
                className:
                  "rounded-md px-3 py-2 border-t-[3px] border-secondary text-primary-foreground font-medium",
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
              <div className="hidden text-right leading-tight sm:block">
                <div className="text-sm font-medium">{user.fullName ?? user.username}</div>
                <div className="text-[11px] tracking-wide text-primary-foreground/60 uppercase">
                  {user.role}
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
