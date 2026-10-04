import { asc, eq } from "drizzle-orm";
import type { Db } from "./db";
import { getDb } from "./db";
import { webhookEvents as webhookEventsTable } from "./schema";

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
  recorded: boolean;
  event: WebhookEvent;
}

function mapRow(
  row: typeof webhookEventsTable.$inferSelect,
): WebhookEvent {
  return {
    id: row.id,
    eventType: row.eventType,
    checkoutId: row.checkoutId,
    payload: row.payload as Record<string, unknown>,
    processedAt: row.processedAt,
    result: row.result as "success" | "error",
    errorMessage: row.errorMessage ?? null,
  };
}

export async function recordEvent(
  input: NewWebhookEvent,
  db: Db = getDb(),
): Promise<RecordEventResult> {
  try {
    const [row] = await db
      .insert(webhookEventsTable)
      .values({
        id: input.id,
        eventType: input.eventType,
        checkoutId: input.checkoutId,
        payload: input.payload,
        result: "success",
        errorMessage: null,
      })
      .returning();

    return { recorded: true, event: mapRow(row) };
  } catch (err) {
    // PK conflict = evento já processado (idempotência MENT-12)
    const isUniqueViolation =
      err instanceof Error &&
      (err.message.includes("unique") ||
        err.message.includes("duplicate") ||
        err.message.includes("23505"));

    if (!isUniqueViolation) throw err;

    const [existing] = await db
      .select()
      .from(webhookEventsTable)
      .where(eq(webhookEventsTable.id, input.id))
      .limit(1);

    if (!existing) {
      throw new Error(
        `Failed to load already-processed webhook event ${input.id}`,
      );
    }

    return { recorded: false, event: mapRow(existing) };
  }
}

/**
 * Every event recorded for one checkout, oldest first - the timeline on the
 * admin detail view (.tasks/painel-inscricoes.md critério 14).
 */
export async function listEventsByCheckoutId(
  checkoutId: string,
  db: Db = getDb(),
): Promise<WebhookEvent[]> {
  const rows = await db
    .select()
    .from(webhookEventsTable)
    .where(eq(webhookEventsTable.checkoutId, checkoutId))
    .orderBy(asc(webhookEventsTable.processedAt));

  return rows.map(mapRow);
}

export async function logOutcome(
  id: string,
  result: "success" | "error",
  errorMessage: string | null = null,
  db: Db = getDb(),
): Promise<WebhookEvent> {
  const [row] = await db
    .update(webhookEventsTable)
    .set({ result, errorMessage })
    .where(eq(webhookEventsTable.id, id))
    .returning();

  if (!row) {
    throw new Error(`Webhook event not found: ${id}`);
  }

  return mapRow(row);
}
