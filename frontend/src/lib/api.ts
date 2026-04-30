const DEFAULT_BACKEND_URL = "http://localhost:4000";

export function getBackendUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_GCP_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    DEFAULT_BACKEND_URL;

  return configuredUrl.replace(/\/+$/, "");
}
