export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "http://localhost:8080/api";

const TOKEN_KEY = "sfp_jwt";
const USER_KEY = "sfp_user";

export type Role = "FARMER" | "STAFF" | "ADMIN";

export interface AuthUser {
  username: string;
  role: Role;
  fullName?: string | undefined;
  id?: number | string | undefined;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function storeSession(token: string, user: AuthUser) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new ApiError("Could not reach the server. Check that the API is running.", 0);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    throw new ApiError(
      `No API found at ${API_BASE_URL}. Start the Spring Boot service or set VITE_API_BASE_URL.`,
      res.status,
    );
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: unknown }).message)
        : typeof data === "string" && data
          ? data
          : null) ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}

// ---- Domain types (loose, tolerant of backend naming) ----
export interface Center {
  id: number;
  name: string;
  location?: string;
  capacityPerDay?: number;
  capacity?: number;
  operatingStart?: string;
  operatingEnd?: string;
  operatingHours?: string;
}

export interface CropType {
  id: number;
  name: string;
  category?: string;
  unit?: string;
  basePrice?: number;
  mspPrice?: number;
}

export interface Procurement {
  id?: number;
  totalAmount?: number;
  pricePerUnit?: number;
  qualityGrade?: string;
  paymentStatus?: string;
  actualQuantity?: number;
}

export interface FarmerProfile {
  id?: number;
  fullName?: string;
  name?: string;
  aadharNumber?: string;
  village?: string;
  district?: string;
  bankAccount?: string;
  ifscCode?: string;
  phone?: string;
}

export type QueueStatus = "WAITING" | "CALLED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface QueueToken {
  id: number;
  tokenNumber: string | number;
  status: QueueStatus | string;
  farmerName?: string;
  farmer?: { fullName?: string; name?: string };
  cropType?: { name?: string } | string;
  cropTypeName?: string;
  estimatedQuantity?: number;
  quantity?: number;
  centerId?: number;
  centerName?: string;
  calledAt?: string;
  createdAt?: string;
}

export function farmerNameOf(t: QueueToken): string {
  return t.farmerName ?? t.farmer?.fullName ?? t.farmer?.name ?? "—";
}

export function cropNameOf(t: QueueToken): string {
  if (typeof t.cropType === "string") return t.cropType;
  return t.cropTypeName ?? t.cropType?.name ?? "—";
}

export function quantityOf(t: QueueToken): number | undefined {
  return t.estimatedQuantity ?? t.quantity;
}

/** "08:00:00" -> "08:00" */
export function formatTime(value: string | undefined): string | null {
  if (!value) return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(value);
  return m ? `${m[1]!.padStart(2, "0")}:${m[2]}` : value;
}

export function centerCapacityOf(c: Center): number | string {
  return c.capacityPerDay ?? c.capacity ?? "—";
}

export function centerHoursOf(c: Center): string {
  const start = formatTime(c.operatingStart);
  const end = formatTime(c.operatingEnd);
  if (start && end) return `${start} – ${end}`;
  if (start) return start;
  return c.operatingHours ?? "—";
}

export function normalizeStatus(status: string | undefined): QueueStatus {
  const s = (status ?? "").toUpperCase().replace(/[\s-]/g, "_");
  if (s === "CALLED") return "CALLED";
  if (s === "IN_PROGRESS" || s === "INPROGRESS") return "IN_PROGRESS";
  if (s === "COMPLETED") return "COMPLETED";
  if (s === "CANCELLED" || s === "CANCELED") return "CANCELLED";
  return "WAITING";
}

export function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const key of ["content", "data", "items", "tokens", "queue"]) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
  }
  return [];
}

