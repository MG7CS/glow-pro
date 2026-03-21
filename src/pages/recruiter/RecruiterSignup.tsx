import { useState } from "react";
import { Link } from "react-router-dom";
import {
  signUp as amplifySignUp,
  confirmSignUp,
  resendSignUpCode,
} from "aws-amplify/auth";
import { Eye, EyeOff } from "lucide-react";

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

type Step = "form" | "verify" | "success";

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const RecruiterSignup = () => {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormValues>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [signedUpEmail, setSignedUpEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = (values: FormValues): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!values.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!values.email.trim()) nextErrors.email = "Email is required.";
    if (!values.phone.trim()) nextErrors.phone = "Phone number is required.";
    if (!values.password) {
      nextErrors.password = "Password is required.";
    } else if (!PASSWORD_RULE.test(values.password)) {
      nextErrors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, and a number.";
    }
    if (!values.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    return nextErrors;
  };

  const updateField = (field: keyof FormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const email = form.email.trim().toLowerCase();
    setLoading(true);
    try {
      await amplifySignUp({
        username: email,
        password: form.password,
        options: {
          userAttributes: {
            email,
            "custom:fullName": form.fullName.trim(),
            "custom:phone": form.phone.trim(),
          },
        },
      });

      // TODO: post-confirmation Lambda trigger should add user to RecruitersPending group automatically.
      setSignedUpEmail(email);
      setVerificationCode("");
      setCodeError("");
      setResendMessage("");
      setStep("verify");
    } catch (err: any) {
      const code = err?.name ?? "";
      if (code === "UsernameExistsException") {
        setSubmitError("An account with this email already exists.");
      } else if (code === "InvalidPasswordException") {
        setSubmitError(
          "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
        );
      } else {
        setSubmitError(err?.message ?? "Could not submit your application.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError("");
    setResendMessage("");
    const code = verificationCode.replace(/\D/g, "").slice(0, 6);
    if (code.length !== 6) {
      setCodeError("Enter the 6-digit code.");
      return;
    }

    setVerifyLoading(true);
    try {
      await confirmSignUp({
        username: signedUpEmail,
        confirmationCode: code,
      });
      setStep("success");
    } catch (err: any) {
      const name = err?.name ?? "";
      if (name === "CodeMismatchException" || name === "ExpiredCodeException") {
        setCodeError("Incorrect code, please try again");
      } else {
        setCodeError(err?.message ?? "Verification failed.");
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    setResendMessage("");
    setCodeError("");
    setResendLoading(true);
    try {
      await resendSignUpCode({ username: signedUpEmail });
      setResendMessage("Code resent!");
    } catch (err: any) {
      setResendMessage(err?.message ?? "Could not resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  const onCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(digits);
    setCodeError("");
    setResendMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-border p-8">
        <div className="mb-8">
          <span className="text-primary text-xl font-bold tracking-tight">Glow</span>
          <span className="text-foreground text-xl font-bold tracking-tight">Pro</span>

          {step === "form" && (
            <>
              <h1 className="text-xl font-semibold text-foreground mt-4">Join the GlowPro team 🌍</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Help Rwanda salons get discovered. Fill in your details and we&apos;ll review your application.
              </p>
            </>
          )}

          {step === "verify" && (
            <>
              <h1 className="text-xl font-semibold text-foreground mt-4">Check your email 📬</h1>
              <p className="text-sm text-muted-foreground mt-1">
                We sent a 6-digit code to {signedUpEmail}. Enter it below to confirm your account.
              </p>
            </>
          )}
        </div>

        {step === "success" ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              Application sent! 🎉 We&apos;ll review it and get back to you soon. Keep an eye on your email.
            </div>
            <Link to="/" className="block text-sm text-primary font-medium hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : step === "verify" ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => onCodeChange(e.target.value)}
                placeholder="000000"
                className="w-full h-16 px-4 rounded-xl border border-border bg-background text-foreground text-center text-3xl font-semibold tracking-[0.4em] placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              {codeError && <p className="mt-2 text-sm text-destructive">{codeError}</p>}
            </div>

            {resendMessage && (
              <p className={`text-sm ${resendMessage.startsWith("Code resent") ? "text-rose-700" : "text-destructive"}`}>
                {resendMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={verifyLoading}
              className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {verifyLoading ? "Verifying..." : "Verify"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full text-sm text-primary font-medium hover:underline disabled:opacity-60"
            >
              {resendLoading ? "Sending..." : "Resend code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                placeholder="Your full name"
                required
                className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="recruiter@example.com"
                required
                className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Phone number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+250 788 000 000"
                required
                className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 px-4 pr-11 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 px-4 pr-11 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            {submitError && <p className="text-sm text-destructive">{submitError}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit application"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RecruiterSignup;
