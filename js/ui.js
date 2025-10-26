/* ui.js
   - cria modal se não existir
   - escuta evento 'form:submitted' para exibir mensagem
   - intercepta cliques em links .spa-link e previne comportamento padrão para SPA
*/
(function () {
  'use strict';

  function ensureModal() {
    let modal = document.getElementById('app-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'app-modal';
    modal.className = 'modal hidden';
    modal.innerHTML = `
      <div class="modal-backdrop" data-action="close"></div>
      <div class="modal-panel" role="dialog" aria-modal="true">
        <button class="modal-close" data-action="close" aria-label="Fechar">✕</button>
        <div class="modal-content"></div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', function (e) {
      if (e.target && e.target.dataset && e.target.dataset.action === 'close') {
        closeModal();
      }
    });

    return modal;
  }

  function openModal(html) {
    const m = ensureModal();
    const content = m.querySelector('.modal-content');
    content.innerHTML = html;
    m.classList.remove('hidden');
    m.classList.add('open');
    // foco no botão de fechar para acessibilidade
    const btn = m.querySelector('.modal-close');
    if (btn) btn.focus();
  }

  function closeModal() {
    const m = document.getElementById('app-modal');
    if (!m) return;
    m.classList.remove('open');
    m.classList.add('hidden');
    // limpar conteúdo após animação curta
    setTimeout(()=> {
      const c = m.querySelector('.modal-content');
      if (c) c.innerHTML = '';
    }, 250);
  }

  // escape simples
  function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }

  // exibir modal quando formulário for submetido
  window.addEventListener('form:submitted', function (e) {
    const name = (e.detail && e.detail.data && e.detail.data.nome) ? escapeHtml(e.detail.data.nome) : 'voluntário';
    openModal('<h2>Obrigado, ' + name + '!</h2><p>Recebemos seu cadastro. Em breve entraremos em contato.</p>');
  });

  // fechar via ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  // delegação: intercepta clique em links .spa-link e transforma em navegação SPA (fetch + injeção no #app)
  document.addEventListener('click', function (e) {
    const a = e.target.closest && e.target.closest('a.spa-link');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    // se é ancoragem local (in-page) ou link externo, não interferir
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#') && href.length === 1) {
      return;
    }
    // se é um .html do site, prevenir e delegar ao router (main.js)
    if (href.endsWith('.html')) {
      e.preventDefault();
      // atualiza o hash com rota limpa (ex: cadastro.html -> /cadastro)
      const name = href.replace(/^[./]*/,'').replace('.html','');
      location.hash = '#/' + name;
    }
  }, false);

  // expor controladores se necessário
  window.AppUI = {
    openModal,
    closeModal,
    ensureModal
  };

})();
