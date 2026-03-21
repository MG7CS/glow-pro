import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { signUp, signIn, autoSignIn, getCurrentUser } from "aws-amplify/auth";
import { cn } from "@/lib/utils";
import { bizContinueBtn, bizField } from "@/lib/bizUi";
import type { BizFormData } from "@/types/biz";
import { generateOwnerEmail, normalizePhone, isValidRwandanMobile } from "@/lib/bizOwnerAuth";

interface Props {
  form: BizFormData;
  update: (patch: Partial<BizFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

async function ensureSignedInAfterSignUp(
  password: string,
  normalizedPhone: string,
  nextStep: { signUpStep: string },
) {
  const step = nextStep.signUpStep;
  if (step === "COMPLETE_AUTO_SIGN_IN") {
    await autoSignIn();
    return;
  }
  if (step === "CONFIRM_SIGN_UP") {
    await signIn({ username: normalizedPhone, password });
    return;
  }
  try {
    await getCurrentUser();
  } catch {
    await signIn({ username: normalizedPhone, password });
  }
}

const StepAuth = ({ form, update, onNext, onBack }: Props) => {
  const [phone, setPhone] = useState(form.ownerPhone || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [touched, setTouched] = useState({ phone: false, password: false, confirm: false });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalized = normalizePhone(phone);
  const phoneValid = phone.trim().length > 0 && isValidRwandanMobile(phone);
  const pwLenOk = password.length >= 8;
  const matchOk = password === confirmPassword && confirmPassword.length > 0;
  const showPhoneErr = (touched.phone || submitAttempted) && phone.trim().length > 0 && !phoneValid;
  const showPwErr = (touched.password || submitAttempted) && password.length > 0 && !pwLenOk;
  const showConfirmErr =
    (touched.confirm || submitAttempted) && confirmPassword.length > 0 && !matchOk;

  const allValid = phoneValid && pwLenOk && matchOk;

  const handleContinue = async () => {
    setSubmitAttempted(true);
    setError("");
    if (!allValid || loading) return;

    const shopId = form.id;
    if (!shopId) {
      setError("Almost ready — please wait a moment and try again.");
      return;
    }

    const ownerEmail = generateOwnerEmail(form.businessName, shopId);
    const phoneNorm = normalized;

    setLoading(true);
    try {
      let nextStep: { signUpStep: string };

      const signUpWithAttrs = async (attrs: Record<string, string>) => {
        const result = await signUp({
          username: phoneNorm,
          password,
          options: {
            userAttributes: attrs,
            autoSignIn: true,
          },
        });
        return result.nextStep;
      };

      try {
        nextStep = await signUpWithAttrs({
          phone_number: phoneNorm,
          email: ownerEmail,
          "custom:role": "owner",
        });
      } catch (first: unknown) {
        const err = first as { name?: string; message?: string };
        const msg = (err?.message ?? "").toLowerCase();

        if (err?.name === "UsernameExistsException") {
          await signIn({ username: phoneNorm, password });
          nextStep = { signUpStep: "DONE" };
        } else if (
          err?.name === "InvalidParameterException" ||
          msg.includes("custom:role") ||
          msg.includes("custom attributes")
        ) {
          try {
            nextStep = await signUpWithAttrs({
              phone_number: phoneNorm,
              email: ownerEmail,
            });
          } catch (second: unknown) {
            const e2 = second as { name?: string };
            if (e2?.name === "UsernameExistsException") {
              await signIn({ username: phoneNorm, password });
              nextStep = { signUpStep: "DONE" };
            } else {
              throw second;
            }
          }
        } else {
          throw first;
        }
      }

      await ensureSignedInAfterSignUp(password, phoneNorm, nextStep);

      localStorage.setItem("biz_session", phoneNorm);
      window.dispatchEvent(new Event("biz_auth_change"));
      update({ ownerPhone: phoneNorm });

      onNext();
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e?.name === "InvalidPasswordException") {
        setError("Password must be at least 8 characters.");
      } else if (e?.name === "UsernameExistsException") {
        setError("This phone is already registered. Sign in from the login page.");
      } else {
        setError(e?.message ?? "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!form.id) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Preparing your account…</p>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-8 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">Create your account</h1>
      <p className="mb-8 text-muted-foreground">Almost done — one last step before we publish your listing.</p>

      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Your phone number</label>
          <input
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            placeholder="+250 7XX XXX XXX"
            className={cn(
              bizField,
              "h-12 px-4 text-foreground placeholder:text-muted-foreground/50",
              showPhoneErr && "border-destructive",
            )}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            You will use your phone number and password to sign in and manage your listing
          </p>
          {showPhoneErr && (
            <p className="mt-1 text-xs text-destructive">Enter a valid Rwandan mobile number (+250 7…).</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder="At least 8 characters"
              className={cn(
                bizField,
                "h-12 px-4 pr-11 text-foreground placeholder:text-muted-foreground/60",
                showPwErr && "border-destructive",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {showPwErr && (
            <p className="mt-1 text-xs text-destructive">Password must be at least 8 characters.</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Confirm password</label>
          <div className="relative">
            <input
              type={showPw2 ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
              placeholder="Re-enter your password"
              className={cn(
                bizField,
                "h-12 px-4 pr-11 text-foreground placeholder:text-muted-foreground/60",
                showConfirmErr && "border-destructive",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPw2(!showPw2)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPw2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {showConfirmErr && (
            <p className="mt-1 text-xs text-destructive">Passwords do not match.</p>
          )}
        </div>

        {error && <ErrorBanner message={error} />}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!allValid || loading}
          className={cn(bizContinueBtn, "gap-2 px-8 py-3 text-sm disabled:opacity-40")}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Continue
        </button>
      </div>
    </div>
  );
};

const ErrorBanner = ({ message }: { message: string }) => (
  <div className="flex items-start gap-2.5 rounded-lg border border-destructive/15 bg-destructive/10 px-4 py-3">
    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
    <p className="text-sm text-destructive">{message}</p>
  </div>
);

export default StepAuth;
