function AboutPage({ onShopClick }) {
  return (
    <section className="about-page" id="sobre-mim" aria-labelledby="about-title">
      <div className="about-heading">
        <span className="doodle-heart" aria-hidden="true">♥</span>
        <h1 id="about-title">Sobre mim</h1>
        <span className="about-spark" aria-hidden="true">✿</span>
      </div>

      <div className="about-intro">
        <div className="about-photo-stack">
          <figure className="about-portrait">
            <span className="photo-tape" aria-hidden="true" />
            <img
              src="/images/about-me/portrait.PNG"
              alt="Francita em seu ateliê, com a máquina de costura ao fundo."
            />
            <figcaption>Feito com carinho ♡</figcaption>
          </figure>
          <span className="sticker sticker-heart" aria-hidden="true">
            feito à mão<br />com amor ♥
          </span>
        </div>

        <div className="about-copy">
          <p className="handwritten">✨ Bem-vinda(o) ao meu universo criativo!</p>
          <p>
            Sou Francita, artesã e apaixonada por criar bolsas feitas à mão, cheias de
            personalidade e detalhes especiais.
          </p>
          <p>
            No meu ateliê, misturo crochê, tricô, tecidos e bordados, explorando cores,
            texturas e materiais sustentáveis. Cada peça é criada com calma, carinho e
            atenção aos detalhes, ganhando vida com aplicações de miçangas, pedrarias e
            paetês.
          </p>
          <p>
            Todas as bolsas são forradas e feitas com cuidado, unindo beleza,
            funcionalidade e exclusividade. Afinal, cada criação tem sua própria história
            — e nenhuma bolsa precisa ser igual à outra!
          </p>
          <p>
            <strong>Gostou de alguma peça?</strong> Explore minha coleção e escolha sua
            favorita! E se quiser uma bolsa em outra cor ou tamanho, entre em contato
            comigo pelo{' '}
            <a href="https://instagram.com/poucasiboasbolsas" target="_blank" rel="noreferrer">
              Instagram
            </a>{' '}
            ou{' '}
            <a href="https://wa.me/5527995055326" target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            . Vou adorar conversar com você! 💜
          </p>
          <button className="primary-action about-shop-action" type="button" onClick={onShopClick}>
            Encontrar minha bolsa ♥
          </button>
        </div>
      </div>

      <h2 className="about-gallery-heading">
        <span>Um pouquinho do meu mundo</span>
        <span aria-hidden="true">✿ ♡ ✿</span>
      </h2>
      <div className="memory-gallery">
        <figure className="memory-photo memory-one">
          <span className="photo-tape" aria-hidden="true" />
          <img
            src="/images/about-me/meu-mundo-1.png"
            alt="Detalhe de uma bolsa de crochê em tons de verde, rosa e natural, sendo trabalhada à mão."
            loading="lazy"
          />
          <figcaption>cores e natureza</figcaption>
        </figure>
        <figure className="memory-photo memory-two">
          <span className="photo-tape" aria-hidden="true" />
          <img
            src="/images/about-me/meu-mundo-2.png"
            alt="Mãos trabalhando em uma bolsa azul de crochê, com fios e materiais no ateliê."
            loading="lazy"
          />
          <figcaption>cada detalhe importa</figcaption>
        </figure>
        <figure className="memory-photo memory-three">
          <span className="photo-tape" aria-hidden="true" />
          <img
            src="/images/about-me/meu-mundo-3.png"
            alt="Detalhe de uma bolsa rosa de crochê sendo feita à mão."
            loading="lazy"
          />
          <figcaption>peças únicas ♡</figcaption>
        </figure>
      </div>
      <p className="about-note">
        Pequenas séries, muitas ideias e muito amor em cada ponto. <span aria-hidden="true">✿</span>
      </p>
    </section>
  )
}

export default AboutPage
