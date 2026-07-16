"use client";

import { useEffect, useMemo, useState } from "react";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { NewsCard, NewsItem, newsFilters } from "../components/content";

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");
  const [visibleCount, setVisibleCount] = useState(12);
  const [activeSources, setActiveSources] = useState(0);
  const [totalSources, setTotalSources] = useState(0);
  const [unavailableSources, setUnavailableSources] = useState(0);
  const filtered = useMemo(() => filter === "Todos" ? items : items.filter((item) => item.category === filter), [filter, items]);

  useEffect(() => {
    fetch("/api/news?v=5").then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => { setItems(data.items || []); setActiveSources(data.activeSources || 0); setTotalSources(data.totalSources || 0); setUnavailableSources(data.unavailableSources || 0); })
      .catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  const selectFilter = (value: string) => { setFilter(value); setVisibleCount(12); };

  return (
    <main id="inicio">
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <SiteHeader active="noticias" />
      <section className="page-hero" id="conteudo" aria-labelledby="page-title"><p className="eyebrow">Notícias</p><h1 id="page-title">Informação organizada para consulta.</h1><p>Atualizações reunidas por assunto, sem duplicidades e sempre com acesso à publicação original.</p><a className="back-link" href="/">← Voltar à página inicial</a></section>
      <section className="listing-section" aria-labelledby="listing-title">
        <div className="listing-heading"><div><p className="eyebrow">Últimas atualizações</p><h2 id="listing-title">Chegando das fontes</h2></div><span>{activeSources ? `${activeSources} de ${totalSources || activeSources} fontes ativas` : "Conexão inicial"}</span></div>
        <div className="filter-row" role="group" aria-label="Filtrar notícias">{newsFilters.map((item) => <button type="button" className={filter === item ? "active" : ""} aria-pressed={filter === item} onClick={() => selectFilter(item)} key={item}>{item}</button>)}</div>
        {loading ? <div className="loading-state">Buscando as notícias mais recentes…</div> : filtered.length ? <><div className="latest-grid">{filtered.slice(0, visibleCount).map((item) => <NewsCard item={item} key={item.url} />)}</div>{filtered.length > visibleCount && <div className="load-more"><button type="button" onClick={() => setVisibleCount((count) => count + 12)}>Mostrar mais notícias</button></div>}</> : <div className="loading-state">Nenhuma notícia encontrada neste filtro.</div>}
        {!loading && <div className="update-note" role="status"><span className="status-dot" /><strong>Atualização automática ativa</strong><small>{unavailableSources ? `${unavailableSources} fonte(s) não responderam agora; as demais continuam funcionando.` : "Todas as fontes responderam nesta atualização."}</small></div>}
      </section>
      <SiteFooter />
    </main>
  );
}
