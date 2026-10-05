import { DM_Sans } from "next/font/google";

// Layout aninhado só pra /admin (.tasks/admin-wattvision-theme.md) - escopa
// os tokens Genesis e a fonte de texto do painel, sem tocar no layout público.
const dmSans = DM_Sans({ subsets: ["latin"] });

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div
      className={`admin-theme ${dmSans.className} min-h-screen bg-[var(--wv-bg)] text-[var(--wv-text)]`}
    >
      {children}
    </div>
  );
}
