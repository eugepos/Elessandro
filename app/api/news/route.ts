type FeedSource = {
  name: string;
  url: string;
  category: string;
  language: "pt" | "en";
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
  { name: "CNTE", url: "https://cnte.org.br/index.php/menu/comunicacao/posts/noticias?format=feed&type=rss", category: "Educação e servidores", language: "pt" },
  { name: "APEOESP", url: "https://www.apeoesp.org.br/feed/", category: "Educação e servidores", language: "pt" },
  { name: "OpenAI", url: "https://openai.com/news/rss.xml", category: "Tecnologia e IA", language: "en" },
  { name: "Google DeepMind", url: "https://deepmind.google/blog/rss.xml", category: "Tecnologia e IA", language: "en" },
];

const namedEntities: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " ", aacute: "á", agrave: "à", acirc: "â", atilde: "ã", eacute: "é", ecirc: "ê", iacute: "í", oacute: "ó", ocirc: "ô", otilde: "õ", uacute: "ú", ccedil: "ç", Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú", Ccedil: "Ç" };
const decodeEntities = (value: string) => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&([a-zA-Z]+);/g, (entity, name) => namedEntities[name] ?? entity);

const stripTags = (value: string) => decodeEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());

function field(block: string, names: string[]) {
  for (const name of names) {
    const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
    if (match) return decodeEntities(match[1].trim());
  }
  return "";
}

function parseFeed(xml: string, source: FeedSource) {
  const blocks = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) || xml.match(/<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/gi) || [];
  return blocks.slice(0, 5).map((block) => {
    const atomLink = block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] || "";
    const description = stripTags(field(block, ["description", "summary", "content"]))
      .replace(/\s+(?:data-[a-z-]+|srcset|loading|decoding|class|width|height)=["'][\s\S]*$/i, "")
      .replace(/\s*The post[\s\S]*?appeared first on[\s\S]*$/i, "")
      .trim();
    return {
      title: stripTags(field(block, ["title"])),
      description: description.slice(0, 190),
      url: stripTags(field(block, ["link"])) || decodeEntities(atomLink),
      publishedAt: stripTags(field(block, ["pubDate", "published", "updated", "dc:date"])),
      source: source.name,
      category: source.category,
      language: source.language,
    };
  }).filter((item) => item.title && item.url);
}

async function translateTitle(title: string) {
  try {
    const endpoint = new URL("https://translate.googleapis.com/translate_a/single");
    endpoint.searchParams.set("client", "gtx");
    endpoint.searchParams.set("sl", "en");
    endpoint.searchParams.set("tl", "pt");
    endpoint.searchParams.set("dt", "t");
    endpoint.searchParams.set("q", title);
    const response = await fetch(endpoint, { headers: { "User-Agent": "ElessandroNoticias/1.0" } });
    if (!response.ok) return null;
    const data = await response.json() as unknown[][];
    const translated = Array.isArray(data?.[0]) ? data[0].map((part) => Array.isArray(part) ? part[0] : "").join("") : "";
    return translated && translated !== title ? translated : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const results = await Promise.allSettled(feeds.map(async (source) => {
    const response = await fetch(source.url, { headers: { "User-Agent": "ElessandroNoticias/1.0" }, cf: { cacheTtl: 900 } } as RequestInit);
    if (!response.ok) throw new Error(`${source.name}: ${response.status}`);
    return parseFeed(await response.text(), source);
  }));

  const items = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const unique = Array.from(new Map(items.map((item) => [item.url, item])).values())
    .sort((a, b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0))
    .slice(0, 36);
  const translatedItems = await Promise.all(unique.map(async (item) => item.language === "en"
    ? { ...item, translatedTitle: await translateTitle(item.title) }
    : { ...item, translatedTitle: null }));
  const activeSources = new Set(unique.map((item) => item.source)).size;
  const unavailableSources = feeds.length - activeSources;

  return Response.json({ items: translatedItems, activeSources, unavailableSources, updatedAt: new Date().toISOString() }, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=900" },
  });
}
