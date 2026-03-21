import { Eye, Heart, Phone, MessageCircle, Pencil, BarChart3, Clock, XCircle } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import type { BizFormData } from "@/types/biz";
import type { DashboardTab } from "@/pages/BusinessDashboard";
import { useShopEvents } from "@/hooks/useShopEvents";

interface Props {
  business: BizFormData;
  setTab: (t: DashboardTab) => void;
  businessId?: string;
}

const FLAT = [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }];

// Build a 7-point sparkline from events for a given set of eventTypes
function buildSparkline(events: { eventType: string; createdAt: string }[], types: string[]) {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - i));
    const dayStr = date.toISOString().split("T")[0];
    const v = events.filter(
      (e) => types.includes(e.eventType) && e.createdAt.startsWith(dayStr)
    ).length;
    return { v };
  });
}

type ModerationState = "pending" | "approved" | "rejected" | "incomplete";

const getModerationState = (b: BizFormData): ModerationState => {
  if (!b.businessName || !b.category) return "incomplete";
  if (b.verified === true) return "approved";
  if (b.verified === false) return "rejected";
  return "pending";
};

const DashboardOverview = ({ business, setTab, businessId }: Props) => {
  const state = getModerationState(business);
  const { data: events = [] } = useShopEvents(businessId);

  const views = events.filter((e) => e.eventType === "view").length;
  const whatsappTaps = events.filter((e) => e.eventType === "whatsapp").length;
  const callTaps = events.filter((e) => e.eventType === "call").length;
  const totalInteractions =
    views + whatsappTaps + callTaps + events.filter((e) => e.eventType === "email").length;

  const metrics = [
    {
      icon: <Eye className="w-4 h-4" />,
      label: "Profile views",
      value: String(views),
      sparkline: buildSparkline(events, ["view"]),
    },
    {
      icon: <MessageCircle className="w-4 h-4" />,
      label: "WhatsApp taps",
      value: String(whatsappTaps),
      sparkline: buildSparkline(events, ["whatsapp"]),
    },
    {
      icon: <Phone className="w-4 h-4" />,
      label: "Call taps",
      value: String(callTaps),
      sparkline: buildSparkline(events, ["call"]),
    },
    {
      icon: <Heart className="w-4 h-4" />,
      label: "Saves",
      value: "0",
      sparkline: FLAT,
    },
  ];

  const activitySparkline = buildSparkline(events, ["view", "whatsapp", "call", "email"]);

  return (
    <div className="space-y-5">
      <StatusBanner state={state} businessName={business.businessName} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-2xl px-5 pt-5 pb-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 mb-3">
              {m.icon}
            </div>
            <p className="text-2xl font-bold text-foreground leading-none">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-1 mb-3">{m.label}</p>
            <div className="h-10 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={m.sparkline}>
                  <defs>
                    <linearGradient id={`g-${m.label}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d97706" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#d97706"
                    strokeWidth={1.5}
                    fill={`url(#g-${m.label})`}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl px-6 py-5 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-foreground">Weekly activity</h3>
          <span className="text-xs text-muted-foreground">Last 7 days</span>
        </div>
        <p className="text-3xl font-bold text-foreground mb-1">{totalInteractions}</p>
        <p className="text-xs text-muted-foreground mb-5">total interactions</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activitySparkline}>
              <defs>
                <linearGradient id="activity-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d97706" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#d97706" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#d97706"
                strokeWidth={2}
                fill="url(#activity-grad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {totalInteractions === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            No activity yet — share your listing to start getting views
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setTab("edit")}
          className="bg-white rounded-2xl px-5 py-4 shadow-sm text-left hover:shadow-md transition-shadow group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 mb-3 group-hover:bg-amber-100 transition-colors">
            <Pencil className="w-4 h-4" />
          </div>
          <p className="text-sm font-semibold text-foreground">Edit your listing</p>
          <p className="text-xs text-muted-foreground mt-0.5">Update photos, hours, contact info</p>
        </button>

        <button
          onClick={() => setTab("stats")}
          className="bg-white rounded-2xl px-5 py-4 shadow-sm text-left hover:shadow-md transition-shadow group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 mb-3 group-hover:bg-amber-100 transition-colors">
            <BarChart3 className="w-4 h-4" />
          </div>
          <p className="text-sm font-semibold text-foreground">View detailed stats</p>
          <p className="text-xs text-muted-foreground mt-0.5">See how clients find and contact you</p>
        </button>
      </div>
    </div>
  );
};

// ── Status banner ─────────────────────────────────────────────────────────────

const StatusBanner = ({
  state,
  businessName,
}: {
  state: ModerationState;
  businessName: string;
}) => {
  if (state === "approved") {
    return (
      <div className="bg-white rounded-2xl px-6 py-5 shadow-sm flex items-center gap-4">
        <div className="w-1 self-stretch rounded-full bg-amber-600 flex-shrink-0" />
        <div>
          <h2 className="text-base font-bold text-foreground">{businessName || "Your profile"}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your profile is live · Clients can find you on GlowPro
          </p>
        </div>
        <span className="ml-auto shrink-0 text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
          Live
        </span>
      </div>
    );
  }

  if (state === "pending") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5 flex items-start gap-4">
        <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h2 className="text-base font-bold text-amber-900">
            {businessName || "Your listing"} is under review
          </h2>
          <p className="text-sm text-amber-800 mt-1">
            We'll notify you once it's approved — usually within 24 hours. Your listing won't appear
            publicly until it's reviewed.
          </p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
          Pending
        </span>
      </div>
    );
  }

  if (state === "rejected") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-5 flex items-start gap-4">
        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-base font-bold text-red-900">Listing not approved</h2>
          <p className="text-sm text-red-800 mt-1">
            Your listing didn't meet our guidelines. Update your listing and contact us if you think
            this was a mistake.
          </p>
        </div>
        <span className="ml-auto shrink-0 text-xs font-semibold text-red-700 bg-red-100 px-2.5 py-1 rounded-full border border-red-200">
          Rejected
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl px-6 py-5 shadow-sm flex items-center gap-4">
      <div className="w-1 self-stretch rounded-full bg-yellow-400 flex-shrink-0" />
      <div>
        <h2 className="text-base font-bold text-foreground">{businessName || "Your profile"}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Complete your profile to start attracting clients
        </p>
      </div>
      <span className="ml-auto shrink-0 text-xs font-semibold text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full">
        Incomplete
      </span>
    </div>
  );
};

export default DashboardOverview;
