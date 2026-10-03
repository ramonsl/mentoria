import { FAQ_ITEMS } from "@/content/faq";

// Componente apresentacional puro: perguntas frequentes (spec.md P2 "FAQ"
// AC1, MENT-24).

export default function FaqSection() {
  return (
    <section className="flex flex-col gap-8 px-6 py-16 md:px-16">
      <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
        Perguntas frequentes
      </h2>

      <dl className="flex flex-col gap-6">
        {FAQ_ITEMS.map((item) => (
          <div key={item.question} className="flex flex-col gap-2">
            <dt className="text-base font-medium text-black dark:text-zinc-50">
              {item.question}
            </dt>
            <dd className="text-sm text-zinc-600 dark:text-zinc-400">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
