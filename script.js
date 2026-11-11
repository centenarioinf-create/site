// script.js

/* ============================================================
   >>> AQUI É ONDE VOCÊ ADICIONA / EDITA AS PÁGINAS <<<
   
   Para adicionar uma nova página:
   1. Duplique o index.html, renomeie (ex: servicos.html)
   2. Adicione UMA linha abaixo no array "paginas"
   3. Pronto — ela aparece no menu de todas as páginas
   
   A "página ativa" é detectada AUTOMATICAMENTE
   comparando o nome do arquivo atual com o campo "arquivo".
   ============================================================ */
const CONFIG = {
  site: "Informática Valinhos",
  subtitulo: "Assistência de Informática Remota",

  paginas: [
    { arquivo: "index.html", titulo: "Início" },
    // { arquivo: "servicos.html", titulo: "Serviços" },
    // { arquivo: "sobre.html",    titulo: "Sobre" },
    // { arquivo: "contato.html",  titulo: "Contato" },
  ],

  // >>> WHATSAPP <<<
  whatsapp: {
    numero: "5519971540808", // (19) 97154-0808 com DDI 55 — confirme o número da empresa
    mensagem: "Olá. Vim pelo site e preciso de assistência de informática remota."
  },

  // >>> FAVICON <<<
  favicon: "favicon.ico", // Troque aqui para mudar o favicon em todas as páginas

  // >>> MODAL AUTOMÁTICO <<<
  modalAtivo: true, // true = abre ao entrar / false = não abre
  modalArquivo: "aviso.html", // Arquivo com o conteúdo do modal

  // >>> COOKIES / LGPD <<<
  cookieAtivo: true,
  cookieTexto: 'Este site utiliza cookies para melhorar sua experiência. Ao clicar em "Aceitar", você concorda com nossa',
  cookieLink: "politica-de-privacidade.html",
  cookieLinkTexto: "Política de Privacidade"
};
/* ============================================================ */


/* ============ UTIL ============ */
const paginaAtual = location.pathname.split("/").pop() || "index.html";

/* ============ FAVICON DINÂMICO ============ */
function aplicarFavicon() {
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = CONFIG.favicon;
}

/* ============ HEADER / MENU + BUSCA ============ */
function montarHeader() {
  const links = CONFIG.paginas.map(p => {
    const ativo = p.arquivo === paginaAtual ? ' class="ativo"' : "";
    return `<a href="${p.arquivo}"${ativo}>${p.titulo}</a>`;
  }).join("");

  document.body.insertAdjacentHTML("afterbegin", `
    <header>
      <h1>${CONFIG.site}</h1>
      <nav>${links}</nav>
      <div class="busca">
        <input type="search" id="buscaInput" placeholder="Buscar no site..." autocomplete="off">
        <div class="busca-resultados" id="buscaResultados"></div>
      </div>
    </header>
  `);

  iniciarBusca();
}

/* ============ FOOTER ============ */
function montarFooter() {
  document.body.insertAdjacentHTML("beforeend", `
    <footer>${CONFIG.site} — ${CONFIG.subtitulo}</footer>
  `);
}

/* ============ TÍTULO AUTOMÁTICO ============ */
function ajustarTitulo() {
  const p = CONFIG.paginas.find(p => p.arquivo === paginaAtual);
  document.title = p ? `${p.titulo} — ${CONFIG.site}` : CONFIG.site;
}

/* ============ SISTEMA DE BUSCA ============ */
let indiceBusca = [];

async function construirIndice() {
  indiceBusca = [];
  for (const pagina of CONFIG.paginas) {
    try {
      const resp = await fetch(pagina.arquivo);
      if (!resp.ok) continue;
      const html = await resp.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const main = doc.querySelector("main") || doc.body;
      const texto = (main.textContent || "").replace(/\s+/g, " ").trim();
      if (texto) {
        indiceBusca.push({
          arquivo: pagina.arquivo,
          titulo: pagina.titulo,
          texto: texto
        });
      }
    } catch (e) {
      // Página não encontrada ou bloqueada — ignora
    }
  }
}

function buscar(termo) {
  const t = termo.toLowerCase().trim();
  if (!t) return [];

  return indiceBusca
    .map(pag => {
      const textoLower = pag.texto.toLowerCase();
      const tituloLower = pag.titulo.toLowerCase();
      let score = 0;

      if (tituloLower.includes(t)) score += 10;
      if (textoLower.includes(t)) score += 5;

      let trecho = "";
      const pos = textoLower.indexOf(t);
      if (pos !== -1) {
        const inicio = Math.max(0, pos - 40);
        const fim = Math.min(pag.texto.length, pos + 60);
        trecho = "..." + pag.texto.slice(inicio, fim).trim() + "...";
      }

      return { ...pag, score, trecho };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

function iniciarBusca() {
  const input = document.getElementById("buscaInput");
  const resultados = document.getElementById("buscaResultados");
  if (!input || !resultados) return;

  construirIndice();

  input.addEventListener("input", () => {
    const termo = input.value;
    const achados = buscar(termo);

    if (!termo.trim()) {
      resultados.classList.remove("aberto");
      resultados.innerHTML = "";
      return;
    }

    resultados.classList.add("aberto");

    if (achados.length === 0) {
      resultados.innerHTML = `<div class="vazio">Nada encontrado.</div>`;
      return;
    }

    resultados.innerHTML = achados.map(r => `
      <a href="${r.arquivo}">
        <span class="titulo">${r.titulo}</span>
        ${r.trecho ? `<span class="trecho">${r.trecho}</span>` : ""}
      </a>
    `).join("");
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".busca")) {
      resultados.classList.remove("aberto");
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      input.value = "";
      resultados.classList.remove("aberto");
    }
  });
}

/* ============ WHATSAPP FLUTUANTE ============ */
function montarWhatsApp() {
  const numero = CONFIG.whatsapp.numero;
  const texto = encodeURIComponent(CONFIG.whatsapp.mensagem);
  const url = `https://wa.me/${numero}?text=${texto}`;

  const iconeSVG = `
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="currentColor" d="M16 .4C7.4.4.4 7.4.4 16c0 2.8.7 5.5 2.1 7.9L.3 31.7l8-2.1c2.3 1.3 4.9 1.9 7.7 1.9 8.6 0 15.6-7 15.6-15.6S24.6.4 16 .4zm0 28.5c-2.5 0-4.9-.7-7-1.9l-.5-.3-4.7 1.2 1.3-4.6-.3-.5C3.4 20.7 2.6 18.4 2.6 16 2.6 8.6 8.6 2.6 16 2.6S29.4 8.6 29.4 16 23.4 28.9 16 28.9zm7.7-9.8c-.4-.2-2.5-1.2-2.9-1.4-.4-.1-.7-.2-1 .2-.3.4-1.1 1.4-1.3 1.6-.2.3-.5.3-.9.1-.4-.2-1.8-.7-3.4-2.1-1.2-1.1-2.1-2.5-2.3-2.9-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.7.1-.3.1-.5 0-.7-.1-.2-1-2.3-1.3-3.1-.3-.8-.7-.7-1-.7h-.8c-.3 0-.7.1-1.1.5-.4.4-1.4 1.4-1.4 3.4s1.5 4 1.7 4.3c.2.3 2.9 4.5 7.1 6.3 1 .4 1.8.7 2.4.9 1 .3 1.9.3 2.6.2.8-.1 2.5-1 2.8-2 .3-1 .3-1.8.2-2-.1-.2-.4-.3-.8-.5z"/>
    </svg>`;

  document.body.insertAdjacentHTML("beforeend", `
    <a href="${url}" target="_blank" rel="noopener" class="whatsapp-float" aria-label="Fale conosco pelo WhatsApp">
      ${iconeSVG}
    </a>
  `);
}

/* ============ MODAL AUTOMÁTICO ============ */
async function montarModal() {
  if (!CONFIG.modalAtivo) return;

  try {
    const resp = await fetch(CONFIG.modalArquivo);
    if (!resp.ok) return;
    const html = await resp.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const conteudo = doc.querySelector("main") || doc.body;

    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal-overlay" id="modalOverlay">
        <div class="modal-caixa">
          <button class="modal-fechar" id="modalFechar" aria-label="Fechar">&times;</button>
          ${conteudo.innerHTML}
        </div>
      </div>
    `);

    const overlay = document.getElementById("modalOverlay");
    const fechar = document.getElementById("modalFechar");

    setTimeout(() => overlay.classList.add("aberto"), 300);

    fechar.addEventListener("click", () => overlay.classList.remove("aberto"));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("aberto");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") overlay.classList.remove("aberto");
    });

  } catch (e) {
    // Se aviso.html não existir, ignora
  }
}

/* ============ AVISO DE COOKIES (LGPD) ============ */
function montarCookies() {
  if (!CONFIG.cookieAtivo) return;
  if (localStorage.getItem("cookie_consentimento")) return;

  const link = `<a href="${CONFIG.cookieLink}">${CONFIG.cookieLinkTexto}</a>`;

  document.body.insertAdjacentHTML("beforeend", `
    <div class="cookie-banner" id="cookieBanner">
      <p>${CONFIG.cookieTexto} ${link}.</p>
      <div class="cookie-botoes">
        <button class="btn-recusar" id="cookieRecusar">Recusar</button>
        <button class="btn-aceitar" id="cookieAceitar">Aceitar</button>
      </div>
    </div>
  `);

  const banner = document.getElementById("cookieBanner");
  setTimeout(() => banner.classList.add("visivel"), 500);

  document.getElementById("cookieAceitar").addEventListener("click", () => {
    localStorage.setItem("cookie_consentimento", "aceito");
    banner.classList.remove("visivel");
  });

  document.getElementById("cookieRecusar").addEventListener("click", () => {
    localStorage.setItem("cookie_consentimento", "recusado");
    banner.classList.remove("visivel");
  });
}

/* ============ INIT ============ */
document.addEventListener("DOMContentLoaded", () => {
  aplicarFavicon();
  montarHeader();
  montarFooter();
  ajustarTitulo();
  montarWhatsApp();
  montarModal();
  montarCookies();
});