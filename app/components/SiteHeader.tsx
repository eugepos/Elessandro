"use client";

import { useState } from "react";

type SiteHeaderProps = { active?: "inicio" | "noticias" | "agenda" };

export default function SiteHeader({ active = "inicio" }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="header-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Ir para a página inicial" onClick={closeMenu}>
          <span>Elessandro Eugênio</span>
          <small>meu espaço</small>
        </a>
        <nav id="main-navigation" className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Navegação principal">
          <a className={active === "inicio" ? "active" : ""} href="/" onClick={closeMenu}>Início</a>
          <a href="/#ferramentas" onClick={closeMenu}>Ferramentas</a>
          <a className={active === "noticias" ? "active" : ""} href="/noticias" onClick={closeMenu}>Notícias</a>
          <a className={active === "agenda" ? "active" : ""} href="/agenda" onClick={closeMenu}>Agenda cultural</a>
          <a href="/#sobre" onClick={closeMenu}>Sobre</a>
          <a className="calendar-nav" href="https://www.saovicente.sp.gov.br/institucional/calendario" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>Calendário SV ↗</a>
        </nav>
        <button className="menu-button" type="button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-controls="main-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          <span /><span />
        </button>
      </header>
    </div>
  );
}
