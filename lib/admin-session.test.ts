import { describe, expect, it } from "vitest";
import {
  createAdminSessionToken,
  isValidAdminSessionToken,
  timingSafeEqual,
} from "./admin-session";

// Cobre a infraestrutura mínima necessária para T37 (rota de login): o
// contrato do cookie de sessão nunca guarda a senha em texto puro e a
// validação é determinística/consistente entre chamadas (T38, middleware,
// depende disso para recomputar o mesmo valor sem storage compartilhado).

describe("createAdminSessionToken", () => {
  it("nunca retorna a senha em texto puro", async () => {
    const token = await createAdminSessionToken("minha-senha-secreta");

    expect(token).not.toBe("minha-senha-secreta");
    expect(token).not.toContain("minha-senha-secreta");
  });

  it("é determinístico: a mesma senha sempre gera o mesmo token", async () => {
    const tokenA = await createAdminSessionToken("senha-fixa");
    const tokenB = await createAdminSessionToken("senha-fixa");

    expect(tokenA).toBe(tokenB);
  });

  it("senhas diferentes geram tokens diferentes", async () => {
    const tokenA = await createAdminSessionToken("senha-um");
    const tokenB = await createAdminSessionToken("senha-dois");

    expect(tokenA).not.toBe(tokenB);
  });
});

describe("isValidAdminSessionToken", () => {
  it("retorna true para o token correspondente à senha atual", async () => {
    const token = await createAdminSessionToken("senha-atual");

    expect(await isValidAdminSessionToken(token, "senha-atual")).toBe(true);
  });

  it("retorna false para um token que não corresponde à senha atual", async () => {
    expect(await isValidAdminSessionToken("token-invalido", "senha-atual")).toBe(
      false,
    );
  });

  it("retorna false quando o cookie está ausente", async () => {
    expect(await isValidAdminSessionToken(null, "senha-atual")).toBe(false);
    expect(await isValidAdminSessionToken(undefined, "senha-atual")).toBe(
      false,
    );
  });
});

describe("timingSafeEqual", () => {
  it("retorna true para strings idênticas", () => {
    expect(timingSafeEqual("abc123", "abc123")).toBe(true);
  });

  it("retorna false para strings diferentes de mesmo tamanho", () => {
    expect(timingSafeEqual("abc123", "abc124")).toBe(false);
  });

  it("retorna false para strings de tamanhos diferentes", () => {
    expect(timingSafeEqual("abc", "abcdef")).toBe(false);
  });
});
