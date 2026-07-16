"use client";

import { useEffect, useState } from "react";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import { EventCard, EventItem, NewsCard, NewsItem } from "./components/content";

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news?v=5").then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setNews((data.items || []).slice(0, 3)))
      .catch(() => setNews([])).finally(() => setNewsLoading(false));
    fetch("/api/events?v=7").then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setEvents((data.items || []).slice(0, 6)))
      .catch(() => setEvents([])).finally(() => setEventsLoading(false));
  }, []);

  return (
    <main id="inicio">
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <SiteHeader active="inicio" />

      <section className="hero compact-hero" id="conteudo" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Meu espaço de trabalho e consulta</p>
          <h1 id="hero-title">Ferramentas e informação para o meu dia a dia.</h1>
          <p>Um ponto de partida pessoal para trabalhar, consultar notícias e encontrar programas culturais em São Vicente, na Baixada Santista e em São Paulo.</p>
          <div className="hero-actions"><a className="primary-action" href="#ferramentas">Abrir ferramentas ↓</a><a className="secondary-action" href="/agenda">Ver agenda cultural →</a></div>
        </div>
        <aside className="purpose-card" aria-label="Finalidade do site">
          <span>Meu espaço</span>
          <strong>O essencial, sem excesso.</strong>
          <p>Ferramentas primeiro. Notícias e agenda em resumos rápidos, com páginas próprias quando eu quiser consultar tudo.</p>
        </aside>
      </section>

      <section className="home-section tools-section" id="ferramentas" aria-labelledby="tools-title">
        <div className="section-heading row-heading"><div><p className="eyebrow">Ferramentas</p><h2 id="tools-title">Resolva sem complicação.</h2><p>Funcionam diretamente no navegador, inclusive no celular.</p></div></div>
        <div className="tools-grid">
          <article className="tool-card"><div className="tool-topline"><span>01</span><small>Calculadora</small></div><h3>Descongelamento do tempo da pandemia</h3><p>Simule a recontagem do período congelado para triênio, letra e sexta-parte do magistério de São Vicente.</p><div className="tool-tags"><span>Servidor ativo</span><span>Aposentado</span></div><a href="/ferramentas/descongelamento.html">Abrir calculadora →</a></article>
          <article className="tool-card"><div className="tool-topline"><span>02</span><small>Conferência</small></div><h3>Conferência de descontos</h3><p>Compare a lista enviada com o retorno da Prefeitura ou IPRESV e identifique diferenças de matrícula, nome e valor.</p><div className="tool-tags"><span>Excel</span><span>Word</span><span>PDF</span></div><a href="/ferramentas/conferencia-descontos.html">Abrir conferência →</a></article>
        </div>
      </section>

      <section className="home-section quick-section" aria-labelledby="quick-title">
        <div className="section-heading"><p className="eyebrow">Acessos rápidos</p><h2 id="quick-title">Abra o que você usa mais.</h2></div>
        <div className="quick-grid">
          <a href="https://www.saovicente.sp.gov.br/institucional/calendario" target="_blank" rel="noopener noreferrer"><span>Agenda municipal</span><strong>Calendário Oficial de São Vicente</strong><small>Abrir fonte oficial ↗</small></a>
          <a href="/documentos/calendario-escolar-sao-vicente-2026.pdf" target="_blank" rel="noopener noreferrer"><span>SEDUC · BOM 584</span><strong>Calendário Escolar de São Vicente 2026</strong><small>Abrir documento ↗</small></a>
          <a href="/agenda"><span>Cultura e eventos</span><strong>Agenda automática completa</strong><small>Explorar agenda →</small></a>
        </div>
      </section>

      <section className="home-section news-section" id="noticias" aria-labelledby="news-title">
        <div className="section-heading row-heading"><div><p className="eyebrow">Notícias</p><h2 id="news-title">O que chegou agora.</h2><p>Três leituras recentes, com fonte e data visíveis.</p></div><a className="section-link" href="/noticias">Ver todas as notícias →</a></div>
        {newsLoading ? <div className="loading-state">Buscando as notícias mais recentes…</div> : news.length ? <div className="latest-grid compact-grid">{news.map((item) => <NewsCard item={item} key={item.url} />)}</div> : <div className="loading-state">As fontes estão sendo consultadas. Tente novamente em instantes.</div>}
      </section>

      <section className="home-section culture-section" id="cultura" aria-labelledby="culture-title">
        <div className="section-heading row-heading"><div><p className="eyebrow">Cultura & eventos</p><h2 id="culture-title">Uma seleção para começar.</h2><p>Seis opções recentes da Baixada Santista, regiões próximas e São Paulo.</p></div><a className="section-link" href="/agenda">Abrir agenda completa →</a></div>
        {eventsLoading ? <div className="loading-state">Consultando as agendas oficiais…</div> : events.length ? <div className="events-grid compact-grid">{events.map((event) => <EventCard event={event} key={`${event.title}-${event.startDate}-${event.venue}`} />)}</div> : <div className="loading-state">As agendas continuam sendo verificadas. Consulte a página completa em instantes.</div>}
      </section>

      <section className="home-section about-section" id="sobre" aria-labelledby="about-title">
        <div className="section-heading"><p className="eyebrow">Sobre o projeto</p><h2 id="about-title">Meu espaço, organizado do meu jeito.</h2><p>Reúne ferramentas e informações que uso no trabalho, no sindicato e no dia a dia, com atenção especial a São Vicente e à Baixada Santista.</p></div>
        <div className="about-grid"><article><span>01</span><h3>Fontes identificadas</h3><p>Notícias e eventos mostram origem, data e acesso direto à publicação responsável.</p></article><article><span>02</span><h3>Sem vínculo oficial</h3><p>O site não representa Prefeitura, sindicatos, veículos de imprensa ou casas de eventos.</p></article><article><span>03</span><h3>Privacidade nas ferramentas</h3><p>Os arquivos da conferência de descontos são processados somente no navegador.</p></article></div>
        <p className="editorial-note">Notícias, agendas e regras administrativas podem mudar. Antes de tomar decisões, confirme a informação na fonte oficial ou com o setor responsável.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
