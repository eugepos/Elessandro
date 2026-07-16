"use client";

import { useEffect, useMemo, useState } from "react";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { EventCard, EventItem, eventFilters, formatDate, officialAgendas, symplaRegions } from "../components/content";

export default function AgendaPage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");
  const [visibleCount, setVisibleCount] = useState(12);
  const [updatedAt, setUpdatedAt] = useState("");
  const [activeSources, setActiveSources] = useState<string[]>([]);
  const [totalSources, setTotalSources] = useState(0);
  const filtered = useMemo(() => {
    if (filter === "Todos") return items;
    if (filter === "Gratuitos") return items.filter((item) => item.price === "0");
    if (filter === "São Paulo") return items.filter((item) => item.city === "São Paulo");
    if (filter === "Baixada Santista") return items.filter((item) => ["Santos", "São Vicente", "Bertioga", "Cubatão", "Guarujá", "Praia Grande", "Mongaguá", "Itanhaém", "Peruíbe"].includes(item.city));
    return items.filter((item) => item.category === filter);
  }, [filter, items]);
  const agendaSections = useMemo(() => Array.from(new Set(officialAgendas.map((agenda) => agenda.section))), []);

  useEffect(() => {
    fetch("/api/events-v8").then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => { setItems(data.items || []); setUpdatedAt(data.updatedAt || ""); setActiveSources((data.sources || []).filter((source: { status: string }) => source.status === "active").map((source: { name: string }) => source.name)); setTotalSources(data.totalSources || 0); })
      .catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  const selectFilter = (value: string) => { setFilter(value); setVisibleCount(12); };

  return (
    <main id="inicio">
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <SiteHeader active="agenda" />
      <section className="page-hero compact-page-label" id="conteudo" aria-labelledby="page-title"><p className="eyebrow" id="page-title">Agenda cultural</p></section>
      <section className="listing-section compact-listing" aria-label="Eventos culturais">
        <div className="listing-heading sources-only"><span>{updatedAt ? `Atualizada ${formatDate(updatedAt)}` : "Atualização a cada 6 horas"}</span></div>
        <div className="filter-row" role="group" aria-label="Filtrar eventos">{eventFilters.map((item) => <button type="button" className={filter === item ? "active" : ""} aria-pressed={filter === item} onClick={() => selectFilter(item)} key={item}>{item}</button>)}</div>
        {loading ? <div className="loading-state">Consultando as agendas oficiais…</div> : filtered.length ? <><div className="events-grid">{filtered.slice(0, visibleCount).map((event) => <EventCard event={event} key={`${event.title}-${event.startDate}-${event.venue}`} />)}</div>{filtered.length > visibleCount && <div className="load-more"><button type="button" onClick={() => setVisibleCount((count) => count + 12)}>Mostrar mais eventos</button></div>}</> : <div className="loading-state">Nenhum evento encontrado neste filtro.</div>}
        {!loading && <div className="update-note" role="status"><span className="status-dot" /><strong>{activeSources.length} de {totalSources || activeSources.length} conectores automáticos ativos</strong><small>{activeSources.join(" · ") || "Conectores em nova tentativa"}. Sympla Santos e São Paulo permanecem como buscas manuais nos atalhos oficiais.</small></div>}
        <div className="agenda-heading"><p className="eyebrow">Agendas oficiais</p><h2>Outras programações.</h2><p>Atalhos revisados para a Baixada Santista, São Paulo, museus, centros culturais e grandes eventos.</p></div>
        {agendaSections.map((section) => <div className="agenda-group" key={section}><h3>{section}</h3><div className="agenda-grid">{officialAgendas.filter((agenda) => agenda.section === section).map((agenda) => <a href={agenda.url} target="_blank" rel="noopener noreferrer" key={agenda.name}><span>{agenda.kind}</span><strong>{agenda.name}</strong><small>Abrir agenda oficial ↗</small></a>)}</div></div>)}
        <div className="sympla-section"><p className="eyebrow">Busca manual na Sympla</p><h2>São Paulo e Baixada Santista.</h2><p>A API pública da Sympla só permite consultar eventos do proprietário do token. Por isso, estes atalhos abrem diretamente a busca oficial de cada cidade.</p><div className="sympla-grid">{symplaRegions.map((region) => <a href={region.url} target="_blank" rel="noopener noreferrer" key={region.name}>{region.name} ↗</a>)}</div></div>
      </section>
      <SiteFooter />
    </main>
  );
}
