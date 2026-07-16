"use client";

import { useEffect, useMemo, useState } from "react";

type NewsItem = { title: string; translatedTitle?: string | null; description: string; url: string; publishedAt: string; source: string; category: string; language: "pt" | "en" };
type EventItem = { title: string; description: string; startDate: string; endDate?: string; url: string; image?: string; venue: string; city: string; price?: string; currency?: string; category: string; badge: string; source: string };

const newsCategories = [
  { icon: "↗", title: "Investimentos e economia", text: "Mercados, indicadores e decisões que afetam seu dinheiro.", sources: "InfoMoney · Investing Brasil" },
  { icon: "◎", title: "Educação e servidores", text: "Magistério, funcionalismo, sindicatos e legislação.", sources: "Fontes oficiais em validação" },
  { icon: "✦", title: "Tecnologia e IA", text: "Novidades práticas sobre tecnologia e inteligência artificial.", sources: "Tecnoblog · Canaltech · Olhar Digital" },
  { icon: "⌖", title: "Baixada Santista", text: "Principais fatos da região, incluindo ocorrências e serviços.", sources: "G1 Santos · Diário do Litoral" },
  { icon: "◉", title: "Brasil e mundo", text: "Os acontecimentos realmente importantes, sem repetição.", sources: "Agência Brasil · BBC News Brasil" },
  { icon: "!", title: "Alertas oficiais", text: "Publicações que pedem atenção: carreira, benefícios e atos públicos.", sources: "Conexões oficiais em validação" },
];

const eventFilters = ["Para você", "Shows", "Teatro", "Museus e História", "Cinema e séries", "Cultura e oficinas", "Gratuitos"];

const currentHighlights = [
  { type: "Show", badge: "Imperdível para você", title: "Humberto Gessinger", text: "Apresentação no Tokio Marine Hall.", date: "2026-08-22T22:00:00-03:00", dateLabel: "22 ago · 22h", place: "Tokio Marine Hall · São Paulo", url: "https://www.tokiomarinehall.com.br/shows/" },
  { type: "Show internacional", badge: "Combina com você", title: "Eagle-Eye Cherry", text: "World Tour 2026 em São Paulo.", date: "2026-07-25T22:00:00-03:00", dateLabel: "25 jul · 22h", place: "Tokio Marine Hall · São Paulo", url: "https://www.tokiomarinehall.com.br/shows/" },
].filter((event) => new Date(event.date).getTime() > Date.now());

const officialAgendas = [
  { name: "Calendário de São Vicente", kind: "Agenda municipal", url: "https://www.saovicente.sp.gov.br/institucional/calendario" },
  { name: "Calendário Escolar 2026", kind: "SEDUC São Vicente", url: "/documentos/calendario-escolar-sao-vicente-2026.pdf" },
  { name: "Tokio Marine Hall", kind: "Shows", url: "https://www.tokiomarinehall.com.br/shows/" },
  { name: "MIS São Paulo", kind: "Exposições", url: "https://mis-sp.org.br/" },
  { name: "Sesc São Paulo", kind: "Cultura", url: "https://www.sescsp.org.br/programacao/" },
  { name: "Sympla Santos", kind: "Eventos", url: "https://www.sympla.com.br/eventos/santos-sp" },
  { name: "Ticketmaster", kind: "Grandes shows", url: "https://www.ticketmaster.com.br/" },
  { name: "Museu do Café", kind: "História", url: "https://www.museudocafe.org.br/" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [eventFilter, setEventFilter] = useState("Para você");
  const [liveNews, setLiveNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [activeSources, setActiveSources] = useState(0);
  const [unavailableSources, setUnavailableSources] = useState(0);
  const [newsCategory, setNewsCategory] = useState("Todos");
  const [liveEvents, setLiveEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsUpdatedAt, setEventsUpdatedAt] = useState("");
  const [eventSourceNames, setEventSourceNames] = useState<string[]>([]);
  const [eventTotalSources, setEventTotalSources] = useState(0);
  const automaticEvents = useMemo(() => eventFilter === "Para você" ? liveEvents : eventFilter === "Gratuitos" ? liveEvents.filter((item) => item.price === "0") : liveEvents.filter((item) => item.category === eventFilter), [eventFilter, liveEvents]);
  const visibleNews = useMemo(() => newsCategory === "Todos" ? liveNews : liveNews.filter((item) => item.category === newsCategory), [liveNews, newsCategory]);

  useEffect(() => {
    fetch("/api/news?v=4").then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => { setLiveNews(data.items || []); setActiveSources(data.activeSources || 0); setUnavailableSources(data.unavailableSources || 0); })
      .catch(() => setLiveNews([])).finally(() => setNewsLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/events?v=6").then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => { setLiveEvents(data.items || []); setEventsUpdatedAt(data.updatedAt || ""); setEventSourceNames((data.sources || []).filter((source: { status: string }) => source.status === "active").map((source: { name: string }) => source.name)); setEventTotalSources(data.totalSources || 0); })
      .catch(() => setLiveEvents([])).finally(() => setEventsLoading(false));
  }, []);

  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Data não informada" : new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
  };
  const formatEventDate = (value: string, endValue?: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Data a confirmar";
    const end = endValue ? new Date(endValue) : null;
    const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
    const time = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date);
    if (end && !Number.isNaN(end.getTime()) && end.toDateString() !== date.toDateString()) {
      return `${day} – ${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(end)} · ${time}`;
    }
    return `${day} · ${time}`;
  };

  return (
    <main id="inicio">
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Ir para o início"><span>Elessandro</span><small>ferramentas & notícias</small></a>
        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Navegação principal">
          <a href="#ferramentas" onClick={() => setMenuOpen(false)}>Ferramentas</a>
          <a href="#noticias" onClick={() => setMenuOpen(false)}>Notícias</a>
          <a href="#cultura" onClick={() => setMenuOpen(false)}>Cultura & Eventos</a>
          <a className="calendar-nav" href="https://www.saovicente.sp.gov.br/institucional/calendario" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>Calendário SV ↗</a>
        </nav>
        <button className="menu-button" type="button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /></button>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Seu ponto de partida</p>
          <h1 id="hero-title">O que importa, bem organizado.</h1>
          <p>Ferramentas úteis, notícias selecionadas e uma agenda cultural feita para o seu gosto — sem excesso de informação.</p>
          <div className="hero-actions"><a className="primary-action" href="#noticias">Ver notícias <span aria-hidden="true">↓</span></a><a className="secondary-action" href="#cultura">Explorar eventos</a></div>
          <a className="calendar-highlight" href="https://www.saovicente.sp.gov.br/institucional/calendario" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">▦</span><div><small>Acesso rápido</small><strong>Calendário Oficial de São Vicente</strong></div><b aria-hidden="true">↗</b></a>
          <a className="calendar-highlight school" href="/documentos/calendario-escolar-sao-vicente-2026.pdf" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">▤</span><div><small>SEDUC · BOM 584</small><strong>Calendário Escolar de São Vicente 2026</strong></div><b aria-hidden="true">↗</b></a>
        </div>
        <aside className="summary-card" aria-label="Resumo do site">
          <p className="card-label">Neste espaço</p>
          <strong>Informação com propósito</strong>
          <ul><li><span>01</span>Ferramentas prontas para usar</li><li><span>02</span>Notícias por assunto e fonte</li><li><span>03</span>Cultura escolhida para você</li><li><span>04</span>Calendários oficiais de São Vicente</li></ul>
          <small>Todo conteúdo externo exibirá fonte, data e acesso à publicação original.</small>
        </aside>
      </section>

      <section className="tools-section" id="ferramentas" aria-labelledby="tools-title">
        <div className="section-heading"><p className="eyebrow">Ferramentas</p><h2 id="tools-title">Resolva sem complicação.</h2><p>As ferramentas funcionam diretamente no navegador, inclusive no celular.</p></div>
        <div className="tools-grid">
          <article className="tool-card"><div className="tool-topline"><span>01</span><small>Calculadora</small></div><h3>Descongelamento do tempo da pandemia</h3><p>Simule a recontagem do período congelado para triênio, letra e sexta-parte do magistério de São Vicente.</p><div className="tool-tags"><span>Servidor ativo</span><span>Aposentado</span></div><a href="/ferramentas/descongelamento.html">Abrir calculadora <span aria-hidden="true">→</span></a></article>
          <article className="tool-card"><div className="tool-topline"><span>02</span><small>Conferência</small></div><h3>Conferência de descontos</h3><p>Compare a lista enviada com o retorno da Prefeitura ou IPRESV e identifique diferenças de matrícula, nome e valor.</p><div className="tool-tags"><span>Excel</span><span>Word</span><span>PDF</span></div><a href="/ferramentas/conferencia-descontos.html">Abrir conferência <span aria-hidden="true">→</span></a></article>
        </div>
      </section>

      <section className="news-section" id="noticias" aria-labelledby="news-title">
        <div className="section-heading"><p className="eyebrow">Notícias</p><h2 id="news-title">Acompanhe por assunto.</h2><p>Uma leitura limpa, com duplicidades removidas, títulos traduzidos quando necessário e links para as fontes originais.</p></div>
        <div className="news-grid">
          {newsCategories.map((item) => <article className={`news-card ${newsCategory === item.title ? "selected" : ""}`} key={item.title}><span className="news-icon" aria-hidden="true">{item.icon}</span><h3>{item.title}</h3><p>{item.text}</p><small>{item.sources}</small><button type="button" aria-label={`Abrir ${item.title}`} onClick={() => setNewsCategory(item.title)}>Ver categoria <span aria-hidden="true">→</span></button></article>)}
        </div>
        <div className="latest-heading"><div><p className="eyebrow">Últimas atualizações</p><h3>{newsCategory === "Todos" ? "Chegando das fontes" : newsCategory}</h3></div><div className="latest-controls">{newsCategory !== "Todos" && <button type="button" onClick={() => setNewsCategory("Todos")}>Mostrar todas</button>}<span>{activeSources ? `${activeSources} fontes conectadas` : "conexão inicial"}</span></div></div>
        {newsLoading ? <div className="news-loading">Buscando as notícias mais recentes…</div> : visibleNews.length ? <div className="latest-grid">{visibleNews.slice(0, 9).map((item) => <article className="latest-card" key={item.url}><div><span>{item.category}</span>{item.language === "en" && <small>{item.translatedTitle ? "Tradução automática" : "Original em inglês"}</small>}</div><h3>{item.translatedTitle || item.title}</h3>{item.translatedTitle && <p className="original-title">Original: {item.title}</p>}{item.description && <p>{item.description}</p>}<footer><span>{item.source} · {formatDate(item.publishedAt)}</span><a href={item.url} target="_blank" rel="noopener noreferrer">Ler na fonte <span aria-hidden="true">↗</span></a></footer></article>)}</div> : <div className="news-loading">Essa categoria ainda não possui uma fonte automática validada. Use as demais categorias enquanto concluímos a conexão oficial.</div>}
        <div className="update-note"><span className="status-dot" /> <strong>Atualização automática ativa</strong><small>{unavailableSources ? `${unavailableSources} fontes sem resposta nesta atualização; o restante continua funcionando.` : "Todas as fontes responderam nesta atualização."}</small></div>
      </section>

      <section className="culture-section" id="cultura" aria-labelledby="culture-title">
        <div className="culture-intro"><div className="section-heading"><p className="eyebrow">Cultura & Eventos</p><h2 id="culture-title">Uma agenda com a sua cara.</h2><p>Baixada Santista, regiões próximas e São Paulo. Shows, teatro, museus, exposições e experiências que valem a viagem.</p></div><div className="culture-stamp"><span>70</span><span>80</span><span>90</span><small>música · história · cultura pop</small></div></div>
        <div className="filter-row" role="group" aria-label="Filtrar eventos">{eventFilters.map((filter) => <button type="button" className={eventFilter === filter ? "active" : ""} onClick={() => setEventFilter(filter)} key={filter}>{filter}</button>)}</div>
        <div className="cultural-highlights"><div className="latest-heading"><div><p className="eyebrow">Agenda automática</p><h3>{eventFilter === "Para você" ? "Eventos encontrados" : eventFilter}</h3></div><span>{eventsUpdatedAt ? `atualizada ${formatDate(eventsUpdatedAt)}` : "atualização a cada 6 horas"}{eventSourceNames.length ? ` · ${eventSourceNames.length} fontes com eventos` : ""}</span></div>
          {eventsLoading ? <div className="news-loading">Consultando as agendas oficiais…</div> : automaticEvents.length ? <div className="events-grid">{automaticEvents.slice(0, 12).map((event) => <article className="event-card featured" key={`${event.title}-${event.startDate}-${event.venue}`}>{event.image && <img className="event-image" src={event.image} alt="" loading="lazy" referrerPolicy="no-referrer" />}<div><span className="event-type">{event.category}</span><span className="event-badge">{event.badge}</span></div><h3>{event.title}</h3>{event.description && <p>{event.description}</p>}<small>{formatEventDate(event.startDate, event.endDate)} · {event.venue} · {event.city}</small>{event.price && <span className="event-price">{event.price === "0" ? "Gratuito" : event.currency ? `${event.currency} ${event.price}` : event.price}</span>}<a href={event.url} target="_blank" rel="noopener noreferrer">Ver no site oficial <span aria-hidden="true">↗</span></a></article>)}</div> : eventFilter === "Para você" ? <><div className="source-warning"><strong>Nenhum evento automático disponível neste momento.</strong><span>As agendas continuam sendo verificadas; abaixo estão destaques confirmados manualmente.</span></div><div className="events-grid">{currentHighlights.map((event) => <article className="event-card featured" key={event.title}><div><span className="event-type">{event.type}</span><span className="event-badge">{event.badge}</span></div><h3>{event.title}</h3><p>{event.text}</p><small>{event.dateLabel} · {event.place}</small><a href={event.url} target="_blank" rel="noopener noreferrer">Ver programação oficial <span aria-hidden="true">↗</span></a></article>)}</div></> : <div className="source-warning"><strong>Nenhum evento encontrado neste filtro.</strong><span>Experimente “Para você” ou consulte as agendas oficiais abaixo.</span></div>}
          {!eventsLoading && <div className="update-note"><span className="status-dot" /><strong>{eventSourceNames.length} de {eventTotalSources || 4} fontes entregaram eventos</strong><small>{eventSourceNames.join(" · ") || "Conectores em nova tentativa"}. A Sympla permanece como busca oficial manual porque bloqueia consultas automáticas sem credencial.</small></div>}</div>
        <div className="agenda-heading"><p className="eyebrow">Agendas oficiais</p><h3>Continue procurando com segurança.</h3></div><div className="agenda-grid">{officialAgendas.map((agenda) => <a href={agenda.url} target="_blank" rel="noopener noreferrer" key={agenda.name}><span>{agenda.kind}</span><strong>{agenda.name}</strong><small>Abrir agenda oficial ↗</small></a>)}</div>
      </section>

      <aside className="trust-note" aria-label="Sobre as informações"><strong>Sobre este conteúdo</strong><p>Este é um agregador independente, sem vínculo oficial com Prefeitura, sindicatos, veículos ou casas de eventos. Notícias e agendas podem mudar; confirme sempre na fonte antes de tomar decisões ou comprar ingressos. Os calendários reproduzem documentos oficiais sem alterar seu conteúdo.</p></aside>
      <footer className="site-footer"><strong>elessandro.com.br</strong><span>Ferramentas, notícias e cultura, sem complicação.</span></footer>
    </main>
  );
}
