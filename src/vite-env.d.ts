/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Application version, set at build time */
  readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
