"use server";

import { EVENT } from "@/content/event";
import {
  createRegistration,
  isRegistrationClosed,
  validateRegistration,
  type FieldErrors,
  type RegistrationInput,
} from "@/lib/event-registrations";

export type RegistrationState =
  | { status: "idle" }
  | { status: "success" | "duplicate" | "closed" }
  | { status: "invalid"; errors: FieldErrors; values: RegistrationInput }
  | { status: "error"; values: RegistrationInput };

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function registerForEvent(
  _prev: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  if (isRegistrationClosed()) {
    return { status: "closed" };
  }

  // Campo invisível: só robôs preenchem. Responde como sucesso sem gravar.
  if (field(formData, "website")) {
    return { status: "success" };
  }

  const values = {
    name: field(formData, "name"),
    email: field(formData, "email"),
    whatsapp: field(formData, "whatsapp"),
  };
  const result = validateRegistration(values);
  if (!result.ok) {
    return { status: "invalid", errors: result.errors, values };
  }

  try {
    const outcome = await createRegistration(EVENT.slug, result.data);
    return { status: outcome === "created" ? "success" : "duplicate" };
  } catch (error) {
    console.error("Falha ao gravar inscrição no evento", error);
    return { status: "error", values };
  }
}
