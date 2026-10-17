import { describe, expect, it } from "vitest";
import type { Db } from "./db";
import {
  createRegistration,
  formatWhatsapp,
  isRegistrationClosed,
  registrationsToCsv,
  validateRegistration,
  type EventRegistration,
} from "./event-registrations";

const VALID = { name: "Ana Lima", email: "ana@example.com", whatsapp: "(51) 99999-8888" };

describe("validateRegistration", () => {
  it("normaliza nome, e-mail e WhatsApp válidos", () => {
    const result = validateRegistration({
      name: "  Ana   Lima ",
      email: " Ana@Example.COM ",
      whatsapp: "+55 (51) 99999-8888",
    });
    expect(result).toEqual({
      ok: true,
      data: { name: "Ana Lima", email: "ana@example.com", whatsapp: "51999998888" },
    });
  });

  it("aceita telefone fixo com DDD (10 dígitos)", () => {
    const result = validateRegistration({ ...VALID, whatsapp: "51 3333-4444" });
    expect(result.ok && result.data.whatsapp).toBe("5133334444");
  });

  it("aponta cada campo inválido", () => {
    const result = validateRegistration({ name: "A", email: "ana@", whatsapp: "9999" });
    expect(result.ok).toBe(false);
    expect(!result.ok && Object.keys(result.errors).sort()).toEqual(["email", "name", "whatsapp"]);
  });

  it("trata campos ausentes como inválidos", () => {
    const result = validateRegistration({ name: null, email: undefined, whatsapp: 42 });
    expect(result.ok).toBe(false);
  });
});

describe("formatWhatsapp", () => {
  it("formata celular e fixo", () => {
    expect(formatWhatsapp("51999998888")).toBe("(51) 99999-8888");
    expect(formatWhatsapp("5133334444")).toBe("(51) 3333-4444");
  });
});

function fakeDb(returned: { id: string }[]) {
  const calls: { values?: unknown; target?: unknown } = {};
  const db = {
    insert: () => ({
      values: (values: unknown) => {
        calls.values = values;
        return {
          onConflictDoNothing: (opts: { target: unknown }) => {
            calls.target = opts.target;
            return { returning: async () => returned };
          },
        };
      },
    }),
  } as unknown as Db;
  return { db, calls };
}

describe("createRegistration", () => {
  const data = { name: "Ana Lima", email: "ana@example.com", whatsapp: "51999998888" };

  it("grava a inscrição com o slug do evento", async () => {
    const { db, calls } = fakeDb([{ id: "id-1" }]);
    expect(await createRegistration("palestra", data, db)).toBe("created");
    expect(calls.values).toEqual({ eventSlug: "palestra", ...data });
  });

  it("devolve duplicate quando o e-mail já está inscrito no evento", async () => {
    const { db } = fakeDb([]);
    expect(await createRegistration("palestra", data, db)).toBe("duplicate");
  });
});

describe("registrationsToCsv", () => {
  it("gera cabeçalho com BOM, separa por ; e escapa aspas", () => {
    const rows: EventRegistration[] = [
      {
        id: "1",
        eventSlug: "palestra",
        name: 'Ana "Nana" Lima',
        email: "ana@example.com",
        whatsapp: "51999998888",
        createdAt: new Date("2026-10-20T15:30:00Z"),
      },
    ];
    const [header, line] = registrationsToCsv(rows).split("\r\n");
    expect(header).toBe("﻿Nome;E-mail;WhatsApp;Inscrito em");
    expect(line).toBe('"Ana ""Nana"" Lima";ana@example.com;(51) 99999-8888;20/10/2026, 12:30');
  });
});

describe("isRegistrationClosed", () => {
  it("fecha as inscrições no horário de início (02/11/2026 19h, Brasília)", () => {
    expect(isRegistrationClosed(Date.parse("2026-11-02T21:59:59Z"))).toBe(false);
    expect(isRegistrationClosed(Date.parse("2026-11-02T22:00:00Z"))).toBe(true);
  });
});
