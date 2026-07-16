"use client";

import { useEffect, useMemo, useState } from "react";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { EventCard, EventItem, eventFilters, formatDate, officialAgendas } from "../components/content";

export default function AgendaPage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");
  const [visibleCount, setVisibleCount] = useState(12);
  const [updatedAt, setUpdatedAt] = useState("");
  const [activeSources, setActiveSources] = useState<string[]>([]);
  const [totalSources, setTotalSources] = useState(0);
  const filtered = useMemo(() => filter === "Todos" ? items : filter === "Gratuitos" ? items.filter((item) => item.price === "0") : items.filter((item) => item.category === filter), [filter, items]);

  useEffect(() => {
    fetch("/api/events?v=7").then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => { setItems(data.items || []); setUpdatedAt(data.updatedAt || ""); setActiveSources((data.sources || []).filter((source: { status: string }) => source.status === "active").map((source: { name: string }) => source.name)); setTotalSources(data.totalSources || 0); })
      .catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  const selectFilter = (value: string) => { setFilter(value); setVisibleCount(12); };

  return (
    <main id="inicio">
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <SiteHeader active="agenda" />
      <section className="page-hero" id="conteudo" aria-labelledby="page-title"><p className="eyebrow">Agenda cultural</p><h1 id="page-title">Programas para perto e para uma boa viagem.</h1><p>Shows, teatro, museus, cinema, oficinas e exposições da Baixada Santista, regiões próximas e São Paulo.</p><a className="back-link" href="/">← Voltar à página inicial</a></section>
      <section className="listing-section" aria-labelledby="events-title">
        <div className="listing-heading"><div><p className="eyebrow">Agenda automática</p><h2 id="events-title">Eventos encontrados</h2></div><span>{updatedAt ? `Atualizada ${formatDate(updatedAt)}` : "Atualização a cada 6 horas"}</span></div>
        <div className="filter-row" role="group" aria-label="Filtrar eventos">{eventFilters.map((item) => <button type="button" className={filter === item ? "active" : ""} aria-pressed={filter === item} onClick={() => selectFilter(item)} key={item}>{item}</button>)}</div>
        {loading ? <div className="loading-state">Consultando as agendas oficiais…</div> : filtered.length ? <><div className="events-grid">{filtered.slice(0, visibleCount).map((event) => <EventCard event={event} key={`${event.title}-${event.startDate}-${event.venue}`} />)}</div>{filtered.length > visibleCount && <div className="load-more"><button type="button" onClick={() => setVisibleCount((count) => count + 12)}>Mostrar mais eventos</button></div>}</> : <div className="loading-state">Nenhum evento encontrado neste filtro.</div>}
        {!loading && <div className="update-note" role="status"><span className="status-dot" /><strong>{activeSources.length} de {totalSources || activeSources.length} conectores automáticos ativos</strong><small>{activeSources.join(" · ") || "Conectores em nova tentativa"}.</small></div>}
        <div className="agenda-heading"><p className="eyebrow">Agendas oficiais</p><h2>Continue procurando com segurança.</h2><p>Atalhos diretos para programações municipais, museus, Sesc e casas de eventos.</p></div>
        <div className="agenda-grid">{officialAgendas.map((agenda) => <a href={agenda.url} target="_blank" rel="noopener noreferrer" key={agenda.name}><span>{agenda.kind}</span><strong>{agenda.name}</strong><small>Abrir agenda oficial ↗</small></a>)}</div>
      </section>
      <SiteFooter />
    </main>
  );
}
