import { useState, useMemo, useCallback, useRef, useEffect, type CSSProperties } from "react";
import { Store, Menu, X } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import CategoryRibbon from "@/components/CategoryRibbon";
import BusinessSection from "@/components/BusinessSection";
import { usebusinesss } from "@/hooks/useShops";
import { cn } from "@/lib/utils";
import heroCustomerPortrait from "@/assets/images/hero-customer-portrait.jpg";
import heroOwnerPortrait from "@/assets/images/hero-owner-portrait.jpg";
import heroSalonPortrait from "@/assets/images/hero-salon-portrait.jpg";
import heroCustomerLandscape from "@/assets/images/hero-customer-landscape.jpg";
import heroOwnerLandscape from "@/assets/images/hero-owner-landscape.jpg";
import heroSalonLandscape from "@/assets/images/hero-salon-landscape.jpg";
import phoneMockup from "@/assets/images/phone-mockup.png";

const HERO_SLIDES = [
  {
    portrait: heroCustomerPortrait,
    landscape: heroCustomerLandscape,
    alt: "Customer discovering salons in Rwanda",
    headline: "Every stylist in Rwanda, in your pocket.",
    subtitle: "Salons, stylists, and beauty — all in one place.",
  },
  {
    portrait: heroOwnerPortrait,
    landscape: heroOwnerLandscape,
    alt: "Salon owner on GlowPro",
    headline: "Be the stylist everyone books first.",
    subtitle: "Join hundreds of salons and stylists on GlowPro.",
  },
  {
    portrait: heroSalonPortrait,
    landscape: heroSalonLandscape,
    alt: "Hair and beauty salon in Rwanda",
    headline: "Get booked instantly.",
    subtitle: "No calls, no hassle — just tap and message.",
  },
] as const;

const HERO_CROSSFADE_MS = 800;
const HERO_AUTO_ADVANCE_MS = 4000;

function HeroSlideDots({
  active,
  onSelect,
  className = "",
  variant = "onLight",
}: {
  active: number;
  onSelect: (i: number) => void;
  className?: string;
  variant?: "onLight" | "onDark";
}) {
  const activeDot =
    variant === "onDark" ? "bg-white scale-110" : "bg-primary scale-110";
  const inactiveDot =
    variant === "onDark"
      ? "bg-white/35 ring-1 ring-white/45"
      : "bg-[#0D1117]/20 ring-1 ring-[#0D1117]/15";

  return (
    <div
      className={`flex justify-center gap-2 ${className}`}
      role="tablist"
      aria-label="Hero photos"
    >
      {HERO_SLIDES.map((_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={active === i}
          aria-label={`Slide ${i + 1}`}
          onClick={() => onSelect(i)}
          className={`h-2 w-2 shrink-0 rounded-full transition-all duration-300 ${
            active === i ? activeDot : inactiveDot
          }`}
        />
      ))}
    </div>
  );
}

type IndexMobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  onExplore?: () => void;
  onHowItWorks?: () => void;
  onForBusinesses?: () => void;
};

const mobileMenuOverlayStyle: CSSProperties = {
  backgroundColor: "rgba(0, 0, 0, 0.85)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
};

function IndexMobileDrawer({
  open,
  onClose,
  loading,
  onExplore,
  onHowItWorks,
  onForBusinesses,
}: IndexMobileDrawerProps) {
  if (!open) return null;

  const navItems: { label: string; action: () => void }[] = [
    {
      label: "Explore",
      action: () => {
        onExplore?.();
        onClose();
      },
    },
    {
      label: "How it works",
      action: () => {
        onHowItWorks?.();
        onClose();
      },
    },
    {
      label: "For salons",
      action: () => {
        onForBusinesses?.();
        onClose();
      },
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] md:hidden"
      style={mobileMenuOverlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-full-menu-title"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-default"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div className="relative z-[1] flex min-h-full flex-col pointer-events-none">
        <div className="pointer-events-auto flex justify-end p-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <span id="mobile-full-menu-title" className="sr-only">
            Site menu
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="h-10 w-10" strokeWidth={1.75} />
          </button>
        </div>

        {loading ? (
          <div className="pointer-events-auto flex flex-1 flex-col items-center justify-center gap-4 px-6">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <p className="text-sm font-medium text-white/80">Loading…</p>
          </div>
        ) : (
          <>
            <nav
              className="pointer-events-auto flex flex-1 flex-col items-center justify-center gap-8 px-6"
              aria-label="Site"
            >
              {navItems.map((item, i) => (
                <button
                  key={item.label}
                  type="button"
                  className="mobile-nav-link-stagger border-0 bg-transparent text-3xl font-bold text-white transition-opacity hover:text-white/90"
                  style={{ animationDelay: `${i * 0.1}s` }}
                  onClick={item.action}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="pointer-events-auto px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4">
              <a
                href="https://biz.glowpro.rw"
                className="mobile-nav-link-stagger mx-auto flex w-full max-w-xs items-center justify-center rounded-full bg-primary py-4 text-center text-lg font-semibold text-white transition-colors hover:bg-primary/90"
                style={{ animationDelay: "0.35s" }}
                onClick={onClose}
              >
                List your salon
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const Index = () => {
  const { data, isLoading } = usebusinesss();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [whatQuery, setWhatQuery] = useState("");
  const [whereQuery, setWhereQuery] = useState("");
  const businessesRef = useRef<HTMLElement>(null);

  const handleSearch = useCallback((what: string, where: string) => {
    setWhatQuery(what);
    setWhereQuery(where);
  }, []);

  const handleCategorySelect = useCallback((cat: string | null) => {
    setSelectedCategory(cat);
  }, []);

  const scrollToBusinesses = () => {
    businessesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const onScroll = () => {
      setNavScrolled(window.scrollY >= 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setHeroSlide((s) => (s + 1) % HERO_SLIDES.length);
    }, HERO_AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, []);

  const filterList = useMemo(() => {
    const whatLower = whatQuery.toLowerCase();
    const whereLower = whereQuery.toLowerCase();

    return (list: typeof popularList) =>
      list.filter((b) => {
        if (selectedCategory && b.category !== selectedCategory) return false;
        if (whatLower && !b.name.toLowerCase().includes(whatLower) && !b.category.toLowerCase().includes(whatLower))
          return false;
        if (whereLower && !b.neighborhood.toLowerCase().includes(whereLower)) return false;
        return true;
      });
  }, [selectedCategory, whatQuery, whereQuery]);

  const popularList = data?.popular ?? [];
  const trendingList = data?.trending ?? [];
  const newList = data?.newlyListed ?? [];

  const filteredPopular = filterList(popularList);
  const filteredTrending = filterList(trendingList);
  const filteredNew = filterList(newList);
  const allFiltered = filteredPopular.length + filteredTrending.length + filteredNew.length;
  const hasBusinesses = popularList.length > 0 || trendingList.length > 0 || newList.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="min-h-screen bg-transparent text-[#0D1117] relative">
          <header className="relative z-10 px-4 md:px-10 py-4 border-b border-[#0D1117]/[0.06]">
            <div className="max-w-[1200px] mx-auto flex w-full items-center justify-between gap-3">
              <div className="flex items-center gap-0.5 shrink-0">
                <span className="text-primary text-xl font-black tracking-tight">Glow</span>
                <span className="text-[#0D1117] text-xl font-black tracking-tight">Pro</span>
              </div>
              <button
                type="button"
                className="md:hidden -mr-1 rounded-lg p-2 text-[#0D1117] hover:bg-[#0D1117]/[0.06]"
                aria-label="Open menu"
                aria-expanded={mobileNavOpen}
                onClick={() => setMobileNavOpen(true)}
              >
                <Menu className="h-6 w-6" strokeWidth={2} />
              </button>
              <a
                href="https://biz.glowpro.rw"
                className="hidden md:inline-flex shrink-0 text-sm font-semibold text-white bg-[#0D1117] px-3.5 py-2 rounded-full hover:bg-[#0D1117]/90 transition-colors whitespace-nowrap"
              >
                List your salon
              </a>
            </div>
          </header>
        </div>
        <div className="flex justify-center py-24">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
        <IndexMobileDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-visible bg-[#f0f0ee] pb-4">
      <header
        className={cn(
          "fixed z-50 rounded-full transition-all duration-300 ease-in-out",
          "left-4 top-4 w-[calc(100%-2rem)] translate-x-0",
          "md:left-1/2 md:top-4 md:w-max md:-translate-x-1/2 md:px-5 md:py-2.5",
          "px-4 py-2.5",
        )}
        style={
          navScrolled
            ? {
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                border: "1px solid rgba(255, 255, 255, 0.6)",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.1)",
              }
            : {
                backgroundColor: "rgba(0, 0, 0, 0.25)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.1)",
              }
        }
      >
        <div className="flex w-full items-center justify-between gap-3 md:grid md:w-max md:min-w-0 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8 lg:gap-10">
          <div className="flex shrink-0 items-center gap-0.5 md:justify-self-start">
            <span
              className={cn(
                "text-lg font-black tracking-tight transition-colors duration-300 ease-in-out md:text-xl",
                navScrolled ? "text-primary" : "text-white",
              )}
            >
              Glow
            </span>
            <span
              className={cn(
                "text-lg font-black tracking-tight transition-colors duration-300 ease-in-out md:text-xl",
                navScrolled ? "text-[#0D1117]" : "text-white",
              )}
            >
              Pro
            </span>
          </div>

          <nav
            className="hidden items-center justify-center gap-8 md:flex lg:gap-10"
            aria-label="Page sections"
          >
            <button
              type="button"
              onClick={() => scrollToSection("businesses")}
              className={cn(
                "cursor-pointer border-0 bg-transparent p-0 text-sm font-medium no-underline transition-colors duration-300 ease-in-out",
                navScrolled
                  ? "text-[#4B5563] hover:text-[#0D1117]"
                  : "text-white hover:text-white/90",
              )}
            >
              Explore
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("how-it-works")}
              className={cn(
                "cursor-pointer border-0 bg-transparent p-0 text-sm font-medium no-underline transition-colors duration-300 ease-in-out",
                navScrolled
                  ? "text-[#4B5563] hover:text-[#0D1117]"
                  : "text-white hover:text-white/90",
              )}
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("for-businesses")}
              className={cn(
                "cursor-pointer border-0 bg-transparent p-0 text-sm font-medium no-underline transition-colors duration-300 ease-in-out",
                navScrolled
                  ? "text-[#4B5563] hover:text-[#0D1117]"
                  : "text-white hover:text-white/90",
              )}
            >
              For salons
            </button>
          </nav>

          <div className="flex shrink-0 items-center md:justify-self-end">
            <button
              type="button"
              className={cn(
                "rounded-full p-2 transition-colors duration-300 ease-in-out md:hidden",
                navScrolled
                  ? "text-[#0D1117] hover:bg-[#0D1117]/[0.06]"
                  : "text-white hover:bg-white/10",
              )}
              aria-label="Open menu"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="h-6 w-6" strokeWidth={2} />
            </button>
            <a
              href="https://biz.glowpro.rw"
              className={cn(
                "hidden shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-300 ease-in-out md:inline-flex",
                navScrolled
                  ? "border border-transparent bg-[#0D1117] text-white hover:bg-[#0D1117]/90"
                  : "border border-white/50 bg-white/10 text-white hover:bg-white/20",
              )}
            >
              List your salon
            </a>
          </div>
        </div>
      </header>

      <section className="relative mx-3 min-h-screen max-md:w-auto overflow-hidden rounded-[24px] bg-black text-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.42)] ring-1 ring-black/10 md:mx-8 md:mt-4 md:rounded-3xl md:min-h-0 md:h-[92vh] md:max-h-[92vh] md:w-auto lg:mx-12">
        {/* Option B: full-bleed imagery + gradient; portrait on small screens, landscape md+ */}
        <div
          className="absolute inset-0 min-h-full"
          aria-roledescription="carousel"
          aria-label="Rwanda salons"
        >
          {HERO_SLIDES.map((slide, i) => (
            <div
              key={`${slide.portrait}-${slide.landscape}`}
              className={`absolute inset-0 transition-opacity ease-in-out ${
                i === heroSlide ? "z-[1] opacity-100" : "z-0 opacity-0 pointer-events-none"
              }`}
              style={{ transitionDuration: `${HERO_CROSSFADE_MS}ms` }}
            >
              <picture className="absolute inset-0 block h-full w-full">
                <source media="(min-width: 768px)" srcSet={slide.landscape} />
                <img
                  src={slide.portrait}
                  alt={slide.alt}
                  className="h-full w-full object-cover object-top md:object-center"
                  fetchPriority={i === 0 ? "high" : "low"}
                  decoding="async"
                />
              </picture>
            </div>
          ))}
          <div
            className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.75)]"
            aria-hidden
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 w-full p-6 pb-8 md:p-16 md:pb-12">
          <div className="pointer-events-auto flex w-full flex-col items-stretch">
            <div className="w-full text-left">
              <p className="mb-4 inline-flex max-w-full items-center rounded-full bg-white/20 px-3.5 py-1.5 text-sm text-white backdrop-blur-md">
                🇷🇼 Rwanda&apos;s #1 Beauty Platform
              </p>
              <div key={heroSlide} className="hero-slide-text-reveal">
                <h1 className="max-w-none font-black tracking-tight text-white leading-[1.02] text-[clamp(2.25rem,8vw,7rem)] md:max-w-2xl md:text-5xl xl:text-6xl">
                  {HERO_SLIDES[heroSlide].headline}
                </h1>
                <p className="mt-4 mb-8 max-w-md text-xs leading-relaxed text-white/70 md:text-sm">
                  {HERO_SLIDES[heroSlide].subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={scrollToBusinesses}
                className="inline-flex w-auto items-center justify-center rounded-full bg-white px-8 py-4 text-base font-bold text-[#0D1117] transition-colors hover:bg-white/90"
              >
                Explore salons →
              </button>
            </div>
            <div className="mt-8 flex w-full justify-center md:mt-10">
              <HeroSlideDots variant="onDark" active={heroSlide} onSelect={setHeroSlide} />
            </div>
          </div>
        </div>
      </section>

      <section
        id="businesses"
        ref={businessesRef}
        className="scroll-mt-[7rem] mx-3 mt-4 rounded-[24px] bg-white p-6 shadow-[0_4px_32px_rgba(0,0,0,0.08)] md:mx-6 md:scroll-mt-[6.5rem] md:p-10"
      >
        <div className="max-w-[1200px] mx-auto w-full">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Find any stylist or salon in Rwanda
            </h2>
            <p className="mt-2 text-base text-gray-500">
              Search by name, category or neighborhood
            </p>
          </div>
          <SearchBar what={whatQuery} where={whereQuery} onSearch={handleSearch} />
          <CategoryRibbon selected={selectedCategory} onSelect={handleCategorySelect} />

          {!hasBusinesses || allFiltered === 0 ? (
            <div className="mt-8 [&>div]:max-w-none [&>div]:px-0">
              <EmptyState
                filtered={hasBusinesses && allFiltered === 0}
                category={selectedCategory}
                onClearFilter={() => {
                  setSelectedCategory(null);
                  setWhatQuery("");
                  setWhereQuery("");
                }}
              />
            </div>
          ) : (
            <>
              {filteredPopular.length > 0 && (
                <div className="mt-8 border-t border-[rgba(0,0,0,0.05)] pt-8">
                  <BusinessSection
                    embedded
                    title="Popular salons"
                    businesses={filteredPopular}
                    eyebrow="POPULAR THIS MONTH"
                  />
                </div>
              )}
              {filteredTrending.length > 0 && (
                <div className="mt-8 border-t border-[rgba(0,0,0,0.05)] pt-8">
                  <BusinessSection embedded title="Trending this week" businesses={filteredTrending} />
                </div>
              )}
              {filteredNew.length > 0 && (
                <div className="mt-8 border-t border-[rgba(0,0,0,0.05)] pt-8">
                  <BusinessSection embedded title="Newly listed" businesses={filteredNew} />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-[7rem] mx-3 mt-4 rounded-3xl bg-white py-14 shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:mx-6 md:scroll-mt-[6.5rem] md:py-20"
      >
        <div className="max-w-[1200px] mx-auto px-4 md:px-10">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-14 lg:gap-20">
            {/* Phone mockup — above text on mobile, right on desktop */}
            <div className="order-1 md:order-2 flex justify-center shrink-0 md:w-[min(340px,42%)]">
              <img
                src={phoneMockup}
                alt="GlowPro app preview"
                className="h-auto w-[min(280px,82vw)] max-w-full object-contain"
              />
            </div>

            <div className="order-2 md:order-1 flex-1 min-w-0 max-w-xl mx-auto md:mx-0 text-center md:text-left">
              <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                See it in action
              </span>
              <h3 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] text-[#111]">
                Find any stylist or salon in Rwanda in seconds
              </h3>
              <ul className="mt-8 space-y-4 text-left text-base md:text-lg">
                {[
                  "Search by name, category or neighborhood",
                  "WhatsApp or call directly from the listing",
                  "Get directions and walk right in",
                ].map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="mt-0.5 shrink-0 text-primary font-bold" aria-hidden>
                      ✓
                    </span>
                    <span className="text-[#111]">{line}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={scrollToBusinesses}
                className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Explore salons →
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="for-businesses"
        className="scroll-mt-[7rem] mx-3 mt-4 rounded-3xl bg-amber-950 text-white relative overflow-hidden py-14 md:mx-6 md:scroll-mt-[6.5rem] md:py-20"
      >
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.4)_1px,transparent_0)] [background-size:20px_20px]" />
        <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10 md:gap-12 lg:gap-16">
            <div className="max-w-xl md:max-w-[52%]">
              <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white/95">
                For salon owners
              </span>
              <h3 className="mt-5 text-4xl sm:text-5xl md:text-[2.75rem] lg:text-6xl font-black text-white tracking-tight leading-[1.02]">
                Your next customer
                <br />
                is already looking
                <br />
                for you.
              </h3>
              <p className="mt-5 text-base md:text-lg text-amber-100/80 leading-relaxed">
                List your salon on GlowPro for free. Takes 5 minutes. No technical skills needed.
              </p>
              <a
                href="https://biz.glowpro.rw"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get listed free →
              </a>
            </div>

            <div className="relative hidden md:flex md:w-[42%] min-h-[220px] lg:min-h-[260px] shrink-0 items-center justify-center">
              <span
                className="absolute inset-0 flex items-center justify-center text-white font-black text-[clamp(5rem,14vw,10rem)] leading-none select-none pointer-events-none whitespace-nowrap"
                style={{ opacity: 0.07 }}
                aria-hidden
              >
                KIGALI
              </span>
              <div className="relative text-center z-[1]">
                <p className="text-6xl lg:text-7xl font-black text-white tracking-tight">5 min</p>
                <p className="mt-2 text-sm md:text-base text-white/80 font-medium">to list your salon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-3 mt-4 mb-4 rounded-3xl bg-[#111] text-white overflow-hidden md:mx-6">
        <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-4 md:py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0 sm:max-w-none">
              <p className="text-sm text-white/85 sm:hidden">
                <span className="block font-semibold text-white/95">GlowPro</span>
                <span className="mt-1 block text-xs leading-snug text-white/75 text-pretty">
                  Beauty in Rwanda — one salon at a time.
                </span>
              </p>
              <p className="hidden text-sm text-white/85 sm:block">
                GlowPro · Beauty in Rwanda, one salon at a time.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <a href="https://biz.glowpro.rw" className="text-white/75 hover:text-white">
                  For salons
                </a>
                <span className="text-white/30" aria-hidden>
                  ·
                </span>
                <a href="https://admin.glowpro.rw" className="text-white/75 hover:text-white">
                  Admin
                </a>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[10px] sm:text-xs text-white/45">© 2026 GlowPro</p>
        </div>
      </footer>

      <IndexMobileDrawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onExplore={() => scrollToSection("businesses")}
        onHowItWorks={() => scrollToSection("how-it-works")}
        onForBusinesses={() => scrollToSection("for-businesses")}
      />
    </div>
  );
};

const EmptyState = ({
  filtered,
  category,
  onClearFilter,
}: {
  filtered: boolean;
  category: string | null;
  onClearFilter: () => void;
}) => {
  if (filtered && category) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <p className="text-4xl mb-4">🔍</p>
        <h2 className="text-xl font-semibold text-[#111] mb-2">
          No {category} salons yet
        </h2>
        <p className="mb-6 text-[#666]">Be the first to list your salon in this category.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onClearFilter}
            className="px-6 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium"
          >
            Show all salons
          </button>
          <a
            href="https://biz.glowpro.rw"
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold"
          >
            <Store className="w-4 h-4" />
            List your salon
          </a>
        </div>
      </div>
    );
  }

  if (filtered) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <p className="text-4xl mb-4">🔍</p>
        <h2 className="text-xl font-semibold text-[#111] mb-2">No salons match your search</h2>
        <p className="mb-6 text-[#666]">Try different keywords or clear your filters.</p>
        <button
          onClick={onClearFilter}
          className="px-6 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
        <Store className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-[#111] mb-3">No salons yet — be the first!</h2>
      <p className="mb-8 max-w-md mx-auto text-[#666]">
        GlowPro is just getting started. List your salon and reach thousands of customers in Rwanda.
      </p>
      <a
        href="https://biz.glowpro.rw"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold"
      >
        <Store className="w-4 h-4" />
        List your salon
      </a>
    </div>
  );
};

export default Index;
