import { Inter } from "next/font/google";

// Layout aninhado só pra /admin (.tasks/admin-wattvision-theme.md) - escopa
// o tema escuro WattVision e a tipografia Inter a estas 3 telas sem tocar o
// layout público (app/layout.tsx), que mantém Geist e o tema claro.
const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div
      className={`admin-theme ${inter.className} min-h-screen bg-[var(--wv-bg)] text-[var(--wv-text)]`}
    >
      {children}
    </div>
  );
}
