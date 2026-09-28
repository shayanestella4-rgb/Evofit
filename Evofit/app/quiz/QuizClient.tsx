"use client";

// Tradução literal do public/index.html do projeto "Diagnóstico Evofit"
// (mesmo HTML/CSS/JS originais, sem reescrever a lógica) — só o necessário
// pra rodar dentro do Next.js: class -> className, tags fechadas, e o
// carregamento do módulo via <Script>. Ver public/css/{base,quiz}.css e
// public/js/quiz/*.js (intocados) e app/rest/v1/rpc/* (adaptação de backend).
import Script from "next/script";

export default function QuizClient() {
  return (
    <>
      <link rel="stylesheet" href="/css/base.css" />
      <link rel="stylesheet" href="/css/quiz.css" />

      <a className="skip-link" href="#main">Pular para o conteúdo</a>
      <div className="atmosphere" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <header className="topbar" data-step="hero">
        <button className="icon-btn topbar__back" type="button" aria-label="Voltar para a pergunta anterior" hidden>
          <svg className="ico" aria-hidden="true" focusable="false"><use href="/img/icons.svg#i-arrow-left" /></svg>
        </button>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- navegação real de página (igual ao site original), não SPA */}
        <a className="brand" href="/" aria-label="Evofit, voltar ao início">
          <img className="brand__mark" src="/img/brand/evofit-mark.svg" alt="" width={34} height={34} />
          <svg className="brand__word" aria-hidden="true" focusable="false"><use href="/img/icons.svg#i-evofit-word" /></svg>
        </a>
        <p className="topbar__count" hidden><span className="sr-only">Pergunta </span><span data-qnow>1</span><span aria-hidden="true">/</span><span className="sr-only"> de </span>23</p>
      </header>
      <div className="progress" role="progressbar" aria-label="Progresso do diagnóstico" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} hidden>
        <span className="progress__seg" data-g="0"><span /></span><span className="progress__seg" data-g="1"><span /></span><span className="progress__seg" data-g="2"><span /></span><span className="progress__seg" data-g="3"><span /></span><span className="progress__seg" data-g="4"><span /></span><span className="progress__seg" data-g="5"><span /></span><span className="progress__seg" data-g="6"><span /></span><span className="progress__seg" data-g="7"><span /></span>
      </div>

      <div className="layout" style={{ "--band": "38svh" } as React.CSSProperties}>
        <aside className="panel" aria-hidden="true">
          <div className="panel__media">
            <picture data-group="perfil" className="is-on">
              <source media="(min-width: 960px)" srcSet="/img/fotos/treino-cabo-lg.webp" />
              <img src="/img/fotos/treino-cabo-sm.webp" alt="" width={640} height={959} fetchPriority="high" decoding="async" />
            </picture>
            <img data-group="rotina" data-src="/img/fotos/treino-costas-sm.webp" data-srcset="/img/fotos/treino-costas-sm.webp 640w, /img/fotos/treino-costas-lg.webp 1200w" sizes="(min-width: 960px) 44vw, 100vw" alt="" decoding="async" />
            <img data-group="sono" data-src="/img/fotos/mobilidade-sm.webp" data-srcset="/img/fotos/mobilidade-sm.webp 640w, /img/fotos/mobilidade-lg.webp 736w" sizes="(min-width: 960px) 44vw, 100vw" alt="" decoding="async" />
            <img data-group="alimentacao" data-src="/img/fotos/prato-carne-ovos-sm.webp" data-srcset="/img/fotos/prato-carne-ovos-sm.webp 640w, /img/fotos/prato-carne-ovos-lg.webp 960w" sizes="(min-width: 960px) 44vw, 100vw" alt="" decoding="async" />
            <div data-group="agua" className="water-art" style={{ "--level": ".35" } as React.CSSProperties}>
              <div className="water-art__body">
                <div className="water-art__wave water-art__wave--back" />
                <div className="water-art__wave water-art__wave--front" />
                <span className="bubble" style={{ "--x": "18%", "--d": "0s", "--s": "10px" } as React.CSSProperties} />
                <span className="bubble" style={{ "--x": "46%", "--d": "1.8s", "--s": "6px" } as React.CSSProperties} />
                <span className="bubble" style={{ "--x": "72%", "--d": "3.1s", "--s": "12px" } as React.CSSProperties} />
                <span className="bubble" style={{ "--x": "85%", "--d": ".9s", "--s": "5px" } as React.CSSProperties} />
              </div>
            </div>
            <img data-group="praticidade" data-src="/img/fotos/treino-avanco-sm.webp" data-srcset="/img/fotos/treino-avanco-sm.webp 640w, /img/fotos/treino-avanco-lg.webp 736w" sizes="(min-width: 960px) 44vw, 100vw" alt="" decoding="async" />
            <img data-group="resistencia" data-src="/img/fotos/corrida-esteira-sm.webp" data-srcset="/img/fotos/corrida-esteira-sm.webp 640w, /img/fotos/corrida-esteira-lg.webp 736w" sizes="(min-width: 960px) 44vw, 100vw" alt="" decoding="async" />
            <img data-group="disciplina" data-src="/img/fotos/treino-foco-sm.webp" data-srcset="/img/fotos/treino-foco-sm.webp 640w, /img/fotos/treino-foco-lg.webp 736w" sizes="(min-width: 960px) 44vw, 100vw" alt="" decoding="async" />
            <img data-group="final" data-src="/img/fotos/treino-barra-sm.webp" data-srcset="/img/fotos/treino-barra-sm.webp 640w, /img/fotos/treino-barra-lg.webp 1200w" sizes="(min-width: 960px) 44vw, 100vw" alt="" decoding="async" />
          </div>
          <div className="panel__shade" />
          <svg className="flow-lines panel__lines" viewBox="0 0 400 600" preserveAspectRatio="none">
            <path d="M-10 520 C 90 430, 190 560, 300 440 S 420 330, 420 300" stroke="oklch(0.84 0.07 124 / .35)" />
            <path d="M-10 560 C 110 470, 210 600, 320 480 S 430 380, 430 360" stroke="oklch(0.84 0.07 124 / .18)" />
          </svg>

          <div className="panel__chips">
            <div className="float-chip float-chip--a"><svg className="ico" aria-hidden="true"><use href="/img/icons.svg#i-moon-stars" /></svg><span><small>Sono</small>7h 32min</span></div>
            <div className="float-chip float-chip--b"><svg className="ico" aria-hidden="true"><use href="/img/icons.svg#i-drop" /></svg><span><small>Água</small>2,1 L</span></div>
            <div className="float-chip float-chip--c float-ring">
              <svg viewBox="0 0 44 44"><circle cx={22} cy={22} r={18} /><circle className="float-ring__bar" cx={22} cy={22} r={18} /></svg>
              <span><strong>72%</strong><small>da meta</small></span>
            </div>
          </div>

          <div className="panel__caption">
            <p className="panel__index">01 / 08</p>
            <p className="panel__title">Seu perfil</p>
            <ol className="panel__groups">
              <li><svg className="ico"><use href="/img/icons.svg#i-user-circle" /></svg></li>
              <li><svg className="ico"><use href="/img/icons.svg#i-calendar-check" /></svg></li>
              <li><svg className="ico"><use href="/img/icons.svg#i-moon-stars" /></svg></li>
              <li><svg className="ico"><use href="/img/icons.svg#i-fork-knife" /></svg></li>
              <li><svg className="ico"><use href="/img/icons.svg#i-drop" /></svg></li>
              <li><svg className="ico"><use href="/img/icons.svg#i-barbell" /></svg></li>
              <li><svg className="ico"><use href="/img/icons.svg#i-person-simple-run" /></svg></li>
              <li><svg className="ico"><use href="/img/icons.svg#i-target" /></svg></li>
            </ol>
          </div>
        </aside>

        <main id="main" className="stage" tabIndex={-1}>
          <section className="screen screen--hero is-active" data-step="hero" aria-labelledby="hero-title">
            <div className="screen__inner hero">
              <p className="kicker hero__kicker"><svg className="ico" aria-hidden="true"><use href="/img/icons.svg#i-sparkle" /></svg>Diagnóstico Evofit · grátis</p>
              <h1 className="hero__title" id="hero-title">
                <span className="w" style={{ "--i": 0 } as React.CSSProperties}><span>Qual</span></span>{" "}
                <span className="w" style={{ "--i": 1 } as React.CSSProperties}><span>hábito</span></span>{" "}
                <span className="w" style={{ "--i": 2 } as React.CSSProperties}><span>está</span></span>{" "}
                <span className="w" style={{ "--i": 3 } as React.CSSProperties}><span>segurando</span></span>{" "}
                <span className="w" style={{ "--i": 4 } as React.CSSProperties}><span>a</span></span>{" "}
                <span className="w" style={{ "--i": 5 } as React.CSSProperties}><span>sua</span></span>{" "}
                <span className="w hero__accent" style={{ "--i": 6 } as React.CSSProperties}><span>evolução?</span></span>
              </h1>
              <p className="hero__lead">São 23 perguntas rápidas sobre sete áreas: rotina, disciplina, sono, alimentação, água, treino e fôlego. No fim, você vê sua nota de 0 a 100 em cada uma e sabe por onde começar.</p>
              <div className="hero__cta">
                <button className="btn btn--shine hero__btn" id="start" type="button">
                  <span className="btn__label">Começar meu diagnóstico</span>
                  <svg className="ico ico-go" aria-hidden="true"><use href="/img/icons.svg#i-arrow-right" /></svg>
                </button>
                <p className="hero__note"><svg className="ico" aria-hidden="true"><use href="/img/icons.svg#i-timer" /></svg>Leva uns 3 minutos. O resultado sai na hora.</p>
              </div>
              <div className="hero__proof">
                <div className="avatars" aria-hidden="true">
                  <img src="/img/pessoas/user-2.webp" alt="" width={40} height={40} loading="lazy" decoding="async" />
                  <img src="/img/pessoas/user-7.webp" alt="" width={40} height={40} loading="lazy" decoding="async" />
                  <img src="/img/pessoas/user-4.webp" alt="" width={40} height={40} loading="lazy" decoding="async" />
                  <img src="/img/pessoas/user-9.webp" alt="" width={40} height={40} loading="lazy" decoding="async" />
                </div>
                <p>Feito pra quem nunca teve tempo de treinar.</p>
              </div>
            </div>
          </section>
          <noscript><p className="noscript">O diagnóstico precisa de JavaScript ativado pra funcionar. Ative e recarregue a página.</p></noscript>
        </main>
      </div>

      <Script id="diagnostico-quiz-app" type="module" src="/js/quiz/app.js" strategy="afterInteractive" />
    </>
  );
}
