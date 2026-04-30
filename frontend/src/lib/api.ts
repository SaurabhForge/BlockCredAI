const LOCAL_BACKEND_URL = "http://localhost:4000";
const CLOUD_BACKEND_URL = "https://blockcredai-api-26kdhhc42a-uc.a.run.app";

function getDefaultBackendUrl(): string {
  if (typeof window !== "undefined" && window.location.hostname.includes("run.app")) {
    return CLOUD_BACKEND_URL;
  }

  return LOCAL_BACKEND_URL;
}

export function getBackendUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_GCP_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    getDefaultBackendUrl();

  return configuredUrl.replace(/\/+$/, "");
}
