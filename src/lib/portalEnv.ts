/**
 * GlowPro portals: production uses subdomains (biz., admin., recruiter.);
 * local dev maps the same apps to Vite ports (5173 consumer, 5174 biz, 5175 admin, 5176 recruiter).
 */
export function isBizPortalHost(): boolean {
  if (typeof window === "undefined") return false;
  const { hostname, port } = window.location;
  return hostname.startsWith("biz.") || port === "5174";
}

export function isAdminPortalHost(): boolean {
  if (typeof window === "undefined") return false;
  const { hostname, port } = window.location;
  return hostname.startsWith("admin.") || port === "5175";
}

export function isRecruiterPortalHost(): boolean {
  if (typeof window === "undefined") return false;
  const { hostname, port } = window.location;
  return hostname.startsWith("recruiter.") || port === "5176";
}
