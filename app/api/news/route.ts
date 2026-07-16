type FeedSource = {
  name: string;
  url: string;
  category: string;
  language: "pt" | "en";
  includeKeywords?: string[];
};

type NewsEntry = {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedAt: string;
  source: string;
  category: string;
  language: "pt" | "en";
};

type CentralBankNews = {
  titulo?: string;
  Id?: number;
  urlImg?: { Url?: string };
  dataPublicacao?: string;
  ultimaAtualizacao?: string;
  corpo?: string;
};

const feeds: FeedSource[] = [
  { name: "Agência Brasil", url: "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml", category: "Brasil e mundo", language: "pt" },
  { name: "BBC News Brasil", url: "https://feeds.bbci.co.uk/portuguese/rss.xml", category: "Brasil e mundo", language: "pt" },
  { name: "InfoMoney", url: "https://www.infomoney.com.br/feed/", category: "Investimentos e economia", language: "pt" },
  { name: "Investing Brasil", url: "https://br.investing.com/rss/news.rss", category: "Investimentos e economia", language: "pt" },
  { name: "Tecnoblog", url: "https://tecnoblog.net/feed/", category: "Tecnologia e IA", language: "pt" },
  { name: "Canaltech", url: "https://canaltech.com.br/rss/", category: "Tecnologia e IA", language: "pt" },
  { name: "Olhar Digital", url: "https://olhardigital.com.br/feed/", category: "Tecnologia e IA", language: "pt" },
  { name: "G1 Santos e Região", url: "https://g1.globo.com/rss/g1/sp/santos-regiao/", category: "Baixada Santista", language: "pt" },
  { name: "Diário do Litoral", url: "https://www.diariodolitoral.com.br/rss/", category: "Baixada Santista", language: "pt" },
  { name: "Santa Portal", url: "https://santaportal.com.br/feed/", category: "Baixada Santista", language: "pt" },
  { name: "FESSPMESP", url: "https://fesspsp.com.br/feed/", category: "Sindicatos", language: "pt" },
  { name: "SINTRAMEM", url: "https://sintramem-sv.org.br/sintramem/feed/", category: "Sindicatos", language: "pt" },
  { name: "SindServSV", url: "https://sindservsv.com.br/feed/", category: "Sindicatos", language: "pt" },
  { name: "RH/SEDUC São Vicente", url: "https://rhseducsv.wordpress.com/feed/", category: "Educação e servidores", language: "pt" },
  { name: "Caixa de Saúde SV", url: "https://caixasaudesaovicente.sp.gov.br/feed/", category: "Educação e servidores", language: "pt" },
  { name: "IPRESV", url: "https://www.ipresv.sp.gov.br/ipresv/feed/", category: "Alertas oficiais", language: "pt" },
  { name: "Câmara de São Vicente", url: "https://www.saovicente.sp.leg.br/RSS", category: "Alertas oficiais", language: "pt", includeKeywords: ["servidor", "magistério", "educação", "professor", "salário", "reajuste", "carreira", "previdência", "ipresv", "aposentado", "pensionista", "caixa de saúde", "concurso público", "plano de cargos"] },
  { name: "OpenAI", url: "https://openai.com/news/rss.xml", category: "Tecnologia e IA", language: "en" },
  { name: "Google DeepMind", url: "https://deepmind.google/blog/rss.xml", category: "Tecnologia e IA", language: "en" },
  { name: "Agência de Notícias do IBGE", url: "https://agenciadenoticias.ibge.gov.br/agencia-rss", category: "Investimentos e economia", language: "pt" },
  { name: "FNDE — Agência Gov", url: "https://agenciagov.ebc.com.br/rss.xml", category: "Educação e servidores", language: "pt", includeKeywords: ["FNDE", "Fundo Nacional de Desenvolvimento da Educação", "PNAE", "PDDE", "Fundeb", "alimentação escolar"] },
  { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "Sites do exterior", language: "en" },
  { name: "UNESCO", url: "https://www.bing.com/news/search?q=site%3Aunesco.org%2Fen%2Farticles%20education&format=rss&setlang=en-us", category: "Sites do exterior", language: "en" },
  { name: "Education International", url: "https://www.bing.com/news/search?q=site%3Aei-ie.org%2Fen%2Fitem&format=rss&setlang=en-us", category: "Sites do exterior", language: "en" },
];

const municipalKeywords = ["servidor", "magistério", "educação", "educacional", "professor", "escola", "seduc", "concurso", "vida funcional", "aposentado", "pensionista", "ipresv", "caixa de saúde", "perícia", "folha de pagamento", "salário", "reajuste", "carreira"];

const namedEntities: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " ", ldquo: '“', rdquo: '”', lsquo: "‘", rsquo: "’", ndash: "–", mdash: "—", hellip: "…", aacute: "á", agrave: "à", acirc: "â", atilde: "ã", eacute: "é", ecirc: "ê", iacute: "í", oacute: "ó", ocirc: "ô", otilde: "õ", uacute: "ú", ccedil: "ç", Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú", Ccedil: "Ç" };
const decodeEntities = (value: string) => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&([a-zA-Z]+);/g, (entity, name) => namedEntities[name] ?? entity);

const stripTags = (value: string) => decodeEntities(value)
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .replace(/^[\s"'“”‘’]+|[\s"'“”‘’]+$/g, "")
  .replace(/(R\$\s*\d+),\s+(\d)/g, "$1,$2")
  .trim();

const normalized = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const matchesKeywords = (value: string, keywords: string[]) => {
  const haystack = normalized(value);
  return keywords.some((keyword) => haystack.includes(normalized(keyword)));
};

const isoFromBrazilianDate = (value: string) => {
  const match = value.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
  return match ? `${match[3]}-${match[2]}-${match[1]}T12:00:00-03:00` : new Date().toISOString();
};

function field(block: string, names: string[]) {
  for (const name of names) {
    const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
    if (match) return decodeEntities(match[1].trim());
  }
  return "";
}

function imageFromFeed(block: string) {
  const media = block.match(/<(?:media:content|media:thumbnail)\b[^>]*\burl=["']([^"']+)["']/i)?.[1];
  const featured = stripTags(field(block, ["jetpack_featured_media_url"]));
  const enclosureTag = block.match(/<enclosure\b[^>]*>/i)?.[0] || "";
  const enclosure = /\btype=["']image\//i.test(enclosureTag) || /\.(?:jpe?g|png|webp)(?:\?|["'])/i.test(enclosureTag)
    ? enclosureTag.match(/\burl=["']([^"']+)["']/i)?.[1]
    : "";
  const richContent = field(block, ["content:encoded", "description", "content", "summary"]);
  const embedded = richContent.match(/<img\b[^>]*(?:\bsrc|\bdata-src)=["']([^"']+)["']/i)?.[1];
  const candidate = decodeEntities(media || featured || enclosure || embedded || "").trim();
  if (!/^https?:\/\//i.test(candidate) || /(?:gravatar|avatar|emoji|pixel\.wp\.com|\.svg(?:\?|$))/i.test(candidate)) return undefined;
  return candidate;
}

function parseFeed(xml: string, source: FeedSource) {
  const blocks = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) || xml.match(/<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/gi) || [];
  return blocks.map((block) => {
    const atomLink = block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] || "";
    const rawTitle = stripTags(field(block, ["title"]));
    const title = /news\.google\.com|bing\.com\/news\/search/i.test(source.url)
      ? rawTitle.replace(/\s+-\s+(?:www\.gov\.br|UNESCO|Education International)$/i, "").trim()
      : rawTitle;
    const rawDescription = stripTags(field(block, ["description", "summary", "content"]))
      .replace(/\s+(?:data-[a-z-]+|srcset|loading|decoding|class|width|height)=["'][\s\S]*$/i, "")
      .replace(/\s*The post[\s\S]*?appeared first on[\s\S]*$/i, "")
      .trim();
    const description = normalized(rawDescription).startsWith(normalized(title)) ? "" : rawDescription;
    return {
      title,
      description: description.slice(0, 190),
      url: stripTags(field(block, ["link"])) || decodeEntities(atomLink),
      image: imageFromFeed(block),
      publishedAt: stripTags(field(block, ["pubDate", "published", "updated", "dc:date"])),
      source: source.name,
      category: source.category,
      language: source.language,
    };
  }).filter((item) => item.title && item.url)
    .filter((item) => !source.includeKeywords?.length || matchesKeywords(`${item.title} ${item.description}`, source.includeKeywords))
    .slice(0, 5);
}

function parseMunicipalNews(html: string): NewsEntry[] {
  const blocks = html.match(/<div\b[^>]*class=["'][^"']*\bnoticia\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi) || [];
  return blocks.map((block) => {
    const link = block.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
    const title = stripTags(link?.[2] || "");
    const date = block.match(/\b\d{2}\/\d{2}\/\d{4}\b/)?.[0] || "";
    const plain = stripTags(block);
    const description = plain.replace(title, "").replace(date, "").replace(/^[\s–—-]+/, "").trim().slice(0, 190);
    return {
      title,
      description,
      url: link?.[1] || "",
      image: link?.[1] ? `${link[1].replace(/\/$/, "")}/@@images/image/preview` : undefined,
      publishedAt: isoFromBrazilianDate(date),
      source: "Prefeitura de São Vicente",
      category: "Educação e servidores",
      language: "pt" as const,
    };
  }).filter((item) => item.title && item.url && matchesKeywords(`${item.title} ${item.description}`, municipalKeywords)).slice(0, 5);
}

function parseOfficialBulletins(html: string): NewsEntry[] {
  const links = Array.from(html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi));
  return links.map((match) => {
    const title = stripTags(match[2]);
    return {
      title,
      description: "Publicação oficial do Município com atos administrativos, portarias, legislação e comunicados.",
      url: match[1],
      publishedAt: isoFromBrazilianDate(title),
      source: "BOM São Vicente",
      category: "Alertas oficiais",
      language: "pt" as const,
    };
  }).filter((item) => /^Boletim Oficial do Município - Edição/i.test(item.title) && item.url.startsWith("http")).slice(0, 5);
}

function parseCentralBankNews(payload: { conteudo?: CentralBankNews[] }): NewsEntry[] {
  return (payload.conteudo || []).map((item) => ({
    title: stripTags(item.titulo || ""),
    description: stripTags(item.corpo || "").slice(0, 190),
    url: item.Id ? `https://www.bcb.gov.br/detalhenoticia/${item.Id}/noticia` : "",
    image: item.urlImg?.Url,
    publishedAt: item.dataPublicacao || item.ultimaAtualizacao || new Date().toISOString(),
    source: "Banco Central do Brasil",
    category: "Investimentos e economia",
    language: "pt" as const,
  })).filter((item) => item.title && item.url).slice(0, 5);
}

function parseAgencyGovNews(html: string, source: string, keywords: string[] = []): NewsEntry[] {
  const blocks = html.match(/<li\b[^>]*class=["'][^"']*\bnoticia\b[^"']*\bpagina-noticias\b[^"']*["'][^>]*>[\s\S]*?<\/li>/gi) || [];
  return blocks.map((block) => {
    const url = decodeEntities(block.match(/<a\b[^>]*href=["']([^"']+)["']/i)?.[1] || "");
    const title = stripTags(block.match(/<p\b[^>]*class=["'][^"']*\btitulo-noticia\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)?.[1] || "");
    const date = stripTags(block.match(/<div\b[^>]*class=["'][^"']*\bdata-noticia\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1] || "");
    const image = decodeEntities(block.match(/<img\b[^>]*class=["'][^"']*\bnoticia-img\b[^"']*["'][^>]*src=["']([^"']+)["']/i)?.[1] || "");
    return {
      title,
      description: "",
      url,
      image: /^https?:\/\//i.test(image) ? image : undefined,
      publishedAt: isoFromBrazilianDate(date),
      source,
      category: "Educação e servidores",
      language: "pt" as const,
    };
  }).filter((item) => item.title && item.url)
    .filter((item) => !keywords.length || matchesKeywords(item.title, keywords));
}

async function translateText(value: string) {
  try {
    const endpoint = new URL("https://translate.googleapis.com/translate_a/single");
    endpoint.searchParams.set("client", "gtx");
    endpoint.searchParams.set("sl", "en");
    endpoint.searchParams.set("tl", "pt");
    endpoint.searchParams.set("dt", "t");
    endpoint.searchParams.set("q", value);
    const response = await fetch(endpoint, { headers: { "User-Agent": "ElessandroNoticias/1.0" } });
    if (!response.ok) return null;
    const data = await response.json() as unknown[][];
    const translated = Array.isArray(data?.[0]) ? data[0].map((part) => Array.isArray(part) ? part[0] : "").join("") : "";
    return translated && translated !== value ? translated : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const loaders = [
    ...feeds.map((source) => ({ name: source.name, load: async () => {
      const response = await fetch(source.url, { headers: { "User-Agent": "ElessandroNoticias/1.0" }, cf: { cacheTtl: 900 } } as RequestInit);
      if (!response.ok) throw new Error(`${source.name}: ${response.status}`);
      return parseFeed(await response.text(), source);
    } })),
    { name: "Prefeitura de São Vicente", load: async () => {
      const response = await fetch("https://www.saovicente.sp.gov.br/ultimas-noticias", { headers: { "User-Agent": "ElessandroNoticias/1.0" }, cf: { cacheTtl: 900 } } as RequestInit);
      if (!response.ok) throw new Error(`Prefeitura de São Vicente: ${response.status}`);
      return parseMunicipalNews(await response.text());
    } },
    { name: "BOM São Vicente", load: async () => {
      const response = await fetch("https://www.saovicente.sp.gov.br/transparencia/bom", { headers: { "User-Agent": "ElessandroNoticias/1.0" }, cf: { cacheTtl: 900 } } as RequestInit);
      if (!response.ok) throw new Error(`BOM São Vicente: ${response.status}`);
      return parseOfficialBulletins(await response.text());
    } },
    { name: "Banco Central do Brasil", load: async () => {
      const response = await fetch("https://www.bcb.gov.br/api/servico/sitebcb/noticias", { headers: { "User-Agent": "ElessandroNoticias/1.0" }, cf: { cacheTtl: 900 } } as RequestInit);
      if (!response.ok) throw new Error(`Banco Central do Brasil: ${response.status}`);
      return parseCentralBankNews(await response.json() as { conteudo?: CentralBankNews[] });
    } },
    { name: "MEC — Agência Gov", load: async () => {
      const response = await fetch("https://agenciagov.ebc.com.br/noticias/educacao", { headers: { "User-Agent": "ElessandroNoticias/1.0" }, cf: { cacheTtl: 900 } } as RequestInit);
      if (!response.ok) throw new Error(`MEC — Agência Gov: ${response.status}`);
      return parseAgencyGovNews(await response.text(), "MEC — Agência Gov").slice(0, 5);
    } },
  ];
  const results = await Promise.allSettled(loaders.map((source) => source.load()));
  const sourceReports = loaders.map((source, index) => ({
    name: source.name,
    status: results[index].status === "rejected" ? "unavailable" : results[index].value.length ? "active" : "idle",
  }));
  const items = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const sorted = Array.from(new Map(items.map((item) => [item.url, item])).values())
    .sort((a, b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0));
  const categoryCounts = new Map<string, number>();
  const unique = sorted.filter((item) => {
    const count = categoryCounts.get(item.category) || 0;
    const limit = item.category === "Educação e servidores" || item.category === "Sindicatos" ? 30
      : item.category === "Alertas oficiais" || item.category === "Investimentos e economia" || item.category === "Baixada Santista" ? 20
      : item.category === "Sites do exterior" ? 15
      : 12;
    if (count >= limit) return false;
    categoryCounts.set(item.category, count + 1);
    return true;
  });
  const translatedItems = await Promise.all(unique.map(async (item) => {
    if (item.language !== "en") return { ...item, translatedTitle: null, translatedDescription: null };
    const [translatedTitle, translatedDescription] = await Promise.all([
      translateText(item.title),
      item.description ? translateText(item.description) : Promise.resolve(null),
    ]);
    return { ...item, translatedTitle, translatedDescription };
  }));
  const activeSources = sourceReports.filter((source) => source.status === "active").length;
  const unavailableSources = sourceReports.filter((source) => source.status === "unavailable").length;

  return Response.json({ items: translatedItems, activeSources, totalSources: sourceReports.length, unavailableSources, sources: sourceReports, updatedAt: new Date().toISOString() }, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=900" },
  });
}
