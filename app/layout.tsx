import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://ramonlummertz.com.br";
const TITLE = "Mentoria de carreira em tecnologia | Ramon Lummertz";
const DESCRIPTION =
  "Mentoria prática para transformar seu currículo, LinkedIn e GitHub em oportunidades reais. Diagnóstico individual, plano de ação e acompanhamento para primeiro emprego ou progressão em tech.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Ramon Lummertz",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Mentoria Ramon Lummertz",
    title: TITLE,
    description: DESCRIPTION,
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <GoogleTagManager gtmId="GTM-WRXCH87G" />
      <GoogleAnalytics gaId="G-4SCWMW4DGM" />
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
