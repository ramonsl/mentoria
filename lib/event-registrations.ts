import { desc, eq } from "drizzle-orm";
import { EVENT } from "../content/event";
import { getDb, type Db } from "./db";
import { eventRegistrations } from "./event-schema";

export interface RegistrationInput {
  name: string;
  email: string;
  whatsapp: string;
}

export type RegistrationField = keyof RegistrationInput;
export type FieldErrors = Partial<Record<RegistrationField, string>>;

export type ValidationResult =
  | { ok: true; data: RegistrationInput }
  | { ok: false; errors: FieldErrors };

export interface EventRegistration extends RegistrationInput {
  id: string;
  eventSlug: string;
  createdAt: Date;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

// Aceita DDD + número (10-11 dígitos) ou com o código do país 55 na frente.
function normalizeWhatsapp(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const local = digits.length >= 12 && digits.startsWith("55") ? digits.slice(2) : digits;
  return local.length === 10 || local.length === 11 ? local : null;
}

export function validateRegistration(raw: Record<RegistrationField, unknown>): ValidationResult {
  const errors: FieldErrors = {};

  const name = asText(raw.name).trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 120) {
    errors.name = "Informe seu nome.";
  }

  const email = asText(raw.email).trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    errors.email = "Informe um e-mail válido.";
  }

  const whatsapp = normalizeWhatsapp(asText(raw.whatsapp));
  if (!whatsapp) {
    errors.whatsapp = "Informe um WhatsApp com DDD, como (51) 99999-9999.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, data: { name, email, whatsapp: whatsapp! } };
}

export function isRegistrationClosed(now: number = Date.now()): boolean {
  return now >= EVENT.startsAt.getTime();
}

export function formatWhatsapp(digits: string): string {
  const ddd = digits.slice(0, 2);
  const number = digits.slice(2);
  const split = number.length === 9 ? 5 : 4;
  return `(${ddd}) ${number.slice(0, split)}-${number.slice(split)}`;
}

export async function createRegistration(
  eventSlug: string,
  data: RegistrationInput,
  db: Db = getDb(),
): Promise<"created" | "duplicate"> {
  const rows = await db
    .insert(eventRegistrations)
    .values({ eventSlug, ...data })
    .onConflictDoNothing({ target: [eventRegistrations.eventSlug, eventRegistrations.email] })
    .returning({ id: eventRegistrations.id });
  return rows.length > 0 ? "created" : "duplicate";
}

export async function listRegistrations(
  eventSlug: string,
  db: Db = getDb(),
): Promise<EventRegistration[]> {
  return db
    .select()
    .from(eventRegistrations)
    .where(eq(eventRegistrations.eventSlug, eventSlug))
    .orderBy(desc(eventRegistrations.createdAt));
}

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function formatRegisteredAt(date: Date): string {
  return dateTime.format(date);
}

function escapeCsvField(value: string): string {
  return /[;"\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

// `;` e BOM para o Excel em pt-BR abrir as colunas e os acentos corretamente.
export function registrationsToCsv(registrations: EventRegistration[]): string {
  const header = ["Nome", "E-mail", "WhatsApp", "Inscrito em"].join(";");
  const rows = registrations.map((r) =>
    [r.name, r.email, formatWhatsapp(r.whatsapp), formatRegisteredAt(r.createdAt)]
      .map(escapeCsvField)
      .join(";"),
  );
  return ["﻿" + header, ...rows].join("\r\n");
}
