import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://elessandro.com.br"),
  title: "Elessandro — Ferramentas e notícias",
  description: "Ferramentas práticas, notícias selecionadas, calendários de São Vicente e agenda cultural.",
  openGraph: {
    title: "Elessandro — Ferramentas, notícias e cultura",
    description: "Ferramentas práticas, calendários de São Vicente, notícias e agenda cultural.",
    url: "https://elessandro.com.br",
    siteName: "Elessandro",
    locale: "pt_BR",
    type: "website",
  },
  robots: { index: true, follow: true },
  other: { "codex-preview": "development" },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
