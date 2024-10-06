/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_WC_PROJECT_ID: string;
  readonly VITE_APP_CONTRACT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
