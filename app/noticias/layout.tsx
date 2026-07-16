import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notícias — Elessandro Eugênio",
  description: "Notícias selecionadas e organizadas por assunto, com fonte e data visíveis.",
  alternates: { canonical: "/noticias" },
};

export default function NewsLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
