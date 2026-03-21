import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateClient } from "aws-amplify/api";
import {
  getCurrentUser,
  fetchUserAttributes,
  signOut as amplifySignOut,
} from "aws-amplify/auth";
import { ArrowRight, Copy } from "lucide-react";
import { toast } from "sonner";

type RecruiterStatus = "pending" | "approved" | "rejected";

type RecruiterShop = {
  id: string;
  name: string;
  category: string;
  neighborhood: string;
  recruitedBy?: string | null;
  status?: string | null;
  verified?: boolean | null;
};

const listRecruiterShops = /* GraphQL */ `
  query ListRecruiterShops($recruitedBy: String!) {
    listShops(filter: { recruitedBy: { eq: $recruitedBy } }) {
      items {
        id
        name
        category
        neighborhood
        recruitedBy
        verified
      }
    }
  }
`;

let _client: ReturnType<typeof generateClient> | null = null;
const getClient = () => (_client ??= generateClient());

const BIZ_JOIN_BASE = "https://biz.connectkigali.com/join";

/** Matches biz onboarding `recruitedBy` when owners use /join?ref=CK-… */
function recruiterDisplayIdFromUsername(u: string): string {
  return u ? `CK-${u.slice(-6).toUpperCase()}` : "CK-??????";
}

function mergeShopsById(a: RecruiterShop[], b: RecruiterShop[]): RecruiterShop[] {
  const map = new Map<string, RecruiterShop>();
  for (const s of [...a, ...b]) {
    if (s?.id && !map.has(s.id)) map.set(s.id, s);
  }
  return [...map.values()];
}

const toStatus = (shop: RecruiterShop): RecruiterStatus => {
  const normalized = shop.status?.toLowerCase();
  if (normalized === "approved" || normalized === "pending" || normalized === "rejected") {
    return normalized;
  }
  if (shop.verified === true) return "approved";
  if (shop.verified === false) return "rejected";
  return "pending";
};

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("Recruiter");
  const [username, setUsername] = useState("");
  const [shops, setShops] = useState<RecruiterShop[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const user = await getCurrentUser();
        const attrs = await fetchUserAttributes().catch(() => ({} as Record<string, string>));
        const recruiterName = attrs["custom:fullName"]?.trim() || user.username;
        setFullName(recruiterName);
        setUsername(user.username);

        const displayId = recruiterDisplayIdFromUsername(user.username);
        const [byDisplayId, byUsername] = await Promise.all([
          getClient().graphql({
            query: listRecruiterShops,
            variables: { recruitedBy: displayId },
            authMode: "userPool",
          }),
          getClient().graphql({
            query: listRecruiterShops,
            variables: { recruitedBy: user.username },
            authMode: "userPool",
          }),
        ]);
        const items1 = ((byDisplayId as any).data?.listShops?.items ?? []).filter(Boolean) as RecruiterShop[];
        const items2 = ((byUsername as any).data?.listShops?.items ?? []).filter(Boolean) as RecruiterShop[];
        setShops(mergeShopsById(items1, items2));
      } catch (err: any) {
        setError(err?.message ?? "Failed to load recruiter dashboard.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const total = shops.length;
    const approved = shops.filter((s) => toStatus(s) === "approved").length;
    const pending = shops.filter((s) => toStatus(s) === "pending").length;
    const approvalRate = total === 0 ? 0 : Math.round((approved / total) * 100);
    return { total, approved, pending, approvalRate };
  }, [shops]);

  const handleSignOut = async () => {
    try {
      await amplifySignOut({ global: false });
    } catch {
      // Ignore and still move the user back to the login page.
    }
    navigate("/", { replace: true });
  };

  const recruiterDisplayId = username
    ? `CK-${username.slice(-6).toUpperCase()}`
    : "CK-??????";

  const referralLink = username
    ? `${BIZ_JOIN_BASE}?ref=${encodeURIComponent(recruiterDisplayId)}`
    : "";

  const copyText = async (text: string, success: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(success);
    } catch {
      toast.error("Could not copy. Try selecting the text manually.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome, {fullName} 👋</h1>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-auto whitespace-nowrap text-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>

        {username && (
          <div className="mb-6 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/5 via-white to-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Your Recruiter ID</h2>
            <p className="mt-3 font-mono text-4xl font-bold tracking-[0.08em] text-foreground sm:text-5xl">
              {recruiterDisplayId}
            </p>
            <p className="mt-2 text-xs text-muted-foreground break-all font-mono sm:text-sm">
              Full ID: <span className="text-foreground font-medium">{username}</span>
            </p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xl">
              Share this ID with business owners when they sign up on ConnectKigali
            </p>
            <button
              type="button"
              onClick={() => {
                void copyText(recruiterDisplayId, "Recruiter ID copied");
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copy ID
            </button>

            <div className="mt-8 border-t border-border/60 pt-6">
              <p className="text-sm font-medium text-foreground">Or share this link:</p>
              <p className="mt-2 break-all rounded-lg bg-muted/50 px-3 py-2.5 font-mono text-xs text-foreground sm:text-sm">
                {referralLink}
              </p>
              <button
                type="button"
                onClick={() => copyText(referralLink, "Referral link copied")}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
              >
                <Copy className="h-4 w-4" />
                Copy link
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Registered" value={String(stats.total)} />
          <StatCard label="Approved" value={String(stats.approved)} />
          <StatCard label="Pending" value={String(stats.pending)} />
          <StatCard label="Approval Rate" value={`${stats.approvalRate}%`} />
        </div>

        <a
          href={`${BIZ_JOIN_BASE}?ref=${encodeURIComponent(recruiterDisplayId)}`}
          className="w-full sm:w-auto mb-6 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          Add a business <ArrowRight className="w-4 h-4" />
        </a>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">Your registered businesses</h2>

          {shops.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-muted-foreground text-sm">
              No businesses yet. Start by registering your first one! 🏪
            </div>
          ) : (
            <div className="space-y-2">
              {shops.map((shop) => {
                const status = toStatus(shop);
                return (
                  <div
                    key={shop.id}
                    className="rounded-xl border border-border px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{shop.name || "Untitled business"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {shop.category || "Uncategorized"} · {shop.neighborhood || "Kigali"}
                      </p>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-border/60">
    <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
  </div>
);

const StatusBadge = ({ status }: { status: RecruiterStatus }) => {
  const styles: Record<RecruiterStatus, string> = {
    pending: "text-amber-700 bg-amber-100 border-amber-200",
    approved: "text-green-700 bg-green-100 border-green-200",
    rejected: "text-red-700 bg-red-100 border-red-200",
  };

  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize shrink-0 ${styles[status]}`}>
      {status}
    </span>
  );
};

export default RecruiterDashboard;
