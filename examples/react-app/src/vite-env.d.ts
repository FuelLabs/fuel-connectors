/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_WC_PROJECT_ID: string;
  readonly VITE_CUSTOM_TRANSFER_AMOUNT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
