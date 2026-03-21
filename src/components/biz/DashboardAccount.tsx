import { useState } from "react";
import { AlertTriangle, Loader2, ShieldOff, Trash2 } from "lucide-react";
import { deleteUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import { updateShop, deleteShop } from "@/graphql/mutations";
import { useAuthState } from "@/hooks/useAuthState";

interface Props {
  businessId?: string;
  businessName?: string;
}

type Dialog = "none" | "suspend" | "delete";

// Lazy singleton — must NOT call generateClient() at module level because
// module code runs before configureAmplify() which triggers a warning and
// can produce a misconfigured client.
let _acctClient: ReturnType<typeof generateClient> | null = null;
const getClient = () => (_acctClient ??= generateClient());

const DashboardAccount = ({ businessId, businessName }: Props) => {
  const { signOut } = useAuthState();
  const [dialog, setDialog] = useState<Dialog>("none");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSuspend = async () => {
    setError("");
    setLoading(true);
    try {
      if (businessId) {
        // Mark as unverified to hide from public listings; data is retained
        await getClient().graphql({
          query: updateShop,
          authMode: "userPool",
          variables: { input: { id: businessId, verified: false } },
        });
      }
      await signOut(); // clears all localStorage, calls Amplify signOut, redirects /biz
    } catch (err: any) {
      setError(err?.message ?? "Could not suspend account. Please try again.");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setError("");
    setLoading(true);
    try {
      if (businessId) {
        // Remove the listing record from DynamoDB first
        await getClient().graphql({
          query: deleteShop,
          authMode: "userPool",
          variables: { input: { id: businessId } },
        });
      }
      // Delete the Cognito user, then sign out + cleanup
      await deleteUser();
      await signOut();
    } catch (err: any) {
      setError(err?.message ?? "Could not delete account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-0.5">Account settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your GlowPro account and listing visibility.
        </p>
      </div>

      {/* Business info card */}
      {businessName && (
        <div className="bg-white rounded-2xl px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Your listing
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <span className="text-base font-bold text-amber-700">
                {businessName[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{businessName}</p>
              <p className="text-xs text-muted-foreground">Active listing</p>
            </div>
          </div>
        </div>
      )}

      {/* Danger zone */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-border/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Danger zone
          </p>
        </div>

        {/* Suspend */}
        <div className="px-6 py-5 flex items-start justify-between gap-4 border-b border-border/50">
          <div>
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldOff className="w-4 h-4 text-amber-500" />
              Suspend listing
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Your salon will be hidden from GlowPro. Your account and data are kept safe — you can reactivate at any time.
            </p>
          </div>
          <button
            onClick={() => setDialog("suspend")}
            className="shrink-0 px-4 py-2 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
          >
            Suspend
          </button>
        </div>

        {/* Delete */}
        <div className="px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-500" />
              Delete account
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Your Cognito login will be removed immediately. Your listing data is retained for compliance — status set to deleted and hidden from all public views.
            </p>
          </div>
          <button
            onClick={() => setDialog("delete")}
            className="shrink-0 px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Confirmation dialog — suspend */}
      {dialog === "suspend" && (
        <ConfirmDialog
          title="Suspend your listing?"
          description="Your salon will be hidden from GlowPro. You can sign back in and reactivate it any time."
          confirmLabel="Yes, suspend"
          confirmClass="bg-amber-500 hover:bg-amber-600 text-white"
          loading={loading}
          error={error}
          onCancel={() => { setDialog("none"); setError(""); }}
          onConfirm={handleSuspend}
        />
      )}

      {/* Confirmation dialog — delete */}
      {dialog === "delete" && (
        <ConfirmDialog
          title="Delete your account?"
          description="This removes your login permanently. Your listing data is retained but hidden. This cannot be undone."
          confirmLabel="Yes, delete my account"
          confirmClass="bg-red-600 hover:bg-red-700 text-white"
          loading={loading}
          error={error}
          onCancel={() => { setDialog("none"); setError(""); }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass: string;
  loading: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmDialog = ({
  title,
  description,
  confirmLabel,
  confirmClass,
  loading,
  error,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-base font-bold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-5">{description}</p>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-foreground border border-border hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors ${confirmClass}`}
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default DashboardAccount;
