import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agenda cultural — Elessandro Eugênio",
  description: "Agenda cultural automática da Baixada Santista, regiões próximas e São Paulo.",
  alternates: { canonical: "/agenda" },
};

export default function AgendaLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
