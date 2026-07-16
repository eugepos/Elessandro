export default function SiteFooter() {
  return (
    <>
      <footer className="site-footer">
        <div><strong>Elessandro Eugênio</strong><span>Meu espaço de ferramentas, notícias e cultura.</span></div>
        <nav aria-label="Navegação do rodapé"><a href="/">Início</a><a href="/noticias">Notícias</a><a href="/agenda">Agenda</a></nav>
      </footer>
      <a className="back-to-top" href="#inicio" aria-label="Voltar ao início da página">↑</a>
    </>
  );
}
