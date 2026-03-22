import { useState, useRef, useEffect } from "react";
import { LayoutDashboard, LogOut, Menu, Pencil } from "lucide-react";
import DashboardSidebar from "@/components/biz/DashboardSidebar";
import DashboardOverview from "@/components/biz/DashboardOverview";
import DashboardEditListing from "@/components/biz/DashboardEditListing";
import DashboardStats from "@/components/biz/DashboardStats";
import DashboardAccount from "@/components/biz/DashboardAccount";
import DashboardBookings from "@/components/biz/DashboardBookings";
import LivePreview from "@/components/biz/LivePreview";
import type { BizFormData } from "@/types/biz";
import { BIZ_FORM_INITIAL } from "@/types/biz";
import { useMybusiness } from "@/hooks/useMyShop";
import { useAuthState } from "@/hooks/useAuthState";

export type DashboardTab = "overview" | "edit" | "stats" | "bookings" | "account";

const TAB_LABELS: Record<DashboardTab, string> = {
  overview: "Dashboard",
  edit: "Edit listing",
  stats: "Stats",
  bookings: "Bookings",
  account: "Account",
};

const BusinessDashboard = () => {
  const [tab, setTab] = useState<DashboardTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: remoteBusiness, isLoading } = useMybusiness();
  const [form, setForm] = useState<BizFormData>(BIZ_FORM_INITIAL);
  const [initialized, setInitialized] = useState(false);
  const { identifier, signOut } = useAuthState();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const setTabAndCloseSidebar = (t: DashboardTab) => {
    setTab(t);
    setSidebarOpen(false);
  };

  // Initialize local form state from remote data exactly once
  useEffect(() => {
    if (remoteBusiness && !initialized) {
      setForm(remoteBusiness);
      setInitialized(true);
    }
  }, [remoteBusiness, initialized]);

  const isLive = !!form.businessName && !!form.category;
  const businessId = form.id ?? localStorage.getItem("biz_id") ?? undefined;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = () => {
    // signOut() handles Amplify, localStorage cleanup, and redirect to /biz
    signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <DashboardSidebar
        tab={tab}
        setTab={setTab}
        businessName={form.businessName}
        isLive={isLive}
        className="hidden md:flex"
      />

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            aria-hidden
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-60 rounded-r-2xl shadow-2xl overflow-hidden md:hidden animate-in slide-in-from-left-2 duration-200">
            <DashboardSidebar
              tab={tab}
              setTab={setTabAndCloseSidebar}
              businessName={form.businessName}
              isLive={isLive}
              className="m-0 h-full min-h-0 rounded-none bg-gradient-to-b from-slate-50 to-slate-100"
            />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 md:px-8 pt-8 pb-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center -m-2 rounded-lg hover:bg-slate-200/80 active:bg-slate-200 transition-colors touch-manipulation"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-2xl font-bold text-foreground truncate">{TAB_LABELS[tab]}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity"
              >
                <span className="text-xs font-bold text-white">
                  {identifier?.[0]?.toUpperCase() ?? "U"}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-11 w-56 bg-white border border-border rounded-xl shadow-lg py-2 z-50">
                  {form.businessName && (
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="text-[11px] text-muted-foreground">Business</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {form.businessName}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => { setTab("overview"); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => { setTab("edit"); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                    Edit listing
                  </button>
                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {tab === "edit" ? (
          <div className="flex-1 flex overflow-hidden px-8 pb-8 gap-6">
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl">
                <DashboardEditListing business={form} setbusiness={setForm} />
              </div>
            </div>
            <div className="hidden lg:flex w-[360px] bg-white rounded-2xl flex-col overflow-hidden shadow-sm">
              <div className="px-5 pt-5 pb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Live preview
                </p>
              </div>
              <div className="flex-1 overflow-y-auto px-5 pb-5">
                <LivePreview form={form} />
              </div>
            </div>
          </div>
        ) : (
          <main className="flex-1 overflow-y-auto px-8 pb-8">
            {tab === "overview" && (
              <DashboardOverview business={form} setTab={setTab} businessId={businessId} />
            )}
            {tab === "stats" && (
              <DashboardStats businessName={form.businessName} businessId={businessId} />
            )}
            {tab === "bookings" && <DashboardBookings shopId={businessId} />}
            {tab === "account" && (
              <DashboardAccount businessId={businessId} businessName={form.businessName} />
            )}
          </main>
        )}
      </div>
    </div>
  );
};

export default BusinessDashboard;
