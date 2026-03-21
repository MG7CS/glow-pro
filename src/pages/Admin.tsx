import { useState, useEffect, useCallback, useMemo } from "react";
import { generateClient } from "aws-amplify/api";
import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  getCurrentUser,
  fetchAuthSession,
} from "aws-amplify/auth";
import { CheckCircle2, XCircle, Clock, RefreshCw, LogOut, ArrowRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

// Inline so codegen regenerating queries.js / mutations.js never breaks this page
const adminListShops = /* GraphQL */ `
  query AdminListShops($limit: Int, $nextToken: String) {
    listShops(limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        category
        neighborhood
        coverPhotoKey
        verified
        recruitedBy
        owner
        createdAt
      }
      nextToken
    }
  }
`;

const adminSetVerified = /* GraphQL */ `
  mutation AdminSetVerified($id: ID!, $verified: Boolean) {
    updateShop(input: { id: $id, verified: $verified }) {
      id
      name
      verified
    }
  }
`;

// Lazy singleton — never call generateClient() before Amplify.configure()
let _client: ReturnType<typeof generateClient> | null = null;
const getClient = () => (_client ??= generateClient());

// ── Types ──────────────────────────────────────────────────────────────────

type ShopStatus = "pending" | "approved" | "rejected";

interface AdminShop {
  id: string;
  name: string;
  category: string;
  neighborhood: string;
  coverPhotoKey: string | null;
  verified: boolean | null;
  recruitedBy?: string | null;
  owner: string | null;
  createdAt: string;
}

type AdminPanelTab = "shops" | "recruiters" | "leaderboard" | "analytics";

interface RecruiterUser {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt?: string;
  approvedAt?: string;
}

interface RecruiterStats extends RecruiterUser {
  totalRecruited: number;
  approved: number;
  pending: number;
}

const RECRUITER_API = "https://dcc37ju19j.execute-api.us-east-1.amazonaws.com/prod";

const getStatus = (verified: boolean | null | undefined): ShopStatus => {
  if (verified === true) return "approved";
  if (verified === false) return "rejected";
  return "pending";
};

const GREEN = "#d97706";
const AMBER = "#ca8a04";
const RED_ST = "#ef4444";

const monthYearFmt = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });

function monthStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

/** Cumulative business count at end of each month (from first shop through today). */
function buildCumulativeByMonth(shopList: AdminShop[]): { month: string; total: number }[] {
  if (!shopList.length) return [];
  const sorted = [...shopList].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  let cur = monthStart(new Date(sorted[0].createdAt));
  const end = monthStart(new Date());
  const out: { month: string; total: number }[] = [];
  while (cur <= end) {
    const eom = endOfMonth(cur);
    const total = shopList.filter((s) => new Date(s.createdAt) <= eom).length;
    out.push({ month: monthYearFmt.format(cur), total });
    cur = addMonths(cur, 1);
  }
  return out;
}

function aggregateField(shopList: AdminShop[], key: "category" | "neighborhood"): { name: string; count: number }[] {
  const m = new Map<string, number>();
  for (const s of shopList) {
    const raw = key === "category" ? s.category : s.neighborhood;
    const label = raw?.trim() || (key === "category" ? "Uncategorized" : "Unknown");
    m.set(label, (m.get(label) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/** Last 8 calendar weeks from Monday (oldest → newest). */
function buildWeeklyBuckets(shopList: AdminShop[]): { label: string; count: number }[] {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const thisMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset, 0, 0, 0, 0);
  const weeks: { label: string; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = new Date(thisMonday);
    start.setDate(thisMonday.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const count = shopList.filter((s) => {
      const t = new Date(s.createdAt).getTime();
      return t >= start.getTime() && t < end.getTime();
    }).length;
    const label = `${String(start.getDate()).padStart(2, "0")}/${String(start.getMonth() + 1).padStart(2, "0")}`;
    weeks.push({ label, count });
  }
  return weeks;
}

// ── Root ───────────────────────────────────────────────────────────────────

const Admin = () => {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  // Restore session if admin is already signed in to Cognito
  useEffect(() => {
    const check = async () => {
      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();
        const groups: string[] =
          (session.tokens?.idToken?.payload["cognito:groups"] as string[]) ?? [];
        if (user && groups.includes("Admins")) {
          setAuthed(true);
        }
      } catch {
        // Not signed in — show login form
      } finally {
        setChecking(false);
      }
    };
    check();
  }, []);

  const handleSignOut = async () => {
    try { await amplifySignOut({ global: false }); } catch { /* ignore */ }
    setAuthed(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return <AdminDashboard onSignOut={handleSignOut} />;
};

// ── Login ──────────────────────────────────────────────────────────────────

const AdminLogin = ({ onSuccess }: { onSuccess: () => void }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await amplifySignIn({ username: identifier.trim(), password });

      // Verify the signed-in user is actually in the Admins group
      const session = await fetchAuthSession({ forceRefresh: true });
      const groups: string[] =
        (session.tokens?.idToken?.payload["cognito:groups"] as string[]) ?? [];

      if (!groups.includes("Admins")) {
        await amplifySignOut({ global: false });
        setError("Your account does not have admin access.");
        return;
      }

      onSuccess();
    } catch (err: any) {
      const code = err?.name ?? "";
      if (code === "NotAuthorizedException" || code === "UserNotFoundException") {
        setError("Incorrect email or password.");
      } else {
        setError(err?.message ?? "Sign in failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-border p-8">
        <div className="mb-8">
          <span className="text-primary text-xl font-bold tracking-tight">Glow</span>
          <span className="text-foreground text-xl font-bold tracking-tight">Pro</span>
          <p className="text-xs text-muted-foreground mt-0.5">Admin panel</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin@example.com"
              autoFocus
              required
              className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Dashboard ──────────────────────────────────────────────────────────────

const AdminDashboard = ({ onSignOut }: { onSignOut: () => void }) => {
  const [shops, setShops] = useState<AdminShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [tab, setTab] = useState<ShopStatus | "all">("pending");
  const [panelTab, setPanelTab] = useState<AdminPanelTab>("shops");
  const [pendingRecruiters, setPendingRecruiters] = useState<RecruiterUser[]>([]);
  const [approvedRecruiters, setApprovedRecruiters] = useState<RecruiterUser[]>([]);
  const [recruitersLoading, setRecruitersLoading] = useState(false);
  const [recruiterActionId, setRecruiterActionId] = useState<string | null>(null);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    setActionError("");
    try {
      const result = await getClient().graphql({
        query: adminListShops,
        variables: { limit: 200 },
        authMode: "userPool",
      });
      setShops((result as any).data?.listShops?.items ?? []);
    } catch (err: any) {
      const items = (err as any)?.data?.listShops?.items;
      if (items) {
        setShops(items);
      } else {
        setActionError(err?.message ?? "Failed to load shops.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchShops(); }, [fetchShops]);

  const callRecruiterApi = useCallback(
    async (action: "listPending" | "listApproved" | "approve" | "reject", username?: string) => {
      let body: string;
      if (action === "listPending") {
        body = JSON.stringify({ action: "listPending" });
      } else if (action === "listApproved") {
        body = JSON.stringify({ action: "listApproved" });
      } else if (action === "approve") {
        if (!username?.trim()) throw new Error("Missing username for approve.");
        body = JSON.stringify({ action: "approve", username });
      } else {
        if (!username?.trim()) throw new Error("Missing username for reject.");
        body = JSON.stringify({ action: "reject", username });
      }

      const res = await fetch(RECRUITER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message ?? `Request failed (${res.status})`);
      }
      return data;
    },
    [],
  );

  const fetchRecruiterGroup = useCallback(
    async (groupName: "RecruitersPending" | "Recruiters"): Promise<RecruiterUser[]> => {
      const action = groupName === "RecruitersPending" ? "listPending" : "listApproved";
      const result = await callRecruiterApi(action);
      return (Array.isArray(result) ? result : ((result as any)?.users ?? [])).map((u: any) => ({
        username: u.username,
        fullName: u.fullName || u.attributes?.["custom:fullName"] || "Unknown recruiter",
        email: u.email || u.attributes?.email || "-",
        phone: u.phone || u.attributes?.["custom:phone"] || "-",
        createdAt: u.createdAt || u.dateApplied,
        approvedAt: u.approvedAt || u.dateApproved || u.updatedAt,
      }));
    },
    [callRecruiterApi],
  );

  const fetchRecruiters = useCallback(async () => {
    setRecruitersLoading(true);
    setActionError("");
    try {
      const [pending, approved] = await Promise.all([
        fetchRecruiterGroup("RecruitersPending"),
        fetchRecruiterGroup("Recruiters"),
      ]);
      setPendingRecruiters(pending);
      setApprovedRecruiters(approved);
    } catch (err: any) {
      setActionError(err?.message ?? "Failed to load recruiters.");
      setPendingRecruiters([]);
      setApprovedRecruiters([]);
    } finally {
      setRecruitersLoading(false);
    }
  }, [fetchRecruiterGroup]);

  useEffect(() => {
    if (panelTab === "recruiters" || panelTab === "leaderboard" || panelTab === "analytics") {
      void fetchRecruiters();
      if (!shops.length) void fetchShops();
    }
  }, [panelTab, fetchRecruiters, fetchShops, shops.length]);

  const setVerified = async (id: string, verified: boolean | null) => {
    console.log("approve clicked", { id, verified });
    setPendingId(id);
    setActionError("");
    try {
      let updated: any;
      try {
        const result = await getClient().graphql({
          query: adminSetVerified,
          variables: { id, verified },
          authMode: "userPool",
        });
        console.log("approve response:", result);
        updated = (result as any).data?.updateShop;
      } catch (err: any) {
        console.error("approve error:", err);
        console.log("approve response (from error):", err?.data);
        // Amplify v6 throws on any errors[] entry even when write succeeded
        if (err?.data?.updateShop) {
          updated = err.data.updateShop;
        } else {
          throw err;
        }
      }

      if (!updated) throw new Error("Mutation returned no data.");

      setShops((prev) =>
        prev.map((s) => (s.id === id ? { ...s, verified } : s))
      );
    } catch (err: any) {
      console.error("approve error (outer):", err);
      setActionError(err?.message ?? "Update failed.");
    } finally {
      setPendingId(null);
    }
  };

  const counts = {
    all: shops.length,
    pending: shops.filter((s) => getStatus(s.verified) === "pending").length,
    approved: shops.filter((s) => getStatus(s.verified) === "approved").length,
    rejected: shops.filter((s) => getStatus(s.verified) === "rejected").length,
  };

  const visible =
    tab === "all" ? shops : shops.filter((s) => getStatus(s.verified) === tab);

  const recruiterStats: RecruiterStats[] = approvedRecruiters
    .map((recruiter) => {
      const owned = shops.filter((s) => (s.recruitedBy ?? "") === recruiter.username);
      const approved = owned.filter((s) => getStatus(s.verified) === "approved").length;
      const pending = owned.filter((s) => getStatus(s.verified) === "pending").length;
      return {
        ...recruiter,
        totalRecruited: owned.length,
        approved,
        pending,
      };
    })
    .sort((a, b) => b.totalRecruited - a.totalRecruited);

  const growthByMonth = useMemo(() => buildCumulativeByMonth(shops), [shops]);

  const approvalPieData = useMemo(
    () => [
      { key: "approved", name: "Approved", value: counts.approved, fill: GREEN },
      { key: "pending", name: "Pending", value: counts.pending, fill: AMBER },
      { key: "rejected", name: "Rejected", value: counts.rejected, fill: RED_ST },
    ],
    [counts.approved, counts.pending, counts.rejected],
  );

  const approvalChartConfig = {
    approved: { label: "Approved", color: GREEN },
    pending: { label: "Pending", color: AMBER },
    rejected: { label: "Rejected", color: RED_ST },
  } satisfies ChartConfig;

  const categoryBars = useMemo(() => aggregateField(shops, "category"), [shops]);
  const neighborhoodBars = useMemo(() => aggregateField(shops, "neighborhood"), [shops]);

  const barChartConfig = {
    count: { label: "Businesses", color: GREEN },
  } satisfies ChartConfig;

  const lineChartConfig = {
    total: { label: "Total", color: GREEN },
  } satisfies ChartConfig;

  const weeklyActivity = useMemo(() => buildWeeklyBuckets(shops), [shops]);

  const recruiterBars = useMemo(
    () =>
      recruiterStats.map((r) => ({
        name: r.fullName.length > 18 ? `${r.fullName.slice(0, 18)}…` : r.fullName,
        count: r.totalRecruited,
      })),
    [recruiterStats],
  );

  const approvalTotal = counts.approved + counts.pending + counts.rejected;

  const handleApproveRecruiter = async (username: string) => {
    setRecruiterActionId(username);
    setActionError("");
    try {
      await callRecruiterApi("approve", username);
      await fetchRecruiters();
    } catch (err: any) {
      setActionError(err?.message ?? "Failed to approve recruiter.");
    } finally {
      setRecruiterActionId(null);
    }
  };

  const handleRejectRecruiter = async (username: string) => {
    setRecruiterActionId(username);
    setActionError("");
    try {
      await callRecruiterApi("reject", username);
      await fetchRecruiters();
    } catch (err: any) {
      setActionError(err?.message ?? "Failed to reject recruiter.");
    } finally {
      setRecruiterActionId(null);
    }
  };

  const handleRefresh = () => {
    if (panelTab === "shops") {
      void fetchShops();
      return;
    }
    void Promise.all([fetchRecruiters(), fetchShops()]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="flex flex-nowrap items-center justify-between gap-3 border-b border-border bg-white px-4 py-4 sm:px-6">
        <div className="min-w-0 shrink-0 whitespace-nowrap">
          <span className="text-primary font-bold">Glow</span>
          <span className="text-foreground font-bold">Pro</span>
          <span className="ml-2 whitespace-nowrap text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
            Admin
          </span>
        </div>
        <div className="flex flex-nowrap items-center gap-1 sm:gap-3">
          <button
            type="button"
            aria-label="Refresh"
            onClick={handleRefresh}
            className="flex flex-nowrap items-center gap-1.5 whitespace-nowrap rounded-md p-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:p-0"
          >
            <RefreshCw className="h-4 w-4 shrink-0 md:h-3.5 md:w-3.5" aria-hidden />
            <span className="hidden md:inline">Refresh</span>
          </button>
          <button
            type="button"
            aria-label="Sign out"
            onClick={onSignOut}
            className="flex flex-nowrap items-center gap-1.5 whitespace-nowrap rounded-md p-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:p-0"
          >
            <ArrowRight className="h-4 w-4 shrink-0 md:hidden" aria-hidden />
            <LogOut className="hidden h-3.5 w-3.5 shrink-0 md:inline" aria-hidden />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 w-full overflow-x-auto scrollbar-hide md:overflow-visible">
          <div className="flex w-fit min-w-max gap-1 rounded-xl border border-border bg-white p-1 shadow-sm">
            {([
              { key: "shops", label: "Profiles" },
              { key: "recruiters", label: "Recruiters" },
              { key: "leaderboard", label: "Leaderboard" },
              { key: "analytics", label: "Analytics" },
            ] as const).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setPanelTab(item.key)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors md:px-4 md:py-1.5 ${
                  panelTab === item.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {actionError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-5 py-3 mb-5 text-sm text-destructive">
            {actionError}
          </div>
        )}

        {panelTab === "shops" && (
          <>
            <h1 className="text-xl font-bold text-foreground mb-6">Profiles</h1>

            <div className="mb-5 w-full overflow-x-auto scrollbar-hide md:w-fit">
              <div className="flex w-fit min-w-max gap-1 rounded-xl border border-border bg-white p-1 shadow-sm">
                {(["pending", "approved", "rejected", "all"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors md:px-4 md:py-1.5 ${
                      tab === t
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
                    <span className="ml-1.5 text-xs opacity-70">({counts[t]})</span>
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <>
                <div className="hidden md:block">
                  <ShopListingsTableSkeleton />
                </div>
                <div className="space-y-3 md:hidden">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="mb-3 rounded-xl bg-white p-4 shadow-sm">
                      <div className="flex gap-3">
                        <Skeleton className="size-12 shrink-0 rounded-lg" />
                        <div className="min-w-0 flex-1 space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-56" />
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : visible.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                {tab === "all" ? "No listings" : `No ${tab} listings`}
              </p>
            ) : (
              <>
                <div className="hidden md:block">
                  <Card className="overflow-hidden rounded-xl shadow-sm">
                    <CardContent className="p-0">
                      <Table className="min-w-[920px]">
                    <TableHeader>
                      <TableRow className="border-b-0 hover:bg-transparent">
                        <TableHead className="bg-muted/70 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Salon name
                        </TableHead>
                        <TableHead className="bg-muted/70 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Category
                        </TableHead>
                        <TableHead className="bg-muted/70 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Neighborhood
                        </TableHead>
                        <TableHead className="bg-muted/70 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Submitted
                        </TableHead>
                        <TableHead className="bg-muted/70 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Status
                        </TableHead>
                        <TableHead className="bg-muted/70 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visible.map((shop, i) => {
                        const status = getStatus(shop.verified);
                        const submittedLabel = new Date(shop.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        });
                        const busy = pendingId === shop.id;
                        return (
                          <TableRow
                            key={shop.id}
                            className={cn(
                              i % 2 === 1 ? "bg-muted/25" : "bg-background",
                              "hover:bg-muted/40",
                            )}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="size-10 shrink-0 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                                  {shop.coverPhotoKey ? (
                                    <img
                                      src={shop.coverPhotoKey}
                                      alt=""
                                      className="size-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-lg leading-none">🏪</span>
                                  )}
                                </div>
                                <span className="font-bold text-foreground">{shop.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{shop.category}</TableCell>
                            <TableCell className="text-muted-foreground">{shop.neighborhood}</TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {submittedLabel}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "capitalize",
                                  status === "approved" &&
                                    "border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100",
                                  status === "pending" &&
                                    "border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100",
                                  status === "rejected" &&
                                    "border-red-200 bg-red-100 text-red-800 hover:bg-red-100",
                                )}
                              >
                                {status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                {status !== "approved" && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-amber-700 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                                    onClick={() => setVerified(shop.id, true)}
                                    disabled={busy}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Approve
                                  </Button>
                                )}
                                {status !== "rejected" && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-destructive text-destructive hover:bg-destructive/10"
                                    onClick={() => setVerified(shop.id, false)}
                                    disabled={busy}
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    Reject
                                  </Button>
                                )}
                                {status !== "pending" && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setVerified(shop.id, null)}
                                    disabled={busy}
                                  >
                                    <Clock className="w-3.5 h-3.5" />
                                    Reset
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-3 md:hidden">
                  {visible.map((shop) => {
                    const status = getStatus(shop.verified);
                    const submittedLabel = new Date(shop.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                    const busy = pendingId === shop.id;
                    const showApprove = status !== "approved";
                    const showReject = status !== "rejected";
                    return (
                      <div key={shop.id} className="mb-3 rounded-xl bg-white p-4 shadow-sm">
                        <div className="flex gap-3">
                          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                            {shop.coverPhotoKey ? (
                              <img src={shop.coverPhotoKey} alt="" className="size-full object-cover" />
                            ) : (
                              <span className="text-lg leading-none">🏪</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground">{shop.name}</p>
                            <p className="text-sm text-gray-500">
                              {shop.category} · {shop.neighborhood}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">Submitted: {submittedLabel}</p>
                            <div className="mt-2">
                              <span className="text-sm text-gray-500">Status: </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "capitalize",
                                  status === "approved" &&
                                    "border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100",
                                  status === "pending" &&
                                    "border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100",
                                  status === "rejected" &&
                                    "border-red-200 bg-red-100 text-red-800 hover:bg-red-100",
                                )}
                              >
                                {status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {showApprove && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={cn(
                                "w-full border-amber-700 text-amber-700 hover:bg-amber-50 hover:text-amber-800",
                                !showReject && "col-span-2",
                              )}
                              onClick={() => setVerified(shop.id, true)}
                              disabled={busy}
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                              Approve
                            </Button>
                          )}
                          {showReject && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={cn(
                                "w-full border-destructive text-destructive hover:bg-destructive/10",
                                !showApprove && "col-span-2",
                              )}
                              onClick={() => setVerified(shop.id, false)}
                              disabled={busy}
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" />
                              Reject
                            </Button>
                          )}
                          {status !== "pending" && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="col-span-2 w-full"
                              onClick={() => setVerified(shop.id, null)}
                              disabled={busy}
                            >
                              <Clock className="mr-1 h-3.5 w-3.5" />
                              Reset
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {panelTab === "recruiters" && (
          <div className="space-y-10">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-foreground flex flex-wrap items-center gap-2 mb-4">
                Pending Applications
                <Badge variant="secondary" className="tabular-nums">
                  {pendingRecruiters.length}
                </Badge>
              </h2>
              {recruitersLoading ? (
                <RecruiterTableSkeleton
                  columns={["Name", "Email", "Phone", "Date Applied", "Actions"]}
                />
              ) : pendingRecruiters.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No pending applications 🎉</p>
              ) : (
                <Card className="overflow-hidden rounded-xl shadow-sm">
                  <CardContent className="p-0">
                    <Table className="min-w-[720px]">
                      <TableHeader>
                        <TableRow className="border-b-0 hover:bg-transparent">
                          <TableHead className="bg-muted/70 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Name
                          </TableHead>
                          <TableHead className="bg-muted/70 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Email
                          </TableHead>
                          <TableHead className="bg-muted/70 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Phone
                          </TableHead>
                          <TableHead className="bg-muted/70 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Date Applied
                          </TableHead>
                          <TableHead className="bg-muted/70 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingRecruiters.map((r, i) => (
                          <TableRow
                            key={r.username}
                            className={cn(
                              i % 2 === 1 ? "bg-muted/25" : "bg-background",
                              "hover:bg-muted/40",
                            )}
                          >
                            <TableCell className="font-bold text-foreground">{r.fullName}</TableCell>
                            <TableCell className="max-w-[200px] break-all text-muted-foreground">
                              {r.email}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">{r.phone}</TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-GB") : "—"}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="border-amber-700 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                                  onClick={() => handleApproveRecruiter(r.username)}
                                  disabled={recruiterActionId === r.username}
                                >
                                  Approve
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="border-destructive text-destructive hover:bg-destructive/10"
                                  onClick={() => handleRejectRecruiter(r.username)}
                                  disabled={recruiterActionId === r.username}
                                >
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-bold text-foreground flex flex-wrap items-center gap-2 mb-4">
                Active Recruiters
                <Badge variant="secondary" className="tabular-nums">
                  {recruiterStats.length}
                </Badge>
              </h2>
              {recruitersLoading ? (
                <RecruiterTableSkeleton columns={["Name", "Email", "Phone", "Date Approved"]} />
              ) : recruiterStats.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No active recruiters yet</p>
              ) : (
                <Card className="overflow-hidden rounded-xl shadow-sm">
                  <CardContent className="p-0">
                    <Table className="min-w-[560px]">
                      <TableHeader>
                        <TableRow className="border-b-0 hover:bg-transparent">
                          <TableHead className="bg-muted/70 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Name
                          </TableHead>
                          <TableHead className="bg-muted/70 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Email
                          </TableHead>
                          <TableHead className="bg-muted/70 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Phone
                          </TableHead>
                          <TableHead className="bg-muted/70 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Date Approved
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recruiterStats.map((r, i) => (
                          <TableRow
                            key={r.username}
                            className={cn(
                              i % 2 === 1 ? "bg-muted/25" : "bg-background",
                              "hover:bg-muted/40",
                            )}
                          >
                            <TableCell className="font-bold text-foreground">{r.fullName}</TableCell>
                            <TableCell className="max-w-[200px] break-all text-muted-foreground">
                              {r.email}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">{r.phone}</TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {r.approvedAt ? new Date(r.approvedAt).toLocaleDateString("en-GB") : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {panelTab === "analytics" &&
          (loading || recruitersLoading ? (
            <AdminAnalyticsSkeleton />
          ) : (
            <div className="space-y-8">
              <h1 className="text-xl font-bold text-foreground flex flex-wrap items-center gap-2">
                Analytics
                <Badge variant="outline" className="font-normal">
                  Overview
                </Badge>
              </h1>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: "Total Businesses", value: shops.length },
                  { label: "Approved Businesses", value: counts.approved },
                  { label: "Total Recruiters", value: approvedRecruiters.length },
                  { label: "Pending Applications", value: pendingRecruiters.length },
                ].map((s) => (
                  <Card key={s.label} className="rounded-xl shadow-sm">
                    <CardContent className="pt-6">
                      <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{s.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-xl shadow-sm">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-base font-semibold">Businesses over time</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {growthByMonth.length === 0 ? (
                      <p className="py-16 text-center text-sm text-muted-foreground">No business data yet</p>
                    ) : (
                      <ChartContainer config={lineChartConfig} className="h-[260px] w-full">
                        <LineChart data={growthByMonth} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                          <CartesianGrid horizontal={false} vertical={false} />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                          <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} allowDecimals={false} />
                          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                          <Line
                            type="monotone"
                            dataKey="total"
                            stroke="var(--color-total)"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                          />
                        </LineChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-xl shadow-sm">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-base font-semibold">Approval rate</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {approvalTotal === 0 ? (
                      <p className="py-16 text-center text-sm text-muted-foreground">No business data yet</p>
                    ) : (
                      <>
                        <ChartContainer config={approvalChartConfig} className="mx-auto h-[220px] w-full max-w-[280px]">
                          <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            <Pie
                              data={approvalPieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={48}
                              outerRadius={72}
                              paddingAngle={2}
                              strokeWidth={0}
                            >
                              {approvalPieData.map((entry) => (
                                <Cell key={entry.key} fill={entry.fill} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ChartContainer>
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2 text-xs text-muted-foreground">
                          {approvalPieData.map((d) => {
                            const pct = approvalTotal ? Math.round((d.value / approvalTotal) * 100) : 0;
                            return (
                              <span key={d.key} className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: d.fill }} />
                                <span className="text-foreground">{d.name}</span>
                                <span className="tabular-nums">
                                  {d.value} ({pct}%)
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-xl shadow-sm">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-base font-semibold">Business categories</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {categoryBars.length === 0 ? (
                      <p className="py-16 text-center text-sm text-muted-foreground">No business data yet</p>
                    ) : (
                      <ChartContainer
                        config={barChartConfig}
                        className="w-full min-h-[240px]"
                        style={{ height: Math.max(240, categoryBars.length * 28) }}
                      >
                        <BarChart
                          layout="vertical"
                          data={categoryBars}
                          margin={{ left: 4, right: 12, top: 8, bottom: 8 }}
                        >
                          <CartesianGrid horizontal={false} vertical={false} />
                          <XAxis type="number" hide />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={110}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11 }}
                          />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]} fill={GREEN} />
                        </BarChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-xl shadow-sm">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-base font-semibold">Neighborhood coverage</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {neighborhoodBars.length === 0 ? (
                      <p className="py-16 text-center text-sm text-muted-foreground">No business data yet</p>
                    ) : (
                      <ChartContainer config={barChartConfig} className="h-[260px] w-full">
                        <BarChart
                          layout="vertical"
                          data={neighborhoodBars}
                          margin={{ left: 4, right: 12, top: 8, bottom: 8 }}
                        >
                          <CartesianGrid horizontal={false} vertical={false} />
                          <XAxis type="number" hide />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={110}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11 }}
                          />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]} fill={GREEN} />
                        </BarChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-xl shadow-sm">
                <CardHeader className="pb-0">
                  <CardTitle className="text-base font-semibold">Recruiter performance</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {approvedRecruiters.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">No recruiter data yet</p>
                  ) : (
                    <ChartContainer config={barChartConfig} className="h-[280px] w-full">
                      <BarChart data={recruiterBars} margin={{ left: 4, right: 8, top: 8, bottom: 48 }}>
                        <CartesianGrid horizontal={false} vertical={false} />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 10 }}
                          angle={-30}
                          textAnchor="end"
                          height={56}
                          interval={0}
                        />
                        <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={36} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} fill={GREEN} />
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-sm">
                <CardHeader className="pb-0">
                  <CardTitle className="text-base font-semibold">Weekly activity</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {shops.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                      Not enough data to show weekly trends yet
                    </p>
                  ) : (
                    <ChartContainer config={barChartConfig} className="h-[260px] w-full">
                      <AreaChart data={weeklyActivity} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="adminWeeklyFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={GREEN} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid horizontal={false} vertical={false} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={36} />
                        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke={GREEN}
                          strokeWidth={2}
                          fill="url(#adminWeeklyFill)"
                        />
                      </AreaChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}

        {panelTab === "leaderboard" && (
          <div className="bg-white rounded-2xl border border-border p-5">
            <h2 className="text-base font-bold text-foreground mb-4">Recruiter Leaderboard 🏆</h2>
            {recruitersLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : recruiterStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                The leaderboard is empty — approve some recruiters first!
              </p>
            ) : (
              <div className="space-y-2">
                <div className="hidden md:grid md:grid-cols-6 gap-3 px-3 text-xs font-semibold text-muted-foreground">
                  <span>Rank</span>
                  <span>Name</span>
                  <span>Recruited</span>
                  <span>Approved</span>
                  <span>Pending</span>
                  <span>Approval Rate</span>
                </div>
                {recruiterStats.map((r, index) => {
                  const rate = r.totalRecruited === 0 ? 0 : Math.round((r.approved / r.totalRecruited) * 100);
                  const rank = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : String(index + 1);
                  return (
                    <div
                      key={r.username}
                      className={`grid grid-cols-2 md:grid-cols-6 gap-3 rounded-xl border px-3 py-3 ${
                        index === 0 ? "bg-amber-50 border-amber-200" : "bg-white border-border"
                      }`}
                    >
                      <span className="text-sm font-semibold text-foreground">{rank}</span>
                      <span className="text-sm font-medium text-foreground truncate">{r.fullName}</span>
                      <span className="text-sm text-foreground">{r.totalRecruited}</span>
                      <span className="text-sm text-amber-700 font-semibold">{r.approved}</span>
                      <span className="text-sm text-amber-700 font-semibold">{r.pending}</span>
                      <span className="text-sm text-foreground">{rate}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/** Analytics tab loading layout (stat cards + chart placeholders). */
const AdminAnalyticsSkeleton = () => (
  <div className="space-y-8">
    <div className="flex flex-wrap items-center gap-2">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="rounded-xl shadow-sm">
          <CardContent className="space-y-2 pt-6">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-14" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      {[1, 2].map((i) => (
        <Card key={i} className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="h-[240px] w-full rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      {[1, 2].map((i) => (
        <Card key={`row2-${i}`} className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-44" />
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="h-[220px] w-full rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-[280px] w-full rounded-md" />
      </CardContent>
    </Card>
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-[260px] w-full rounded-md" />
      </CardContent>
    </Card>
  </div>
);

/** Profiles table loading state. */
const ShopListingsTableSkeleton = () => {
  const columns = [
    "Name",
    "Category",
    "Neighborhood",
    "Submitted",
    "Status",
    "Actions",
  ] as const;
  return (
    <Card className="overflow-hidden rounded-xl shadow-sm">
      <CardContent className="p-0">
        <Table className="min-w-[920px]">
          <TableHeader>
            <TableRow className="border-b-0 hover:bg-transparent">
              {columns.map((label) => (
                <TableHead
                  key={label}
                  className={cn(
                    "bg-muted/70 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
                    label === "Actions" && "text-right",
                  )}
                >
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[0, 1, 2].map((row) => (
              <TableRow
                key={row}
                className={cn(row % 2 === 1 ? "bg-muted/25" : "bg-background", "hover:bg-transparent")}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 shrink-0 rounded-md" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                </TableCell>
                {columns.slice(1, -2).map((label) => (
                  <TableCell key={`${row}-${label}`}>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                ))}
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

/** Loading placeholder: Card + Table with 3 skeleton body rows. */
const RecruiterTableSkeleton = ({ columns }: { columns: string[] }) => (
  <Card className="overflow-hidden rounded-xl shadow-sm">
    <CardContent className="p-0">
      <Table className={cn(columns.length >= 5 ? "min-w-[720px]" : "min-w-[560px]")}>
        <TableHeader>
          <TableRow className="border-b-0 hover:bg-transparent">
            {columns.map((label) => (
              <TableHead
                key={label}
                className="bg-muted/70 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[0, 1, 2].map((row) => (
            <TableRow
              key={row}
              className={cn(row % 2 === 1 ? "bg-muted/25" : "bg-background", "hover:bg-transparent")}
            >
              {columns.map((label, col) => (
                <TableCell key={`${row}-${label}`}>
                  <Skeleton className={cn("h-4", col === 0 ? "w-32" : "w-24")} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default Admin;
