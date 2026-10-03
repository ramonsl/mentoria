import { LEGAL_NOTICE_COPY } from "@/content/copy";

// Componente apresentacional puro: aviso de direito de arrependimento de 7
// dias corridos (Art. 49 CDC) - spec.md P1 "Pagar o plano escolhido" AC4
// (MENT-07). Precisa ficar visível antes da confirmação do pagamento, ou
// seja, na própria página de planos (ver T13).

export default function LegalNotice() {
  return (
    <aside className="mx-6 mb-16 rounded-2xl border border-black/10 bg-zinc-50 p-6 text-sm text-zinc-700 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 md:mx-16">
      {LEGAL_NOTICE_COPY.text}
    </aside>
  );
}
