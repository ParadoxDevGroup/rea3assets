// ---------------------------------------------------------------------------
// ERP Integration Client
// ---------------------------------------------------------------------------
// Communicates with the core ReA3 ERP to sync SKU, asset records, etc.
// Uses ERP_INTERNAL_URL and ERP_INTERNAL_API_KEY from environment.
// Called during asset publish lifecycle.

import { logger } from "./logger";

function getConfig() {
  const baseUrl = process.env.ERP_INTERNAL_URL ?? "http://localhost:3000";
  const apiKey = process.env.ERP_INTERNAL_API_KEY;

  if (!apiKey) {
    logger.warn("ERP_INTERNAL_API_KEY not set — ERP sync calls will be skipped");
  }

  return { baseUrl, apiKey };
}

interface ErpResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

async function erpFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ErpResponse<T>> {
  const { baseUrl, apiKey } = getConfig();

  if (!apiKey) {
    return { success: false, error: "ERP_INTERNAL_API_KEY not configured" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        error: body?.error ?? `ERP returned ${res.status}`,
      };
    }

    return { success: true, data: body as T };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return { success: false, error: "ERP request timed out after 10s" };
    }
    return { success: false, error: err?.message ?? String(err) };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SyncSkuPayload {
  sku: string;
  name: string;
  slug: string;
  division: string;
  description?: string | null;
  asset_type_name: string;
  metadata?: Record<string, unknown>;
}

/**
 * Sync an asset's SKU to the ERP when it is published.
 * POST /api/internal/sku-sync on the ERP side.
 */
export async function syncSku(payload: SyncSkuPayload): Promise<ErpResponse> {
  const result = await erpFetch("/api/internal/sku-sync", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (result.success) {
    logger.info("SKU synced to ERP", { sku: payload.sku });
  } else {
    logger.error("SKU sync failed", { sku: payload.sku, error: result.error });
  }

  return result;
}

export interface UpdateAssetRecordPayload {
  erp_sku: string;
  file_path: string;
  version: string;
  checksum?: string | null;
}

/**
 * Update the ERP's Asset record with storage metadata after a version upload.
 * PATCH /api/internal/assets/sync on the ERP side.
 */
export async function updateAssetRecord(
  payload: UpdateAssetRecordPayload,
): Promise<ErpResponse> {
  const result = await erpFetch("/api/internal/assets/sync", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (result.success) {
    logger.info("Asset record updated in ERP", { sku: payload.erp_sku, version: payload.version });
  } else {
    logger.warn("Asset record update in ERP failed", {
      sku: payload.erp_sku,
      error: result.error,
    });
  }

  return result;
}
