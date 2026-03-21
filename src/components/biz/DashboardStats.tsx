import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Eye, MessageCircle, Bookmark, TrendingUp, Phone, Mail, BarChart3 } from "lucide-react";
import { useMemo } from "react";
import { useShopEvents } from "@/hooks/useShopEvents";

interface Props {
  businessName: string;
  businessId?: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const EMPTY_CHART = DAYS.map((day) => ({ day, views: 0, taps: 0 }));

const EMPTY_CONTACTS: { label: string; value: number; pct: number }[] = [
  { label: "WhatsApp", value: 0, pct: 0 },
  { label: "Calls", value: 0, pct: 0 },
  { label: "Email", value: 0, pct: 0 },
];

const contactIcons: Record<string, React.ReactNode> = {
  WhatsApp: <MessageCircle className="w-4 h-4" />,
  Calls: <Phone className="w-4 h-4" />,
  Email: <Mail className="w-4 h-4" />,
};

const contactColors: Record<string, string> = {
  WhatsApp: "bg-primary",
  Calls: "bg-blue-500",
  Email: "bg-violet-500",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border rounded-xl px-3.5 py-2.5 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const DashboardStats = ({ businessName, businessId }: Props) => {
  const resolvedId = businessId ?? localStorage.getItem("biz_id") ?? undefined;
  const { data: events = [] } = useShopEvents(resolvedId);

  const { data, contacts, totalSaves } = useMemo(() => {

    // Build last-7-days chart data
    const now = new Date();
    const chartData = DAYS.map((day, i) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - i));
      const dayStr = date.toISOString().split("T")[0];
      const dayEvents = events.filter((e) => e.createdAt.startsWith(dayStr));
      return {
        day,
        views: dayEvents.filter((e) => e.eventType === "view").length,
        taps: dayEvents.filter((e) => ["whatsapp", "call", "email"].includes(e.eventType)).length,
      };
    });

    // Contact breakdown
    const whatsapp = events.filter((e) => e.eventType === "whatsapp").length;
    const calls = events.filter((e) => e.eventType === "call").length;
    const email = events.filter((e) => e.eventType === "email").length;
    const total = whatsapp + calls + email || 1;

    const contactBreakdown = [
      { label: "WhatsApp", value: whatsapp, pct: Math.round((whatsapp / total) * 100) },
      { label: "Calls", value: calls, pct: Math.round((calls / total) * 100) },
      { label: "Email", value: email, pct: Math.round((email / total) * 100) },
    ];

    const saves = 0; // Saves tracked locally only via heart icon state — no persistent store yet

    return { data: chartData, contacts: contactBreakdown, totalSaves: saves };
  }, [events]);

  const totalViews = data.reduce((s, d) => s + d.views, 0);
  const totalTaps = data.reduce((s, d) => s + d.taps, 0);
  const hasChartData = totalViews > 0 || totalTaps > 0;
  const hasContactData = contacts.some((c) => c.value > 0);

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          icon={<Eye className="w-4 h-4" />}
          label="Views"
          value={totalViews}
          sub={hasChartData ? "this week" : "No data yet"}
        />
        <MetricCard
          icon={<MessageCircle className="w-4 h-4" />}
          label="Contact taps"
          value={totalTaps}
          sub={hasChartData ? "this week" : "No data yet"}
        />
        <MetricCard
          icon={<Bookmark className="w-4 h-4" />}
          label="Saves"
          value={totalSaves}
          sub={totalSaves > 0 ? "this week" : "No data yet"}
        />
        <MetricCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Avg. daily views"
          value={hasChartData ? Math.round(totalViews / 7) : 0}
          sub={hasChartData ? "this week" : "No data yet"}
        />
      </div>

      {/* Area chart */}
      <div className="border border-border rounded-xl p-5 relative">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Views & contact taps</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Last 7 days</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary/30 inline-block" />
              Views
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" />
              Taps
            </span>
          </div>
        </div>

        <div className="relative">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gTaps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="views"
                name="Views"
                stroke="hsl(var(--primary))"
                strokeWidth={1.5}
                strokeOpacity={0.4}
                fill="url(#gViews)"
              />
              <Area
                type="monotone"
                dataKey="taps"
                name="Taps"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#gTaps)"
              />
            </AreaChart>
          </ResponsiveContainer>

          {!hasChartData && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground">No data yet</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  Chart will populate as your listing gets traffic
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact breakdown */}
      <div className="border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">How customers contacted you</h2>

        {hasContactData ? (
          <div className="space-y-3">
            {contacts.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  {contactIcons[item.label]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-foreground">{item.label}</span>
                    <span className="text-xs font-bold text-foreground">{item.value}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${contactColors[item.label] ?? "bg-primary"} transition-all`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right shrink-0">
                  {item.pct}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {EMPTY_CONTACTS.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground/50 shrink-0">
                  {contactIcons[item.label]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                    <span className="text-xs font-bold text-muted-foreground">0</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden" />
                </div>
                <span className="text-xs text-muted-foreground/50 w-8 text-right shrink-0">
                  0%
                </span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground text-center pt-2">
              No contact events recorded yet
            </p>
          </div>
        )}
      </div>

      {/* Encouragement banner */}
      <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-primary/5 border border-primary/15">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {hasChartData ? (
              <>
                <span className="font-semibold">{businessName || "Your salon"}</span> was
                discovered by{" "}
                <span className="font-semibold text-primary">{totalViews} people</span> this week.
              </>
            ) : (
              "Once your listing gets views, you'll see your analytics here."
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {hasChartData
              ? "Keep it up — more photos = more views."
              : "Share your listing link to start getting traffic."}
          </p>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
}) => (
  <div className="border border-border rounded-xl p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-muted-foreground">{icon}</span>
    </div>
    <p className="text-2xl font-bold text-foreground">
      {value > 0 ? value : <span className="text-muted-foreground">0</span>}
    </p>
    <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    {sub && <p className="text-[10px] text-muted-foreground/70">{sub}</p>}
  </div>
);

export default DashboardStats;
