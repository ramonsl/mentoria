import { LEGAL_NOTICE_COPY } from "@/content/copy";

// Componente apresentacional puro: aviso de direito de arrependimento de 7
// dias corridos (Art. 49 CDC) - spec.md P1 "Pagar o plano escolhido" AC4
// (MENT-07). Precisa ficar visível antes da confirmação do pagamento, ou
// seja, na própria página de planos (ver T13).

export default function LegalNotice() {
  return (
    <div className="bg-white px-6 py-16 md:px-16 md:py-20">
      <aside className="mx-auto max-w-6xl rounded-2xl border border-blue-200 bg-blue-50 p-6 text-sm leading-6 text-blue-950">
        <span className="mr-2 font-bold text-blue-800">Compra com tranquilidade.</span>{LEGAL_NOTICE_COPY.text}
      </aside>
    </div>
  );
}
