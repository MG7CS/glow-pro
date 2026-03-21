import { useEffect, useRef, useState } from "react";

// Extend the standard Event type for the Chrome beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa_install_dismissed";

const isAlreadyInstalled = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as { standalone?: boolean }).standalone === true;

const isMobile = () =>
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const isIOSSafari = () => {
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  // Chrome on iOS identifies itself with "CriOS", Firefox with "FxiOS"
  const isSafariBrowser = !/(CriOS|FxiOS|OPiOS)/i.test(ua);
  return isIOS && isSafariBrowser;
};

const PwaInstallPrompt = () => {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [ios, setIos] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isAlreadyInstalled()) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;
    if (!isMobile()) return;

    const iosDevice = isIOSSafari();
    setIos(iosDevice);

    const show = () => {
      setVisible(true);
      // Small delay so the DOM paints before the transition kicks in
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimateIn(true)));
    };

    if (iosDevice) {
      // iOS Safari never fires beforeinstallprompt — show after 2 s
      const t = setTimeout(show, 2000);
      return () => clearTimeout(t);
    }

    // Android / Chrome Desktop PWA
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      show();
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setAnimateIn(false);
    localStorage.setItem(DISMISSED_KEY, "1");
    setTimeout(() => setVisible(false), 350);
  };

  const handleInstall = async () => {
    if (!deferredPromptRef.current) return;
    await deferredPromptRef.current.prompt();
    const { outcome } = await deferredPromptRef.current.userChoice;
    deferredPromptRef.current = null;
    if (outcome === "accepted") {
      dismiss();
    }
  };

  if (!visible) return null;

  return (
    <>
      {/* Scrim */}
      <div
        className={`fixed inset-0 z-50 bg-black/25 transition-opacity duration-300 ${
          animateIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Install GlowPro"
        className={`fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl
          transition-transform duration-350 ease-out
          ${animateIn ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-6 pt-5 pb-10">
          {/* App identity row */}
          <div className="flex items-center gap-4 mb-5">
            <img
              src="/icon-192.png"
              alt="GlowPro icon"
              className="w-14 h-14 rounded-2xl shadow-sm"
            />
            <div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-primary text-lg font-bold leading-none">Glow</span>
                <span className="text-foreground text-lg font-bold leading-none">Pro</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">glowpro.rw</p>
            </div>
          </div>

          {/* Copy */}
          <h2 className="text-xl font-bold text-foreground mb-1">
            Add GlowPro to your home screen
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Find salons faster — works offline too
          </p>

          {ios ? <IOSInstructions /> : (
            <button
              onClick={handleInstall}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              Add to home screen
            </button>
          )}

          <button
            onClick={dismiss}
            className="w-full mt-3 h-11 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            Not now
          </button>
        </div>
      </div>
    </>
  );
};

/* ── iOS-specific instructions ── */
const IOSInstructions = () => (
  <div className="bg-muted rounded-2xl p-4 mb-1">
    <ol className="space-y-3">
      <li className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
          1
        </span>
        <p className="text-sm text-foreground">
          Tap the{" "}
          <strong>Share</strong>{" "}
          <ShareIcon className="inline w-4 h-4 text-primary align-text-bottom" />{" "}
          button at the bottom of Safari
        </p>
      </li>
      <li className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
          2
        </span>
        <p className="text-sm text-foreground">
          Scroll down and tap{" "}
          <strong>"Add to Home Screen"</strong>
        </p>
      </li>
    </ol>

    {/* Animated arrow pointing downward toward Safari's share bar */}
    <div className="flex justify-center mt-4">
      <svg
        className="w-5 h-5 text-primary animate-bounce"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
);

/* Safari share icon (box with up arrow) */
const ShareIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
    />
  </svg>
);

export default PwaInstallPrompt;
