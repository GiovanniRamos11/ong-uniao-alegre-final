/* main.js
   - roteador SPA (hash-based)
   - sistema simples de templates (pode ser estendido)
   - carrega o conteúdo HTML das páginas .html e injeta a parte principal em #app
   - mantém histórico via hash (funciona sem servidor)
*/
(function () {
  'use strict';

  const routes = {
    '/': 'index.html',
    '/index': 'index.html',
    '/projetos': 'projetos.html',
    '/cadastro': 'cadastro.html'
  };

  // carrega HTML e injeta o <main id="app"> do recurso alvo
  function loadPage(path) {
    const file = routes[path] || 'index.html';
    // se estiver já na mesma página física e não precisar de fetch, pode retornar
    // mas para garantir comportamento SPA, vamos buscar o arquivo e extrair o main#app
    fetch(file).then(r => {
      if (!r.ok) throw new Error('Erro ao carregar ' + file);
      return r.text();
    }).then(html => {
      // extrair conteúdo de <main id="app"> ... </main>
      const m = html.match(/<main[^>]*id=["']app["'][^>]*>([\\s\\S]*?)<\\/main>/i);
      const app = document.getElementById('app');
      if (!app) return;
      if (m && m[1]) {
        app.innerHTML = m[1];
        // depois de injetar novo conteúdo, disparar evento para re-inicializar módulos (se necessário)
        window.dispatchEvent(new CustomEvent('spa:rendered', { detail: { path } }));
      } else {
        // fallback: se não achou, injeta conteúdo inteiro do HTML (cuidado)
        // como fallback simples, tenta isolar <body>
        const b = html.match(/<body[^>]*>([\\s\\S]*?)<\\/body>/i);
        app.innerHTML = b && b[1] ? b[1] : '<section><h1>Conteúdo não disponível</h1></section>';
        window.dispatchEvent(new CustomEvent('spa:rendered', { detail: { path } }));
      }
    }).catch(err => {
      console.error(err);
      const app = document.getElementById('app');
      if (app) app.innerHTML = '<section><h1>Erro ao carregar a página.</h1></section>';
    });
  }

  function parsePathFromHash() {
    const raw = (location.hash || '#/').replace(/^#/, '');
    const clean = raw.split('?')[0].replace(/^\/+/, '');
    return clean ? '/' + clean : '/';
  }

  function onHashChange() {
    const path = parsePathFromHash();
    setActiveMenu(path);
    loadPage(path);
  }

  // atualiza classe ativo nos links do menu (comportamento idêntico ao original)
  function setActiveMenu(path) {
    const links = document.querySelectorAll('a.menu-link, a.menu-link.spa-link');
    links.forEach(a => {
      const href = a.getAttribute('href') || '';
      const normalized = href.replace(/^\.?\//, '').replace('.html','').replace(/^#\//,'');
      const linkPath = normalized ? '/' + normalized : '/';
      if (linkPath === path) {
        a.classList.add('ativo');
      } else {
        a.classList.remove('ativo');
      }
    });
  }

  // quando a página for injetada, re-disparar um pequeno timeout para permitir que outros módulos (ex: validação) se liguem
  window.addEventListener('spa:rendered', (e) => {
    // se injetou o formulário, re-executar a lógica de validação (o módulo formValidation auto-executa se o form existir)
    // nada extra é necessário aqui — módulos já se auto-inicializam buscando elementos por ID
  });

  // inicialização
  window.addEventListener('hashchange', onHashChange, false);
  window.addEventListener('load', onHashChange, false);

})();
