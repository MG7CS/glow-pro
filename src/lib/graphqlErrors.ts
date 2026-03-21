/** Human-readable message from Amplify GraphQL / AppSync errors */
export function formatAppSyncError(err: unknown): string {
  if (err == null) return "Unknown error";
  if (typeof err === "string") return err;
  if (!(err instanceof Error) && typeof err !== "object") return String(err);
  const e = err as Record<string, unknown> & { message?: string };
  const arr = e.errors as Array<{ message?: string }> | undefined;
  if (Array.isArray(arr) && arr[0]?.message) return String(arr[0].message);
  if (e.message && typeof e.message === "string") return e.message;
  try {
    return JSON.stringify(e);
  } catch {
    return "Unknown error";
  }
}
