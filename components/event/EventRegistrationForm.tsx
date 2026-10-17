"use client";

import { useActionState } from "react";
import { registerForEvent, type RegistrationState } from "@/app/palestra/actions";
import { EVENT_COPY } from "@/content/event";
import type { RegistrationField } from "@/lib/event-registrations";

const INITIAL_STATE: RegistrationState = { status: "idle" };

const FIELDS: {
  name: RegistrationField;
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  inputMode?: "email" | "tel";
}[] = [
  { name: "name", label: "Nome", type: "text", autoComplete: "name", placeholder: "Seu nome" },
  { name: "email", label: "E-mail", type: "email", autoComplete: "email", placeholder: "voce@email.com", inputMode: "email" },
  { name: "whatsapp", label: "WhatsApp", type: "tel", autoComplete: "tel", placeholder: "(51) 99999-9999", inputMode: "tel" },
];

function Confirmation({ title, text }: { title: string; text: string }) {
  return (
    <div role="status" className="flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
      <p className="text-lg font-bold">{title}</p>
      <p className="text-sm leading-6">{text}</p>
    </div>
  );
}

export default function EventRegistrationForm({ closed }: { closed: boolean }) {
  const [state, formAction, pending] = useActionState(registerForEvent, INITIAL_STATE);

  if (closed || state.status === "closed") {
    return <Confirmation {...EVENT_COPY.closed} />;
  }
  if (state.status === "success") {
    return <Confirmation {...EVENT_COPY.success} />;
  }
  if (state.status === "duplicate") {
    return <Confirmation {...EVENT_COPY.duplicate} />;
  }

  const errors = state.status === "invalid" ? state.errors : {};
  const values = state.status === "invalid" || state.status === "error" ? state.values : undefined;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      {FIELDS.map((f) => (
        <label key={f.name} className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--ink)]">
          {f.label}
          <input
            name={f.name}
            type={f.type}
            autoComplete={f.autoComplete}
            inputMode={f.inputMode}
            placeholder={f.placeholder}
            defaultValue={values?.[f.name]}
            required
            aria-invalid={errors[f.name] ? true : undefined}
            aria-describedby={errors[f.name] ? `${f.name}-error` : undefined}
            className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-base font-normal text-[var(--ink)] outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 aria-[invalid]:border-rose-400"
          />
          {errors[f.name] ? (
            <span id={`${f.name}-error`} className="text-xs font-medium text-rose-600">
              {errors[f.name]}
            </span>
          ) : null}
        </label>
      ))}

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Não preencha este campo
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "error" ? (
        <p role="alert" className="text-sm font-medium text-rose-600">
          Não foi possível concluir sua inscrição agora. Tente novamente em instantes.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[var(--warm)] px-6 py-3.5 text-base font-bold text-[var(--navy-deep)] transition-transform hover:-translate-y-0.5 hover:bg-amber-300 disabled:translate-y-0 disabled:opacity-70"
      >
        {pending ? EVENT_COPY.form.pendingLabel : EVENT_COPY.form.submitLabel}
      </button>

      <p className="text-xs leading-5 text-[var(--muted)]">
        {EVENT_COPY.form.consent}{" "}
        <a href="/privacidade" className="underline underline-offset-2">
          Política de privacidade
        </a>
        .
      </p>
    </form>
  );
}
