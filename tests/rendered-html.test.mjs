import assert from "node:assert/strict";
import test from "node:test";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);
const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const context = { waitUntil() {}, passThroughOnException() {} };

async function render(path) {
  const response = await worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), env, context);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  return response.text();
}

test("renders the compact home page with production metadata", async () => {
  const html = await render("/");
  assert.match(html, /<title>Elessandro Eugênio — Meu espaço<\/title>/i);
  assert.match(html, /Abrir ferramentas/i);
  assert.match(html, /Ver todas as notícias/i);
  assert.match(html, /Abrir agenda completa/i);
  assert.match(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/elessandro\.com\.br\/?["']/i);
  assert.match(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']https:\/\/elessandro\.com\.br\/og\.png["']/i);
  assert.doesNotMatch(html, /codex-preview/i);
});

test("renders the dedicated news page", async () => {
  const html = await render("/noticias");
  assert.match(html, /<title>Notícias — Elessandro Eugênio<\/title>/i);
  assert.match(html, /Informação organizada para consulta/i);
  assert.match(html, /https:\/\/elessandro\.com\.br\/noticias/i);
});

test("renders the dedicated cultural agenda", async () => {
  const html = await render("/agenda");
  assert.match(html, /<title>Agenda cultural — Elessandro Eugênio<\/title>/i);
  assert.match(html, /Programas para perto e para uma boa viagem/i);
  assert.match(html, /https:\/\/elessandro\.com\.br\/agenda/i);
});
