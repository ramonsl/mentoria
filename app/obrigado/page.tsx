// Página de obrigado pós-pagamento (spec.md P1 "Página de obrigado", MENT-22).
// lib/asaas.ts (T14) já aponta callback.successUrl do Asaas Checkout pra cá.

import type { Metadata } from "next";
import Link from "next/link";
import { THANK_YOU_COPY } from "@/content/copy";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ObrigadoPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-3xl font-bold">{THANK_YOU_COPY.title}</h1>
      <p className="max-w-xl">{THANK_YOU_COPY.text}</p>
      <p className="max-w-xl text-sm">{THANK_YOU_COPY.secondaryText}</p>
      <Link href={THANK_YOU_COPY.buttonHref} className="underline">
        {THANK_YOU_COPY.buttonLabel}
      </Link>
    </main>
  );
}
