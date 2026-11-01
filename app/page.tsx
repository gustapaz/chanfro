import ClientBoot from "./client-boot";
export default function Home() {
  return (
    <>
      <a className="skip" href="#parameters">
        Ir para os parâmetros de corte
      </a>
      <header>
        <a className="brand" href="/">
          CHANFRO<span>ESTÚDIO DE APROVEITAMENTO</span>
        </a>
        <span>PLANO DE CORTE / FOLHA 01</span>
        <a href="/api-docs.html">Regras e método ↗</a>
      </header>
      <main>
        <div className="workshop">
          <section className="board-area">
            <div className="board-heading">
              <span>CHAPA EM ESTUDO</span>
              <h1>
                O que sobra
                <br />
                também <em>conta.</em>
              </h1>
              <span>mm / mm²</span>
            </div>
            <div className="board-frame">
              <canvas
                id="sheet"
                role="img"
                aria-label="Peças posicionadas na chapa, com dimensões e coordenadas na lista de corte"
              />
              <span className="axis horizontal">LARGURA →</span>
              <span className="axis vertical">ALTURA →</span>
            </div>
            <div className="board-foot">
              <span>LINHA CONTÍNUA: PEÇA</span>
              <span>INTERVALO: ESPESSURA DA SERRA</span>
            </div>
            <details className="material">
              <summary>A matéria antes do desenho ↗</summary>
              <figure>
                <img
                  src="/media/subject.webp"
                  width="1200"
                  height="800"
                  loading="lazy"
                  alt="Bancada real de marcenaria com madeira e textura natural"
                />
                <figcaption>
                  Fotografia real licenciada Pexels. O plano é sintético e não
                  orienta o uso de ferramentas.
                </figcaption>
              </figure>
            </details>
          </section>
          <section id="parameters">
            <div id="app-root">
              <p>Preparando a bancada…</p>
            </div>
          </section>
        </div>
      </main>
      <footer>
        <strong>CHANFRO</strong>
        <span>Uma experiência de Gustavo Paz.</span>
        <a href="/credits.html">Créditos e limites ↗</a>
        <a href="https://github.com/gustapaz/chanfro">Código ↗</a>
        <button id="motion-toggle" aria-pressed="false">
          Pausar movimento
        </button>
      </footer>
      <ClientBoot />
    </>
  );
}
