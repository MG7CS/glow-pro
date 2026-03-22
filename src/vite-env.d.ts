/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional full base URL for the biz portal (e.g. staging). Trailing slash is stripped in getBizUrl(). */
  readonly VITE_BIZ_PORTAL_URL?: string;
}
