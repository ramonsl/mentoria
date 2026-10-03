// Repositório de eventos de webhook. Ver design.md ("WebhookEvent" nos Data
// Models) para o shape canônico. PK = event id do Asaas, garantindo
// idempotência (spec.md MENT-12): reenviar o mesmo event id é um no-op.

import { getSupabaseClient } from "./supabase";

export interface WebhookEvent {
  id: string;
  eventType: string;
  checkoutId: string;
  payload: Record<string, unknown>;
  processedAt: Date;
  result: "success" | "error";
  errorMessage: string | null;
}

export interface NewWebhookEvent {
  id: string;
  eventType: string;
  checkoutId: string;
  payload: Record<string, unknown>;
}

export interface RecordEventResult {
  /** false when this event id was already recorded (idempotent no-op). */
  recorded: boolean;
  event: WebhookEvent;
}

const UNIQUE_VIOLATION_CODE = "23505";

function mapRow(row: Record<string, unknown>): WebhookEvent {
  return {
    id: row.id as string,
    eventType: row.event_type as string,
    checkoutId: row.checkout_id as string,
    payload: row.payload as Record<string, unknown>,
    processedAt: new Date(row.processed_at as string),
    result: row.result as "success" | "error",
    errorMessage: (row.error_message as string | null) ?? null,
  };
}

/**
 * Records a webhook event, keyed by its Asaas event id. If the id already
 * exists (PK conflict), returns the existing record with recorded: false
 * instead of throwing - MENT-12 idempotency.
 */
export async function recordEvent(
  input: NewWebhookEvent,
): Promise<RecordEventResult> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("webhook_events")
    .insert({
      id: input.id,
      event_type: input.eventType,
      checkout_id: input.checkoutId,
      payload: input.payload,
      result: "success",
      error_message: null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION_CODE) {
      const existing = await client
        .from("webhook_events")
        .select()
        .eq("id", input.id)
        .single();

      if (existing.error) {
        throw new Error(
          `Failed to load already-processed webhook event ${input.id}: ${existing.error.message}`,
        );
      }

      return { recorded: false, event: mapRow(existing.data) };
    }

    throw new Error(`Failed to record webhook event: ${error.message}`);
  }

  return { recorded: true, event: mapRow(data) };
}

/**
 * Updates the processing outcome (success/error + message) for an
 * already-recorded event, for audit (spec.md MENT-21).
 */
export async function logOutcome(
  id: string,
  result: "success" | "error",
  errorMessage: string | null = null,
): Promise<WebhookEvent> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("webhook_events")
    .update({ result, error_message: errorMessage })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to log outcome for webhook event ${id}: ${error.message}`,
    );
  }

  return mapRow(data);
}
