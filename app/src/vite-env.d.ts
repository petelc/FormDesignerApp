/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_TOKEN_REFRESH_INTERVAL: string;
  readonly VITE_MAX_FILE_SIZE: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
