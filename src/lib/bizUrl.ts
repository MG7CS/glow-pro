/** Production biz portal (GlowPro professionals). */
const BIZ_PRODUCTION = "https://biz.glowpro.rw";

/** Local biz dev server — run the biz app separately (default Vite port 5174). */
const BIZ_LOCAL = "http://localhost:5174";

/**
 * Base URL for the biz portal (onboarding, dashboard, /join).
 * - Local dev: `http://localhost:5174` when the consumer app is on localhost/127.0.0.1 (e.g. port 5173) or `import.meta.env.DEV` is true.
 * - Override: set `VITE_BIZ_PORTAL_URL` (e.g. staging).
 * - Production: `https://biz.glowpro.rw`
 */
export function getBizUrl(): string {
  const override = import.meta.env.VITE_BIZ_PORTAL_URL?.trim();
  if (override) {
    return override.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1") {
      return BIZ_LOCAL;
    }
  }
  if (import.meta.env.DEV) {
    return BIZ_LOCAL;
  }
  return BIZ_PRODUCTION;
}

export function getBizDashboardUrl(): string {
  return `${getBizUrl()}/dashboard`;
}

export function getBizJoinUrl(): string {
  return `${getBizUrl()}/join`;
}
