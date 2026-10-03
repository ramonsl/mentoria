import { describe, expect, it, vi } from "vitest";
import { sendWithRetry } from "./email";

// Cobre tasks.md T21 "Done when" (spec.md MENT-16): sucesso de primeira não
// tenta de novo; falha transitória seguida de sucesso ainda retorna sucesso;
// 3 falhas seguidas desistem e propagam o erro final.

describe("sendWithRetry", () => {
  it("sucesso na 1ª tentativa não tenta de novo", async () => {
    const fn = vi.fn().mockResolvedValue("ok");

    const result = await sendWithRetry(fn);

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("falha na 1ª tentativa seguida de sucesso na 2ª retorna sucesso", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("transient failure"))
      .mockResolvedValueOnce("ok-on-2nd");

    const result = await sendWithRetry(fn);

    expect(result).toBe("ok-on-2nd");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("falha nas 2 primeiras tentativas seguida de sucesso na 3ª retorna sucesso", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("failure 1"))
      .mockRejectedValueOnce(new Error("failure 2"))
      .mockResolvedValueOnce("ok-on-3rd");

    const result = await sendWithRetry(fn);

    expect(result).toBe("ok-on-3rd");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("3 falhas seguidas desistem e propagam o erro final para quem chamou", async () => {
    const finalError = new Error("final failure");
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("failure 1"))
      .mockRejectedValueOnce(new Error("failure 2"))
      .mockRejectedValueOnce(finalError);

    await expect(sendWithRetry(fn)).rejects.toBe(finalError);
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
