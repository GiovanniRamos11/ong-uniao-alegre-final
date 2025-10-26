/* formValidation.js
   - validações de formulário
   - mensagens inline de consistência
   - gravação em localStorage (simula envio)
   - modular: se o formulário existir, o módulo aplica-se automaticamente
*/
(function () {
  'use strict';

  const form = document.getElementById('vol-form');
  if (!form) return;

  const validators = {
    nome: v => v.trim().length >= 3,
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    cpf: v => {
      const s = v.replace(/\D/g,'');
      return /^\d{11}$/.test(s);
    },
    telefone: v => {
      const s = v.replace(/\D/g,'');
      return s.length >= 10; // flexível: com/sem 9
    },
    nascimento: v => {
      if (!v) return false;
      const d = new Date(v);
      const cutoff = new Date('2007-12-31');
      return d <= cutoff;
    },
    cep: v => /^\d{5}-?\d{3}$/.test(v),
    endereco: v => v.trim().length > 5,
    cidade: v => v.trim().length > 1,
    estado: v => v !== ''
  };

  function showError(input, message) {
    let wrap = input.closest('.campo') || input.parentNode;
    let small = wrap.querySelector('.error-msg');
    if (!small) {
      small = document.createElement('div');
      small.className = 'error-msg';
      wrap.appendChild(small);
    }
    small.textContent = message;
    input.setAttribute('aria-invalid', 'true');
  }

  function clearError(input) {
    const wrap = input.closest('.campo') || input.parentNode;
    const small = wrap.querySelector('.error-msg');
    if (small) small.remove();
    input.removeAttribute('aria-invalid');
  }

  function validateField(input) {
    const name = input.name;
    const val = (input.value || '').trim();
    if (validators[name]) {
      const ok = validators[name](val);
      if (!ok) {
        showError(input, 'Valor inválido ou incompleto.');
      } else {
        clearError(input);
      }
      return ok;
    }
    // campos sem validação específica: se required, validar non-empty
    if (input.required) {
      if (!val) {
        showError(input, 'Campo obrigatório.');
        return false;
      }
    }
    clearError(input);
    return true;
  }

  // valida em tempo real (input)
  form.addEventListener('input', (e) => {
    const t = e.target;
    if (!t || !t.name) return;
    validateField(t);
  });

  // valida ao submeter
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const elements = Array.from(form.querySelectorAll('input, select, textarea'));
    let valid = true;
    elements.forEach(el => {
      if (!validateField(el)) valid = false;
    });

    const consent = form.querySelector('#consent');
    if (consent && !consent.checked) {
      showError(consent, 'Você precisa aceitar os termos.');
      valid = false;
    } else if (consent) {
      clearError(consent);
    }

    if (!valid) {
      const first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }

    // preparar dados
    const data = {};
    new FormData(form).forEach((v,k)=>data[k]=v);

    // salvar localmente (array)
    try {
      const saved = JSON.parse(localStorage.getItem('voluntarios') || '[]');
      saved.push({...data, createdAt: new Date().toISOString()});
      localStorage.setItem('voluntarios', JSON.stringify(saved));
    } catch (err) {
      console.error('Erro ao gravar localStorage', err);
    }

    // emitir evento de sucesso para UI cuidar (modal)
    window.dispatchEvent(new CustomEvent('form:submitted', { detail: { data } }));

    // limpar formulário
    form.reset();
  });

})();
