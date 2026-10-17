import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import EventRegistrationForm from "@/components/event/EventRegistrationForm";
import { EVENT, EVENT_COPY } from "@/content/event";
import { isRegistrationClosed } from "@/lib/event-registrations";

// Renderizada por requisição para que o formulário feche sozinho quando o
// evento começar, sem depender de um novo deploy.
export const dynamic = "force-dynamic";

const DESCRIPTION =
  "Palestra online e gratuita com Ramon Lummertz em 2 de novembro, às 19h: o plano que ele seguiria hoje para entrar no mercado de tecnologia.";

export const metadata: Metadata = {
  title: "Palestra: Se eu tivesse 20 anos",
  description: DESCRIPTION,
  alternates: { canonical: EVENT.path },
  openGraph: {
    url: EVENT.path,
    title: EVENT_COPY.title,
    description: DESCRIPTION,
  },
  twitter: {
    title: EVENT_COPY.title,
    description: DESCRIPTION,
  },
};

const DETAILS = [
  { label: "Data", value: EVENT.dateLabel },
  { label: "Horário", value: EVENT.timeLabel },
  { label: "Formato", value: EVENT.formatLabel },
  { label: "Investimento", value: EVENT.priceLabel },
];

export default function EventPage() {
  const closed = isRegistrationClosed();

  return (
    <>
      <header className="bg-[var(--navy-deep)] px-6 py-4 md:px-16">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-wide text-white">
            <Image src="/logo-rl.svg" alt="" width={32} height={32} className="h-8 w-8" />
            <span>RAMON LUMMERTZ</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-blue-100 transition-colors hover:text-white">
            Conheça a mentoria
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="relative overflow-hidden bg-[var(--navy-deep)] px-6 pb-16 pt-10 text-white md:px-16 md:pb-24 md:pt-16">
          <div aria-hidden="true" className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div className="flex flex-col gap-6">
              <span className="w-fit rounded-full border border-blue-300/30 bg-blue-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-blue-100">
                {EVENT_COPY.eyebrow}
              </span>
              <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight md:text-5xl">
                {EVENT_COPY.title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">{EVENT_COPY.subtitle}</p>
              <dl className="grid grid-cols-2 gap-3">
                {DETAILS.map((detail) => (
                  <div key={detail.label} className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-200">{detail.label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-white">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div id="inscricao" className="scroll-mt-6 rounded-3xl bg-white p-7 text-[var(--ink)] shadow-2xl md:p-8">
              <h2 className="text-2xl font-bold tracking-tight">{EVENT_COPY.form.title}</h2>
              <p className="mb-6 mt-2 text-sm leading-6 text-[var(--muted)]">{EVENT_COPY.form.description}</p>
              <EventRegistrationForm closed={closed} />
            </div>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-20 md:px-16">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">{EVENT_COPY.topicsTitle}</h2>
          <ol className="grid gap-4 md:grid-cols-2">
            {EVENT_COPY.topics.map((topic, index) => (
              <li key={topic} className="flex gap-4 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-base leading-7 text-[var(--ink)]">{topic}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-white px-6 py-20 md:px-16">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
            <div className="flex flex-col gap-5">
              <h2 className="text-3xl font-bold tracking-tight text-[var(--ink)]">{EVENT_COPY.audienceTitle}</h2>
              <ul className="flex flex-col gap-3 text-base leading-7 text-[var(--muted)]">
                {EVENT_COPY.audience.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden="true" className="font-bold text-blue-700">★</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-5">
              <h2 className="text-3xl font-bold tracking-tight text-[var(--ink)]">{EVENT_COPY.speakerTitle}</h2>
              <div className="flex items-start gap-5">
                <Image
                  src="/mentor.jpg"
                  alt={`Foto de ${EVENT_COPY.speakerName}`}
                  width={240}
                  height={240}
                  className="h-24 w-24 shrink-0 rounded-3xl object-cover shadow-lg md:h-28 md:w-28"
                />
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-bold text-[var(--ink)]">{EVENT_COPY.speakerName}</p>
                  <p className="text-sm font-semibold text-blue-700">{EVENT_COPY.speakerRole}</p>
                  <p className="text-sm leading-6 text-[var(--muted)]">{EVENT_COPY.speakerBio}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {closed ? null : (
          <section className="mx-6 mb-12 mt-12 flex flex-col items-center gap-5 rounded-[2rem] bg-[var(--navy-deep)] px-6 py-14 text-center text-white md:mx-16 md:px-16">
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight">{EVENT_COPY.finalCta.title}</h2>
            <p className="text-sm text-slate-300">
              {EVENT.dateLabel} · {EVENT.timeLabel} · {EVENT.formatLabel} · {EVENT.priceLabel}
            </p>
            <a
              href="#inscricao"
              className="rounded-full bg-[var(--warm)] px-7 py-3 text-base font-bold text-[var(--navy-deep)] transition-transform hover:-translate-y-0.5 hover:bg-amber-300"
            >
              {EVENT_COPY.finalCta.buttonLabel}
            </a>
          </section>
        )}
      </main>

      <footer className="border-t border-[var(--line)] px-6 py-8 text-center text-xs text-[var(--muted)] md:px-16">
        © {new Date().getFullYear()} Ramon dos Santos Lummertz ·{" "}
        <Link href="/" className="underline underline-offset-2">Mentoria de carreira</Link> ·{" "}
        <a href="/privacidade" className="underline underline-offset-2">Política de privacidade</a>
      </footer>
    </>
  );
}
