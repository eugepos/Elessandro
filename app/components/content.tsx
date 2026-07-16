import { useEffect, useState } from "react";

export type NewsItem = { title: string; translatedTitle?: string | null; description: string; translatedDescription?: string | null; url: string; image?: string; publishedAt: string; source: string; category: string; language: "pt" | "en" };
export type EventItem = { title: string; description: string; startDate: string; endDate?: string; displayDate?: string; url: string; image?: string; venue: string; city: string; price?: string; currency?: string; category: string; badge: string; source: string };

export const eventFilters = ["Todos", "Shows", "Teatro", "Museus e História", "Cinema e séries", "Cultura e oficinas", "Gratuitos"];
export const newsFilters = ["Todos", "Investimentos e economia", "Educação e servidores", "Sindicatos", "Tecnologia e IA", "Baixada Santista", "Brasil e mundo", "Sites do exterior", "Alertas oficiais"];

export const officialAgendas = [
  { name: "Calendário de São Vicente", kind: "Agenda municipal", url: "https://www.saovicente.sp.gov.br/institucional/calendario" },
  { name: "Calendário Escolar 2026", kind: "SEDUC São Vicente", url: "/documentos/calendario-escolar-sao-vicente-2026.pdf" },
  { name: "Tokio Marine Hall", kind: "Shows", url: "https://www.tokiomarinehall.com.br/shows/" },
  { name: "MIS São Paulo", kind: "Exposições", url: "https://mis-sp.org.br/" },
  { name: "Sesc São Paulo", kind: "Cultura", url: "https://www.sescsp.org.br/programacao/" },
  { name: "Ticketmaster", kind: "Grandes shows", url: "https://www.ticketmaster.com.br/" },
  { name: "Museu do Café", kind: "História", url: "https://www.museudocafe.org.br/" },
  { name: "Museu da Língua Portuguesa", kind: "Museu e literatura", url: "https://www.museudalinguaportuguesa.org.br/category/agenda/" },
  { name: "Museu do Futebol", kind: "Museu e esporte", url: "https://museudofutebol.org.br/" },
  { name: "Museu do Ipiranga", kind: "Museu e história", url: "https://museudoipiranga.org.br/programacao/" },
  { name: "Pinacoteca de São Paulo", kind: "Arte e exposições", url: "https://pinacoteca.org.br/programacao/" },
  { name: "Museu da Imigração", kind: "Museu e história", url: "https://museudaimigracao.org.br/imprensa" },
  { name: "Agenda Cultural de Santos", kind: "Baixada Santista", url: "https://www.santos.sp.gov.br/?q=portal/agenda-cultural" },
];

export const symplaRegions = [
  { name: "São Paulo", url: "https://www.sympla.com.br/eventos/sao-paulo-sp" },
  { name: "Santos", url: "https://www.sympla.com.br/eventos/santos-sp" },
  { name: "São Vicente", url: "https://www.sympla.com.br/eventos/sao-vicente-sp" },
  { name: "Praia Grande", url: "https://www.sympla.com.br/eventos/praia-grande-sp" },
  { name: "Guarujá", url: "https://www.sympla.com.br/eventos/guaruja-sp" },
  { name: "Cubatão", url: "https://www.sympla.com.br/eventos/cubatao-sp" },
  { name: "Bertioga", url: "https://www.sympla.com.br/eventos/bertioga-sp" },
  { name: "Mongaguá", url: "https://www.sympla.com.br/eventos/mongagua-sp" },
  { name: "Itanhaém", url: "https://www.sympla.com.br/eventos/itanhaem-sp" },
  { name: "Peruíbe", url: "https://www.sympla.com.br/eventos/peruibe-sp" },
];

export function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Data não informada" : new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
}

export function formatEventDate(value: string, endValue?: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data a confirmar";
  const end = endValue ? new Date(endValue) : null;
  const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
  const time = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date);
  if (end && !Number.isNaN(end.getTime()) && end.toDateString() !== date.toDateString()) {
    return `${day} – ${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(end)} · ${time}`;
  }
  return `${day} · ${time}`;
}

const browserTranslationCache = new Map<string, Promise<string | null>>();
let activeTranslations = 0;
const pendingTranslations: Array<() => void> = [];

function withTranslationLimit<T>(task: () => Promise<T>) {
  return new Promise<T>((resolve, reject) => {
    const run = () => {
      activeTranslations += 1;
      task().then(resolve, reject).finally(() => {
        activeTranslations -= 1;
        pendingTranslations.shift()?.();
      });
    };
    if (activeTranslations < 3) run();
    else pendingTranslations.push(run);
  });
}

async function requestBrowserTranslation(value: string) {
  const storageKey = `elessandro-traducao:${value}`;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) return stored;
  } catch { /* armazenamento pode estar bloqueado */ }

  let translated: string | null = null;
  try {
    const endpoint = new URL("https://translate.googleapis.com/translate_a/single");
    endpoint.searchParams.set("client", "gtx");
    endpoint.searchParams.set("sl", "en");
    endpoint.searchParams.set("tl", "pt");
    endpoint.searchParams.set("dt", "t");
    endpoint.searchParams.set("q", value);
    const response = await fetch(endpoint);
    if (response.ok) {
      const data = await response.json() as unknown[][];
      translated = Array.isArray(data?.[0]) ? data[0].map((part) => Array.isArray(part) ? part[0] : "").join("") : null;
    }
  } catch { /* usa o serviço alternativo abaixo */ }

  if (!translated || translated === value) {
    try {
      const endpoint = new URL("https://api.mymemory.translated.net/get");
      endpoint.searchParams.set("q", value);
      endpoint.searchParams.set("langpair", "en|pt-BR");
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json() as { responseData?: { translatedText?: string } };
        translated = data.responseData?.translatedText || null;
      }
    } catch { /* mantém o original em inglês */ }
  }

  if (!translated || translated === value) return null;
  try { window.localStorage.setItem(storageKey, translated); } catch { /* cache opcional */ }
  return translated;
}

function translateInBrowser(value: string) {
  if (!value) return Promise.resolve(null);
  const cached = browserTranslationCache.get(value);
  if (cached) return cached;
  const request = withTranslationLimit(() => requestBrowserTranslation(value));
  browserTranslationCache.set(value, request);
  return request;
}

function useAutomaticTranslation(item: NewsItem) {
  const [title, setTitle] = useState(item.translatedTitle || null);
  const [description, setDescription] = useState(item.translatedDescription || null);
  const [translating, setTranslating] = useState(item.language === "en" && !item.translatedTitle);

  useEffect(() => {
    setTitle(item.translatedTitle || null);
    setDescription(item.translatedDescription || null);
    if (item.language !== "en" || item.translatedTitle) {
      setTranslating(false);
      return;
    }
    let current = true;
    setTranslating(true);
    Promise.all([translateInBrowser(item.title), translateInBrowser(item.description)])
      .then(([translatedTitle, translatedDescription]) => {
        if (!current) return;
        setTitle(translatedTitle);
        setDescription(translatedDescription);
      })
      .finally(() => { if (current) setTranslating(false); });
    return () => { current = false; };
  }, [item.title, item.description, item.language, item.translatedTitle, item.translatedDescription]);

  return { title, description, translating };
}

export function NewsCard({ item }: { item: NewsItem }) {
  const translation = useAutomaticTranslation(item);
  const translatedTitle = item.translatedTitle || translation.title;
  const translatedDescription = item.translatedDescription || translation.description;
  return (
    <article className="latest-card">
      {item.image && <div className="news-media"><img src={item.image} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={(error) => error.currentTarget.parentElement?.classList.add("image-failed")} /></div>}
      <div className="news-card-content">
        <div className="news-topline"><span>{item.category}</span>{item.language === "en" && <small>{translatedTitle ? "Tradução automática" : translation.translating ? "Traduzindo…" : "Original em inglês"}</small>}</div>
        <h3>{translatedTitle || item.title}</h3>
        {translatedTitle && <p className="original-title">Original: {item.title}</p>}
        {(translatedDescription || item.description) && <p>{translatedDescription || item.description}</p>}
        <footer><span>{item.source} · {formatDate(item.publishedAt)}</span><a href={item.url} target="_blank" rel="noopener noreferrer">Ler na fonte ↗</a></footer>
      </div>
    </article>
  );
}

export function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="event-card">
      <div className={`event-media ${event.image ? "has-image" : "image-failed"}`}>
        {event.image && <img src={event.image} alt={`Imagem de divulgação do evento ${event.title}`} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={(error) => error.currentTarget.parentElement?.classList.add("image-failed")} />}
        <div className="event-fallback"><span>{event.category}</span><strong>Agenda cultural</strong></div>
      </div>
      <div className="event-card-body">
        <div className="event-topline"><span className="event-type">{event.category}</span><span className="event-badge">{event.badge}</span></div>
        <h3>{event.title}</h3>
        {event.description && <p>{event.description}</p>}
        <small>{event.displayDate || formatEventDate(event.startDate, event.endDate)} · {event.venue} · {event.city}</small>
        {event.price && <span className="event-price">{event.price === "0" ? "Gratuito" : event.currency ? `${event.currency} ${event.price}` : event.price}</span>}
        <a href={event.url} target="_blank" rel="noopener noreferrer">Ver no site oficial ↗</a>
      </div>
    </article>
  );
}
