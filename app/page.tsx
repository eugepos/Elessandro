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
    fetch("/api/news?v=9").then((response) => response.ok ? response.json() : Promise.reject())
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

      <section className="home-section quick-section calendar-section" id="conteudo" aria-labelledby="calendar-title">
        <div className="section-heading calendar-heading"><h1 id="calendar-title">Calendários</h1></div>
        <div className="quick-grid calendar-grid">
          <a href="https://www.saovicente.sp.gov.br/institucional/calendario" target="_blank" rel="noopener noreferrer"><span>Agenda municipal</span><strong>Calendário Oficial de São Vicente</strong><small>Abrir fonte oficial ↗</small></a>
          <a href="/documentos/calendario-escolar-sao-vicente-2026.pdf" target="_blank" rel="noopener noreferrer"><span>SEDUC · BOM 584</span><strong>Calendário Escolar de São Vicente 2026</strong><small>Abrir documento ↗</small></a>
        </div>
      </section>

      <section className="home-section tools-section" id="ferramentas" aria-labelledby="tools-title">
        <div className="section-heading section-label-heading"><p className="eyebrow" id="tools-title">Ferramentas</p></div>
        <div className="tools-grid">
          <article className="tool-card"><div className="tool-topline"><small>Calculadora</small></div><h3>Descongelamento do tempo da pandemia</h3><p>Simule a recontagem do período congelado para triênio, letra e sexta-parte do magistério de São Vicente.</p><div className="tool-tags"><span>Servidor ativo</span><span>Aposentado</span></div><a href="/ferramentas/descongelamento.html">Abrir calculadora →</a></article>
          <article className="tool-card"><div className="tool-topline"><small>Conferência</small></div><h3>Conferência de descontos</h3><p>Compare a lista enviada com o retorno da Prefeitura ou IPRESV e identifique diferenças de matrícula, nome e valor.</p><div className="tool-tags"><span>Excel</span><span>Word</span><span>PDF</span></div><a href="/ferramentas/conferencia-descontos.html">Abrir conferência →</a></article>
        </div>
      </section>

      <section className="home-section news-section" id="noticias" aria-labelledby="news-title">
        <div className="section-heading row-heading section-label-heading"><p className="eyebrow" id="news-title">Notícias</p><a className="section-link" href="/noticias">Ver todas as notícias →</a></div>
        {newsLoading ? <div className="loading-state">Buscando as notícias mais recentes…</div> : news.length ? <div className="latest-grid compact-grid">{news.map((item) => <NewsCard item={item} key={item.url} />)}</div> : <div className="loading-state">As fontes estão sendo consultadas. Tente novamente em instantes.</div>}
      </section>

      <section className="home-section culture-section" id="cultura" aria-labelledby="culture-title">
        <div className="section-heading row-heading section-label-heading"><p className="eyebrow" id="culture-title">Cultura & eventos</p><a className="section-link" href="/agenda">Abrir agenda completa →</a></div>
        {eventsLoading ? <div className="loading-state">Consultando as agendas oficiais…</div> : events.length ? <div className="events-grid compact-grid">{events.map((event) => <EventCard event={event} key={`${event.title}-${event.startDate}-${event.venue}`} />)}</div> : <div className="loading-state">As agendas continuam sendo verificadas. Consulte a página completa em instantes.</div>}
      </section>

      <section className="home-section about-section" id="sobre" aria-labelledby="about-title">
        <div className="section-heading section-label-heading"><p className="eyebrow" id="about-title">Sobre o projeto</p></div>
        <div className="about-grid"><article><span>01</span><h3>Fontes identificadas</h3><p>Notícias e eventos mostram origem, data e acesso direto à publicação responsável.</p></article><article><span>02</span><h3>Sem vínculo oficial</h3><p>O site não representa Prefeitura, sindicatos, veículos de imprensa ou casas de eventos.</p></article><article><span>03</span><h3>Privacidade nas ferramentas</h3><p>Os arquivos da conferência de descontos são processados somente no navegador.</p></article></div>
        <p className="editorial-note">Notícias, agendas e regras administrativas podem mudar. Antes de tomar decisões, confirme a informação na fonte oficial ou com o setor responsável.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
