export type NewsItem = { title: string; translatedTitle?: string | null; description: string; url: string; image?: string; publishedAt: string; source: string; category: string; language: "pt" | "en" };
export type EventItem = { title: string; description: string; startDate: string; endDate?: string; displayDate?: string; url: string; image?: string; venue: string; city: string; price?: string; currency?: string; category: string; badge: string; source: string };

export const eventFilters = ["Todos", "Shows", "Teatro", "Museus e História", "Cinema e séries", "Cultura e oficinas", "Gratuitos"];
export const newsFilters = ["Todos", "Investimentos e economia", "Educação e servidores", "Sindicatos", "Tecnologia e IA", "Baixada Santista", "Brasil e mundo", "Alertas oficiais"];

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

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="latest-card">
      {item.image && <div className="news-media"><img src={item.image} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={(error) => error.currentTarget.parentElement?.classList.add("image-failed")} /></div>}
      <div className="news-card-content">
        <div className="news-topline"><span>{item.category}</span>{item.language === "en" && <small>{item.translatedTitle ? "Tradução automática" : "Original em inglês"}</small>}</div>
        <h3>{item.translatedTitle || item.title}</h3>
        {item.translatedTitle && <p className="original-title">Original: {item.title}</p>}
        {item.description && <p>{item.description}</p>}
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
