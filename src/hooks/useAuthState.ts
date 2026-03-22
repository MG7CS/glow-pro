import { useEffect, useState } from "react";
import { signOut as amplifySignOut } from "aws-amplify/auth";
import { isBizPortalHost } from "@/lib/portalEnv";

export type AuthState = {
  isLoggedIn: boolean;
  identifier: string | null;
  signOut: () => Promise<void>;
};

const LS_KEYS = ["biz_session", "biz_draft", "biz_id", "biz_owner"];

export const useAuthState = (): AuthState => {
  const [identifier, setIdentifier] = useState<string | null>(
    () => localStorage.getItem("biz_session")
  );

  useEffect(() => {
    const sync = () => setIdentifier(localStorage.getItem("biz_session"));
    window.addEventListener("storage", sync);
    window.addEventListener("biz_auth_change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("biz_auth_change", sync);
    };
  }, []);

  const signOut = async () => {
    try {
      await amplifySignOut({ global: false });
    } catch {
      // Session may already be invalid — proceed with local cleanup regardless
    }
    LS_KEYS.forEach((k) => localStorage.removeItem(k));
    setIdentifier(null);
    window.dispatchEvent(new Event("biz_auth_change"));
    window.location.href = isBizPortalHost() ? "/" : "/biz";
  };

  return { isLoggedIn: !!identifier, identifier, signOut };
};
