import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SECRET_KEYS = JSON.parse(
  Deno.env.get("SUPABASE_SECRET_KEYS")!
);

const SUPABASE_SECRET_KEY = SUPABASE_SECRET_KEYS.default;

const WORKER_SECRET = Deno.env.get("WORKER_SECRET");
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const EXPO_RECEIPTS_URL = "https://exp.host/--/api/v2/push/getReceipts";
const BATCH_SIZE = 100;
const MAX_ATTEMPTS = 4;
const LEASE_SECONDS = 120;
const EXPO_TIMEOUT_MS = 15_000;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || !WORKER_SECRET) {
  throw new Error("Missing SUPABASE_URL, SUPABASE_SECRET_KEY, or WORKER_SECRET");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

type Delivery = {
  delivery_id: string;
  notification_id: string;
  device_token_id: string;
  expo_push_token: string;
  notification_type: string;
  title: string;
  body: string;
  notification_data: Record<string, unknown> | null;
  app_role: string;
  attempt: number;
  claim_updated_at: string;
};

type ReceiptClaim = {
  delivery_id: string;
  expo_ticket_id: string;
  device_token_id: string;
  claim_updated_at: string;
};

type ExpoTicket = {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string; [key: string]: unknown };
};

type ExpoReceipt = {
  status: "ok" | "error";
  message?: string;
  details?: { error?: string; [key: string]: unknown };
};

type DeliveryStatus = "PENDING" | "SENT" | "DEAD";
type DeliveryOutcome = "submitted" | "retried" | "dead" | "unfinalized";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function retryDelaySeconds(attempt: number): number {
  // attempt is incremented when the worker claims the row.
  const delays = [30, 120, 600];
  return delays[Math.max(0, Math.min(attempt - 1, delays.length - 1))];
}

function isRetryableHttpStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function classifyExpoError(code: string | undefined, httpStatus?: number): {
  retryable: boolean;
  deactivateToken: boolean;
} {
  if (code === "DeviceNotRegistered") {
    return { retryable: false, deactivateToken: true };
  }
  if (code === "MessageRateExceeded") {
    return { retryable: true, deactivateToken: false };
  }
  if (httpStatus !== undefined && isRetryableHttpStatus(httpStatus)) {
    return { retryable: true, deactivateToken: false };
  }
  // Unknown ticket errors are terminal by policy to avoid an endless loop.
  return { retryable: false, deactivateToken: false };
}

function errorText(prefix: string, detail: unknown): string {
  let serialized: string;
  try {
    serialized = typeof detail === "string" ? detail : JSON.stringify(detail);
  } catch {
    serialized = String(detail);
  }
  return `${prefix}: ${serialized ?? "unknown error"}`.slice(0, 4000);
}

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new Error(`${name} failed: ${error.message}`);
  return data as T;
}

async function finishDelivery(
  row: Delivery,
  result: {
    status: DeliveryStatus;
    ticketId?: string | null;
    error?: string | null;
    nextAttemptAt?: string | null;
    deactivateToken?: boolean;
  },
): Promise<boolean> {
  const finalized = await rpc<boolean>("finish_notification_delivery", {
    p_delivery_id: row.delivery_id,
    p_claim_updated_at: row.claim_updated_at,
    p_status: result.status,
    p_expo_ticket_id: result.ticketId ?? null,
    p_error: result.error ?? null,
    p_next_attempt_at: result.nextAttemptAt ?? null,
    p_deactivate_token: result.deactivateToken ?? false,
  });
  if (!finalized) {
    console.warn("Delivery finalization was a no-op (claim may be stale/already finalized)", {
      delivery_id: row.delivery_id,
      requested_status: result.status,
    });
  }
  return finalized;
}

async function settleDeliveryRows(
  rows: Delivery[],
  resultForRow: (row: Delivery) => Parameters<typeof finishDelivery>[1],
): Promise<{ submitted: number; retried: number; dead: number; unfinalized: number }> {
  const outcomes = await Promise.all(rows.map(async (row) => {
    const result = resultForRow(row);
    try {
      const finalized = await finishDelivery(row, result);
      if (!finalized) return "unfinalized" as const;
      if (result.status === "SENT") return "submitted" as const;
      if (result.status === "PENDING") return "retried" as const;
      return "dead" as const;
    } catch (error) {
      // Do not let a DB finalization error fall into the Expo request catch.
      // The row remains leased; it can be recovered after lease expiry.
      console.error("Could not finalize notification delivery", {
        delivery_id: row.delivery_id,
        requested_status: result.status,
        error: String(error),
      });
      return "unfinalized" as const;
    }
  }));

  return {
    submitted: outcomes.filter((x) => x === "submitted").length,
    retried: outcomes.filter((x) => x === "retried").length,
    dead: outcomes.filter((x) => x === "dead").length,
    unfinalized: outcomes.filter((x) => x === "unfinalized").length,
  };
}

function retryOrDead(row: Delivery, detail: string): Parameters<typeof finishDelivery>[1] {
  if (row.attempt < MAX_ATTEMPTS) {
    return {
      status: "PENDING",
      error: detail,
      nextAttemptAt: new Date(Date.now() + retryDelaySeconds(row.attempt) * 1000).toISOString(),
    };
  }
  return { status: "DEAD", error: `${detail}; maximum attempts (${MAX_ATTEMPTS}) reached` };
}

async function processTicket(row: Delivery, ticket: ExpoTicket): Promise<DeliveryOutcome> {
  let result: Parameters<typeof finishDelivery>[1];

  if (ticket.status === "ok" && ticket.id) {
    result = { status: "SENT", ticketId: ticket.id };
  } else {
    const code = ticket.details?.error;
    const classified = classifyExpoError(code);
    const detail = errorText("Expo ticket error", {
      message: ticket.message,
      details: ticket.details,
    });

    if (classified.retryable && row.attempt < MAX_ATTEMPTS) {
      result = {
        status: "PENDING",
        error: detail,
        nextAttemptAt: new Date(Date.now() + retryDelaySeconds(row.attempt) * 1000).toISOString(),
        deactivateToken: classified.deactivateToken,
      };
    } else {
      result = {
        status: "DEAD",
        error: classified.retryable
          ? `${detail}; maximum attempts (${MAX_ATTEMPTS}) reached`
          : detail,
        deactivateToken: classified.deactivateToken,
      };
    }
  }

  try {
    const finalized = await finishDelivery(row, result);
    if (!finalized) return "unfinalized";
    if (result.status === "SENT") return "submitted";
    return result.status === "PENDING" ? "retried" : "dead";
  } catch (error) {
    // Expo's response has already been received. Never reinterpret a database
    // failure here as an Expo/network failure or immediately resubmit the batch.
    console.error("Could not finalize Expo ticket result", {
      delivery_id: row.delivery_id,
      expo_ticket_id: ticket.id ?? null,
      requested_status: result.status,
      error: String(error),
    });
    return "unfinalized";
  }
}

async function postExpo<T>(url: string, payload: unknown): Promise<{ response: Response; body: T | null }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EXPO_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "accept-encoding": "gzip, deflate",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    let body: T | null = null;
    try {
      body = await response.json() as T;
    } catch {
      // A non-JSON response is handled using its HTTP status below.
    }
    return { response, body };
  } finally {
    clearTimeout(timeout);
  }
}

async function processDeliveryBatch(rows: Delivery[]): Promise<{
  submitted: number;
  retried: number;
  dead: number;
  unfinalized: number;
}> {
  if (rows.length === 0) return { submitted: 0, retried: 0, dead: 0, unfinalized: 0 };

  const messages = rows.map((row) => ({
    to: row.expo_push_token,
    title: row.title,
    body: row.body,
    data: {
      ...(row.notification_data && typeof row.notification_data === "object"
        ? row.notification_data
        : {}),
      notification_id: row.notification_id,
      notification_type: row.notification_type,
      app_role: row.app_role,
    },
    sound: "default",
  }));

  // IMPORTANT: only the Expo HTTP request is inside this try/catch. Ticket
  // finalization is handled below, row by row, so a DB error cannot be mistaken
  // for a failed Expo request and trigger immediate resubmission of the batch.
  let response: Response;
  let body: { data?: ExpoTicket[] | ExpoTicket; errors?: unknown } | null;
  try {
    const result = await postExpo<{ data?: ExpoTicket[] | ExpoTicket; errors?: unknown }>(
      EXPO_PUSH_URL,
      messages,
    );
    response = result.response;
    body = result.body;
  } catch (error) {
    const detail = errorText(
      "Expo request/network failure (outcome may be ambiguous; duplicate delivery is possible)",
      String(error),
    );
    return await settleDeliveryRows(rows, (row) => retryOrDead(row, detail));
  }

  if (!response.ok) {
    const retryable = isRetryableHttpStatus(response.status);
    const detail = errorText(`Expo HTTP ${response.status}`, body);
    return await settleDeliveryRows(rows, (row) => {
      if (retryable) return retryOrDead(row, detail);
      return { status: "DEAD", error: detail };
    });
  }

  const rawTickets = body?.data;
  const tickets = Array.isArray(rawTickets) ? rawTickets : rawTickets ? [rawTickets] : [];
  
  const outcomes = await Promise.all(rows.map((row, index) => processTicket(row, tickets[index])));
  return {
    submitted: outcomes.filter((x) => x === "submitted").length,
    retried: outcomes.filter((x) => x === "retried").length,
    dead: outcomes.filter((x) => x === "dead").length,
    unfinalized: outcomes.filter((x) => x === "unfinalized").length,
  };
}

async function releaseReceiptClaim(row: ReceiptClaim): Promise<boolean> {
  const released = await rpc<boolean>("release_notification_receipt_claim", {
    p_delivery_id: row.delivery_id,
    p_claim_updated_at: row.claim_updated_at,
  });
  if (!released) {
    console.warn("Receipt claim release was a no-op (claim may be stale/already finalized)", {
      delivery_id: row.delivery_id,
    });
  }
  return released;
}

async function finishReceipt(
  row: ReceiptClaim,
  status: "DELIVERED" | "DEAD",
  error: string | null = null,
  deactivateToken = false,
): Promise<boolean> {
  const finalized = await rpc<boolean>("finish_notification_receipt", {
    p_delivery_id: row.delivery_id,
    p_claim_updated_at: row.claim_updated_at,
    p_status: status,
    p_error: error,
    p_deactivate_token: deactivateToken,
  });
  if (!finalized) {
    console.warn("Receipt finalization was a no-op (claim may be stale/already finalized)", {
      delivery_id: row.delivery_id,
      requested_status: status,
    });
  }
  return finalized;
}

async function releaseReceiptClaims(rows: ReceiptClaim[]): Promise<void> {
  const results = await Promise.allSettled(rows.map((row) => releaseReceiptClaim(row)));
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error("Could not release receipt claim; lease expiry will recover it", {
        delivery_id: rows[index].delivery_id,
        error: String(result.reason),
      });
    }
  });
}

async function processReceipts(): Promise<{
  checked: number;
  pending: number;
  delivered: number;
  dead: number;
  unfinalized: number;
}> {
  const rows = await rpc<ReceiptClaim[]>("claim_notification_receipts", {
    p_batch_size: BATCH_SIZE,
    p_lease_seconds: LEASE_SECONDS,
  });
  if (!rows?.length) return { checked: 0, pending: 0, delivered: 0, dead: 0, unfinalized: 0 };

  const ids = rows.map((row) => row.expo_ticket_id);
  let response: Response;
  let body: { data?: Record<string, ExpoReceipt>; errors?: unknown } | null;
  try {
    const result = await postExpo<{ data?: Record<string, ExpoReceipt>; errors?: unknown }>(
      EXPO_RECEIPTS_URL,
      { ids },
    );
    response = result.response;
    body = result.body;
  } catch (error) {
    console.error("Expo receipt request failed", String(error));
    await releaseReceiptClaims(rows);
    return { checked: 0, pending: rows.length, delivered: 0, dead: 0, unfinalized: 0 };
  }

  if (!response.ok || !body?.data) {
    console.error("Expo receipt endpoint returned an unsuccessful response", {
      status: response.status,
      body,
    });
    await releaseReceiptClaims(rows);
    return { checked: 0, pending: rows.length, delivered: 0, dead: 0, unfinalized: 0 };
  }

  const receiptData = body.data;
  const outcomes = await Promise.all(rows.map(async (row): Promise<"pending" | "delivered" | "dead" | "unfinalized"> => {
    const receipt = receiptData[row.expo_ticket_id];
    if (!receipt) {
      try {
        await releaseReceiptClaim(row);
        return "pending";
      } catch (error) {
        console.error("Could not release not-yet-available receipt claim", {
          delivery_id: row.delivery_id,
          error: String(error),
        });
        return "unfinalized";
      }
    }

    if (receipt.status === "ok") {
      try {
        const finalized = await finishReceipt(row, "DELIVERED");
        return finalized ? "delivered" : "unfinalized";
      } catch (error) {
        console.error("Could not finalize successful Expo receipt", {
          delivery_id: row.delivery_id,
          error: String(error),
        });
        return "unfinalized";
      }
    }

    const code = receipt.details?.error;
    const detail = errorText("Expo receipt error", {
      message: receipt.message,
      details: receipt.details,
    });
    try {
      const finalized = await finishReceipt(row, "DEAD", detail, code === "DeviceNotRegistered");
      return finalized ? "dead" : "unfinalized";
    } catch (error) {
      console.error("Could not finalize Expo receipt error", {
        delivery_id: row.delivery_id,
        error: String(error),
      });
      return "unfinalized";
    }
  }));

  return {
    checked: outcomes.filter((x) => x !== "pending" && x !== "unfinalized").length,
    pending: outcomes.filter((x) => x === "pending").length,
    delivered: outcomes.filter((x) => x === "delivered").length,
    dead: outcomes.filter((x) => x === "dead").length,
    unfinalized: outcomes.filter((x) => x === "unfinalized").length,
  };
}

async function processDeliveries(): Promise<{
  claimed: number;
  submitted: number;
  retried: number;
  dead: number;
  unfinalized: number;
}> {
  const rows = await rpc<Delivery[]>("claim_notification_deliveries", {
    p_batch_size: BATCH_SIZE,
    p_lease_seconds: LEASE_SECONDS,
    p_max_attempts: MAX_ATTEMPTS,
  });
  if (!rows?.length) return { claimed: 0, submitted: 0, retried: 0, dead: 0, unfinalized: 0 };

  const result = await processDeliveryBatch(rows);
  return { claimed: rows.length, ...result };
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const suppliedSecret = request.headers.get("x-worker-secret");
  if (!suppliedSecret || suppliedSecret !== WORKER_SECRET) {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const deliveries = await processDeliveries();
    const receipts = await processReceipts();
    return json({ ok: true, deliveries, receipts, ran_at: new Date().toISOString() });
  } catch (error) {
    console.error("Notification worker failed", error);
    return json({ ok: false, error: String(error) }, 500);
  }
});
