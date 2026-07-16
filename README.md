# Elessandro — projeto completo do site

Exportação completa da versão 13 do site **elessandro.com.br**, preparada em 16 de julho de 2026.

Este pacote contém o código-fonte necessário para editar, executar e publicar o site em uma hospedagem compatível com aplicações JavaScript com funções de servidor. Não foram incluídas senhas, tokens, chaves privadas, dependências instaladas (`node_modules`) nem artefatos temporários de compilação.

## O que está incluído

- página inicial responsiva em React/Next.js;
- estilos globais, ícones e fontes locais;
- calculadora de descongelamento do tempo da pandemia;
- ferramenta de conferência de descontos;
- bibliotecas locais para leitura de Excel, Word e PDF;
- API de notícias e configuração de todas as fontes RSS;
- API de eventos com conectores do Tokio Marine Hall, MIS, Sesc e Museu do Café;
- calendário escolar de São Vicente em PDF;
- arquivos de configuração do Next.js, Vite, Vinext, Cloudflare Worker e OpenAI Sites;
- scripts de instalação, compilação e validação;
- testes automatizados;
- `package.json` e `package-lock.json`.

## Tecnologia e arquitetura

O projeto usa:

- Node.js 22;
- React 19;
- Next.js App Router;
- Vinext e Vite;
- Cloudflare Workers como ambiente de servidor;
- rotas de API em `app/api/`;
- páginas estáticas das ferramentas em `public/ferramentas/`.

O site **não é puramente estático**. A página e as ferramentas podem ser servidas como arquivos, mas as notícias e os eventos dependem das funções de servidor em `app/api/news/route.ts` e `app/api/events/route.ts`. Uma hospedagem como GitHub Pages, sem funções de servidor, não executará essas duas integrações.

## Requisitos

- Node.js `>= 22.13.0`;
- npm;
- Bash para os scripts auxiliares;
- em Linux, `curl`, `flock` e GNU `timeout` para os scripts de instalação e compilação verificada.

Confira as versões instaladas:

```bash
node --version
npm --version
```

## Instalação

Na pasta do projeto:

```bash
npm ci
```

O comando instala exatamente as versões registradas em `package-lock.json`.

## Executar localmente

```bash
npm run dev
```

Abra o endereço mostrado pelo terminal, normalmente `http://localhost:3000` ou `http://localhost:5173`.

Rotas importantes:

- `/` — página inicial;
- `/api/news` — agregador de notícias;
- `/api/events` — agregador de eventos;
- `/ferramentas/descongelamento.html` — calculadora;
- `/ferramentas/conferencia-descontos.html` — conferência;
- `/documentos/calendario-escolar-sao-vicente-2026.pdf` — calendário escolar.

## Verificações antes de publicar

```bash
npm run lint
npm test
```

O teste executa a compilação completa, valida o artefato do Worker e confere o HTML renderizado.

Para executar apenas a compilação:

```bash
npm run build
```

Para iniciar localmente o resultado compilado:

```bash
npm run start
```

## Variáveis de ambiente

O funcionamento atual do site, das notícias e dos eventos **não exige variáveis de ambiente nem chaves de API**. As fontes utilizadas são públicas.

O arquivo `.env.example` documenta somente variáveis opcionais de hospedagem e dos scripts. Copie-o apenas se precisar:

```bash
cp .env.example .env.local
```

Nunca publique `.env.local`, tokens ou credenciais. Os arquivos `.env*` estão ignorados pelo Git.

### Para Cloudflare Workers

- `CLOUDFLARE_ACCOUNT_ID`: identificador da sua conta Cloudflare;
- `CLOUDFLARE_API_TOKEN`: opcional para implantação automatizada; não é necessário quando se usa `wrangler login`.

### Variáveis opcionais dos scripts

- `SITES_INSTALL_TIMEOUT`;
- `SITES_INSTALL_KILL_AFTER`;
- `SITES_BUILD_TIMEOUT`;
- `SITES_BUILD_KILL_AFTER`;
- `WRANGLER_LOG_PATH`;
- `WRANGLER_WRITE_LOGS`;
- `MINIFLARE_REGISTRY_PATH`.

## Publicar no Cloudflare Workers

O Vinext possui integração nativa com Cloudflare Workers.

1. Autentique-se:

```bash
npx wrangler login
```

2. Defina o identificador da sua conta em `.env.local` ou no terminal:

```bash
export CLOUDFLARE_ACCOUNT_ID="SEU_ACCOUNT_ID"
```

3. Faça a implantação:

```bash
npx vinext deploy --name elessandro
```

Na primeira implantação, o Vinext pode gerar `wrangler.jsonc`. Revise o nome do Worker, o domínio e os recursos antes de confirmar a publicação.

Em integração contínua, use `CLOUDFLARE_API_TOKEN` armazenado no cofre de segredos do provedor. Nunca coloque o token no código ou neste ZIP.

## Publicar novamente no OpenAI Sites

O arquivo `.openai/hosting.json` registra a configuração da hospedagem original. O `project_id` não é uma senha, mas identifica o projeto existente.

Para criar uma cópia independente em outro projeto Sites, use o fluxo de criação/importação da plataforma e substitua a associação ao projeto original. Não reutilize o `project_id` sem ter autorização sobre o projeto correspondente.

## Publicar em outros provedores

O Vinext pode trabalhar com provedores adicionais por meio do Nitro, mas cada plataforma exige seu próprio adaptador e configuração. Outra alternativa é migrar a aplicação para o compilador padrão do Next.js e usar uma hospedagem com suporte a Node.js.

Ao escolher outro provedor, ele precisa oferecer:

- execução de JavaScript no servidor;
- suporte a `fetch` de páginas e feeds externos;
- rotas dinâmicas `/api/news` e `/api/events`;
- HTTPS;
- cache de respostas HTTP.

Se o provedor bloquear consultas externas, as ferramentas continuarão funcionando, mas notícias e eventos poderão ficar indisponíveis.

## Notícias

O código está em `app/api/news/route.ts`.

Ele consulta feeds públicos, normaliza títulos e descrições, remove duplicidades e separa o conteúdo por categoria. A resposta utiliza cache de até seis horas. Algumas fontes podem ficar temporariamente indisponíveis ou alterar o endereço do feed.

Para adicionar ou remover uma fonte, edite a lista `feeds` no início do arquivo.

## Eventos

O código está em `app/api/events/route.ts`.

Conectores automáticos incluídos:

- Tokio Marine Hall;
- MIS São Paulo, por calendário iCal oficial;
- Sesc Santos, Bertioga e unidades selecionadas de São Paulo, por API oficial;
- Museu do Café, por API oficial.

A Sympla Santos permanece como link de consulta manual porque a plataforma bloqueia consultas automáticas sem credencial oficial. Os eventos vencidos são removidos e as respostas usam cache de até seis horas.

## Ferramentas

As ferramentas ficam em:

- `public/ferramentas/descongelamento.html`;
- `public/ferramentas/conferencia-descontos.html`.

A ferramenta de conferência utiliza arquivos locais em `public/ferramentas/vendor/`:

- Mammoth para Word;
- SheetJS/XLSX para Excel;
- PDF.js para PDF.

Os documentos selecionados pelo usuário são processados no navegador. O projeto atual não envia esses arquivos para um servidor.

## Estrutura principal

```text
app/
  api/events/route.ts
  api/news/route.ts
  globals.css
  layout.tsx
  page.tsx
public/
  documentos/
  ferramentas/
    vendor/
build/
db/
scripts/
tests/
worker/
.openai/hosting.json
package.json
package-lock.json
vite.config.ts
next.config.ts
```

## Arquivos que não fazem parte do ZIP

Foram excluídos intencionalmente:

- `.git/` e histórico do repositório;
- `node_modules/`;
- `.next/`, `dist/` e outros resultados de compilação;
- `.sites-runtime/` e logs locais;
- arquivos `.env*` reais;
- tokens, senhas, cookies e chaves privadas.

Esses arquivos não são necessários porque as dependências podem ser restauradas com `npm ci` e o projeto pode ser recompilado com `npm run build`.

## Identificação desta exportação

- site: `https://elessandro.com.br`;
- versão publicada: 13;
- commit de origem: `8147ae7e454299762267d7b2832e48780e7fcf8a`;
- data da exportação: 16/07/2026;
- nenhuma credencial incluída.

