type EventItem = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  url: string;
  image: string;
  venue: string;
  city: string;
  price: string;
  currency: string;
  category: string;
  badge: string;
  source: string;
};

type ConnectorResult = { name: string; events: EventItem[] };
type JsonRecord = Record<string, unknown>;

const CACHE_SECONDS = 21600;
const requestOptions = {
  headers: { "User-Agent": "Mozilla/5.0 (compatible; ElessandroAgenda/1.1)" },
  cf: { cacheTtl: CACHE_SECONDS },
} as RequestInit;

const asRecord = (value: unknown): JsonRecord => value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const asText = (value: unknown) => typeof value === "string" ? value.trim() : "";
const decode = (value: string) => value
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
  .replace(/&nbsp;/g, " ").replace(/&ccedil;/g, "ç").replace(/&atilde;/g, "ã")
  .replace(/&aacute;/g, "á").replace(/&eacute;/g, "é").replace(/&iacute;/g, "í")
  .replace(/&oacute;/g, "ó").replace(/&uacute;/g, "ú");
const strip = (value: string) => decode(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const absoluteUrl = (value: string, origin: string) => {
  try { return new URL(value, origin).toString(); } catch { return origin; }
};
const zonedDate = (value: string) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ? `${value}:00-03:00` : value;
const dateInSaoPaulo = (date: Date) => new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(date);

function classify(value: string, sourceKind = "") {
  const text = value.toLocaleLowerCase("pt-BR");
  const fallback = sourceKind.toLocaleLowerCase("pt-BR");
  if (/cinema|filme|s[eé]rie|imersiv|audiovisual/.test(text)) return "Cinema e séries";
  if (/teatro|peça|musical|artes c[eê]nicas/.test(text)) return "Teatro";
  if (/museu|exposi|hist[oó]ria|mem[oó]ria|patrim[oô]nio|mostra|artes visuais/.test(text)) return "Museus e História";
  if (/curso|oficina|palestra|literatura|dança|encontro|debate|educativo/.test(text)) return "Cultura e oficinas";
  if (/museu|hist[oó]ria/.test(fallback)) return "Museus e História";
  return "Shows";
}

function affinity(value: string) {
  const text = value.toLocaleLowerCase("pt-BR");
  const strong = /humberto gessinger|engenheiros|legi[aã]o urbana|renato russo|almir sater|renato teixeira|s[eé]rgio reis|u2|guns n.? roses|elton john|pato fu|raul seixas/;
  const broad = /rock|mpb|flashback|anos 70|anos 80|anos 90|tributo|sertanejo raiz|dance|museu|hist[oó]ria|chaves|janis|cinema|teatro/;
  return strong.test(text) ? "Imperdível para você" : broad.test(text) ? "Combina com você" : "Agenda oficial";
}

function parseTokioMarine(html: string): EventItem[] {
  const months: Record<string, number> = { janeiro: 0, fevereiro: 1, março: 2, marco: 2, abril: 3, maio: 4, junho: 5, julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11 };
  const events: EventItem[] = [];
  const now = new Date();
  const cards = html.match(/<li[^>]+eg-tokio-marine-hall-wrapper[\s\S]*?<\/li>/gi) || [];
  for (const card of cards) {
    const title = strip(card.match(/element-0-a[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i)?.[1] || "");
    const description = strip(card.match(/element-36[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i)?.[1] || "");
    const dateText = strip(card.match(/element-33-a[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i)?.[1] || "");
    const ticketUrl = decode(card.match(/element-39-a[\s\S]*?href=["']([^"']+)["']/i)?.[1] || "https://www.tokiomarinehall.com.br/shows/");
    const image = decode(card.match(/data-lazysrc=["']([^"']+)["']/i)?.[1] || "");
    const match = dateText.toLocaleLowerCase("pt-BR").match(/(?:de\s+)?(\d{1,2})(?:\s+e\s+\d{1,2})?\s+de\s+(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/i);
    if (!match || !title) continue;
    const month = months[match[2].toLocaleLowerCase("pt-BR")];
    const day = Number(match[1]);
    let year = Number(dateText.match(/20\d{2}/)?.[0] || now.getFullYear());
    if (month < now.getMonth() - 2) year += 1;
    const time = dateText.match(/(?:às?\s*)?(\d{1,2})(?:h|:)(\d{2})?/i);
    const hour = String(Number(time?.[1] || 20)).padStart(2, "0");
    const minute = String(Number(time?.[2] || 0)).padStart(2, "0");
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T${hour}:${minute}:00-03:00`;
    events.push({
      title, description: description || "Programação publicada pela casa de shows.", startDate, endDate: "", url: ticketUrl,
      image, venue: "Tokio Marine Hall", city: "São Paulo", price: "", currency: "", category: classify(title, "Shows"), badge: affinity(title), source: "Tokio Marine Hall",
    });
  }
  return Array.from(new Map(events.map((event) => [`${event.title}|${event.startDate}`, event])).values()).slice(0, 24);
}

async function fetchTokioMarine(): Promise<ConnectorResult> {
  const url = "https://www.tokiomarinehall.com.br/shows/";
  const response = await fetch(url, requestOptions);
  if (!response.ok) throw new Error(`Tokio Marine Hall: ${response.status}`);
  return { name: "Tokio Marine Hall", events: parseTokioMarine(await response.text()) };
}

const unfoldIcs = (value: string) => value.replace(/\r?\n[ \t]/g, "");
const unescapeIcs = (value: string) => value.replace(/\\[nN]/g, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\").replace(/\s+/g, " ").trim();
const icsProperty = (block: string, name: string) => block.match(new RegExp(`^${name}(?:;[^:]*)?:(.*)$`, "mi"))?.[1]?.trim() || "";
const parseIcsDate = (value: string) => {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?/);
  if (!match) return "";
  return `${match[1]}-${match[2]}-${match[3]}T${match[4] || "10"}:${match[5] || "00"}:${match[6] || "00"}-03:00`;
};

function parseMisCalendar(ics: string): EventItem[] {
  const unfolded = unfoldIcs(ics);
  const events: EventItem[] = [];
  for (const match of unfolded.matchAll(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/g)) {
    const block = match[1];
    const title = unescapeIcs(icsProperty(block, "SUMMARY"));
    const startDate = parseIcsDate(icsProperty(block, "DTSTART"));
    const endDate = parseIcsDate(icsProperty(block, "DTEND"));
    const rawDescription = unescapeIcs(icsProperty(block, "DESCRIPTION"));
    const priceText = rawDescription.match(/Ingresso\s+(.{1,180}?)(?=\s+Local\s+|\s+Classifica[cç][aã]o\s+|$)/i)?.[1]?.replace(/\s+COMPRAR\b.*$/i, "").trim() || "";
    const price = /gratuit/i.test(priceText) ? "0" : priceText;
    const url = unescapeIcs(icsProperty(block, "URL")) || "https://mis-sp.org.br/programacao/";
    const image = unescapeIcs(icsProperty(block, "ATTACH"));
    if (!title || !startDate) continue;
    events.push({
      title, description: "Evento da programação oficial do Museu da Imagem e do Som.", startDate, endDate, url, image,
      venue: "MIS São Paulo", city: "São Paulo", price, currency: "", category: classify(`${title} ${rawDescription}`, "Museus e História"), badge: affinity(`${title} ${rawDescription}`), source: "MIS São Paulo",
    });
  }
  return events.slice(0, 20);
}

async function fetchMis(): Promise<ConnectorResult> {
  const response = await fetch("https://mis-sp.org.br/eventos/?ical=1", requestOptions);
  if (!response.ok) throw new Error(`MIS São Paulo: ${response.status}`);
  return { name: "MIS São Paulo", events: parseMisCalendar(await response.text()) };
}

const sescUnits = [
  { id: "37", name: "Sesc Santos", city: "Santos" },
  { id: "27", name: "Sesc Bertioga", city: "Bertioga" },
  { id: "61", name: "Sesc Pompeia", city: "São Paulo" },
  { id: "60", name: "Sesc Pinheiros", city: "São Paulo" },
  { id: "66", name: "Sesc Vila Mariana", city: "São Paulo" },
  { id: "43", name: "Sesc Avenida Paulista", city: "São Paulo" },
];

function sescLanguage(item: JsonRecord) {
  return asArray(item.tipos_linguagens).flatMap((entry) => {
    const language = asRecord(entry);
    return [asText(language.titulo), ...asArray(language.children).map((child) => asText(asRecord(child).titulo))];
  }).filter(Boolean).join(" · ");
}

function normalizeSesc(item: JsonRecord, fallbackUnit: { name: string; city: string }): EventItem | null {
  const title = strip(asText(item.titulo));
  const startDate = zonedDate(asText(item.dataProxSessao) || asText(item.dataPrimeiraSessao));
  if (!title || !startDate || asText(item.cancelado)) return null;
  const language = sescLanguage(item);
  if (!/m[uú]sica|show|teatro|cinema|v[ií]deo|exposi|artes visuais|literatura|dança|oficina|curso|palestra|encontro|performance/i.test(`${title} ${language}`)) return null;
  const officialUnitName = asText(asRecord(asArray(item.unidade)[0]).name);
  const unitName = officialUnitName ? `Sesc ${officialUnitName}` : fallbackUnit.name;
  const isFree = /gratuit/i.test(asText(item.gratuito));
  return {
    title,
    description: strip(asText(item.complemento) || `${language || "Atividade cultural"} na programação oficial do Sesc.`).slice(0, 220),
    startDate,
    endDate: zonedDate(asText(item.dataUltimaSessao)),
    url: absoluteUrl(asText(item.link), "https://www.sescsp.org.br"),
    image: asText(item.imagem),
    venue: unitName,
    city: fallbackUnit.city,
    price: isFree ? "0" : "",
    currency: "",
    category: classify(`${title} ${language}`, "Cultura"),
    badge: affinity(`${title} ${language}`),
    source: "Sesc São Paulo",
  };
}

async function fetchSesc(): Promise<ConnectorResult> {
  const start = dateInSaoPaulo(new Date());
  const end = dateInSaoPaulo(new Date(Date.now() + 1000 * 60 * 60 * 24 * 120));
  const results = await Promise.allSettled(sescUnits.map(async (unit) => {
    const params = new URLSearchParams({ data_inicial: start, data_final: end, local: unit.id, ppp: "18", page: "1", tipo: "atividade" });
    const response = await fetch(`https://www.sescsp.org.br/wp-json/wp/v1/atividades/filter?${params}`, requestOptions);
    if (!response.ok) throw new Error(`${unit.name}: ${response.status}`);
    const payload = asRecord(await response.json());
    return asArray(payload.atividade).map((item) => normalizeSesc(asRecord(item), unit)).filter((item): item is EventItem => item !== null);
  }));
  const events = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  if (!results.some((result) => result.status === "fulfilled")) throw new Error("Sesc São Paulo: todas as unidades falharam");
  return { name: "Sesc São Paulo", events: Array.from(new Map(events.map((event) => [`${event.title}|${event.startDate}|${event.venue}`, event])).values()).slice(0, 36) };
}

function firstHour(value: string) {
  const match = value.match(/(\d{1,2})(?:h|:)(\d{2})?/i);
  const hour = String(Number(match?.[1] || 10)).padStart(2, "0");
  const minute = String(Number(match?.[2] || 0)).padStart(2, "0");
  return `${hour}:${minute}:00`;
}

function normalizeMuseum(item: JsonRecord): EventItem | null {
  const title = strip(asText(item.title));
  const start = asText(asRecord(item.start_date).date);
  const end = asText(asRecord(item.end_date).date);
  if (!title || !start) return null;
  const hourText = asText(item.hour);
  const rawPrice = strip(asText(item.price));
  const slug = asText(item.slug);
  const type = asText(asRecord(item.types).slug) || "presencial";
  return {
    title,
    description: strip(asText(item.short_description) || asText(asRecord(item.description).description)).slice(0, 220),
    startDate: `${start}T${firstHour(hourText)}-03:00`,
    endDate: end ? `${end}T23:59:00-03:00` : "",
    url: slug ? `https://www.museudocafe.org.br/programacao/agenda/${type}/${slug}` : "https://www.museudocafe.org.br/programacao/agenda",
    image: asText(asRecord(item.image).full_path),
    venue: "Museu do Café",
    city: "Santos",
    price: /^gratuit/i.test(rawPrice) ? "0" : rawPrice,
    currency: "",
    category: classify(`${title} ${asText(item.short_description)}`, "Museus e História"),
    badge: affinity(`${title} ${asText(item.short_description)}`),
    source: "Museu do Café",
  };
}

async function fetchMuseum(): Promise<ConnectorResult> {
  const pages = await Promise.all([1, 2].map(async (page) => {
    const response = await fetch(`https://www.museudocafe.org.br/manage/manage-api/eventos?page=${page}`, requestOptions);
    if (!response.ok) throw new Error(`Museu do Café: ${response.status}`);
    const payload = asRecord(await response.json());
    return asArray(asRecord(payload.events).data);
  }));
  const events = pages.flat().map((item) => normalizeMuseum(asRecord(item))).filter((item): item is EventItem => item !== null);
  return { name: "Museu do Café", events: Array.from(new Map(events.map((event) => [`${event.title}|${event.startDate}`, event])).values()).slice(0, 24) };
}

function balanced(events: EventItem[]) {
  const sourceOrder = ["Museu do Café", "Sesc São Paulo", "MIS São Paulo", "Tokio Marine Hall"];
  const queues = sourceOrder.map((source) => events.filter((event) => event.source === source).sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate)));
  const output: EventItem[] = [];
  while (queues.some((queue) => queue.length) && output.length < 48) {
    for (const queue of queues) {
      if (output.length >= 48) break;
      const next = queue.shift();
      if (next) output.push(next);
    }
  }
  return output;
}

export async function GET() {
  const connectors = [fetchTokioMarine, fetchMis, fetchSesc, fetchMuseum];
  const results = await Promise.allSettled(connectors.map((connector) => connector()));
  const now = Date.now();
  const isCurrent = (event: EventItem) => (Date.parse(event.endDate || event.startDate) || 0) >= now - 86400000;
  const reports = results.map((result, index) => {
    const fallbackName = ["Tokio Marine Hall", "MIS São Paulo", "Sesc São Paulo", "Museu do Café"][index];
    const eventCount = result.status === "fulfilled" ? result.value.events.filter(isCurrent).length : 0;
    return result.status === "fulfilled"
      ? { name: result.value.name, status: eventCount ? "active" : "empty", eventCount }
      : { name: fallbackName, status: "unavailable", eventCount: 0 };
  });
  const items = results.flatMap((result) => result.status === "fulfilled" ? result.value.events : [])
    .filter(isCurrent);
  const unique = Array.from(new Map(items.map((event) => [`${event.title}|${event.startDate}|${event.venue}`, event])).values());

  return Response.json({
    items: balanced(unique),
    activeSources: reports.filter((source) => source.status === "active").length,
    totalSources: reports.length,
    sources: reports,
    manualSources: [{ name: "Sympla Santos", url: "https://www.sympla.com.br/eventos/santos-sp", reason: "A plataforma bloqueia consultas automáticas sem credencial oficial." }],
    updatedAt: new Date().toISOString(),
  }, { headers: { "Cache-Control": `public, max-age=900, s-maxage=${CACHE_SECONDS}` } });
}
