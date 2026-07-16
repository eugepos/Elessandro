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
  title: "Elessandro Eugênio — Meu espaço",
  description: "Meu espaço de ferramentas para o trabalho, notícias selecionadas e agenda cultural de São Vicente, Baixada Santista e São Paulo.",
  alternates: { canonical: "/" },
  authors: [{ name: "Elessandro Eugênio", url: "https://elessandro.com.br" }],
  openGraph: {
    title: "Elessandro Eugênio — Meu espaço",
    description: "Ferramentas para o trabalho, notícias selecionadas e agenda cultural organizada em um só lugar.",
    url: "https://elessandro.com.br",
    siteName: "Elessandro Eugênio",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/og.png", width: 1732, height: 909, alt: "Elessandro Eugênio — Meu espaço de ferramentas e informação" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Elessandro Eugênio — Meu espaço",
    description: "Ferramentas para o trabalho, notícias selecionadas e agenda cultural organizada em um só lugar.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
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
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Elessandro Eugênio — Meu espaço",
    url: "https://elessandro.com.br",
    description: "Ferramentas para o trabalho, notícias selecionadas e agenda cultural.",
    author: {
      "@type": "Person",
      name: "Elessandro Eugênio",
      url: "https://elessandro.com.br",
      sameAs: ["https://github.com/eugepos"],
    },
    inLanguage: "pt-BR",
  };

  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {children}
      </body>
    </html>
  );
}
