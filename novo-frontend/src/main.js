// Registra o Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('Service Worker registrado'))
      .catch(err => console.error('Falha ao registrar SW:', err));
  });
}

import './style.css';

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // quando disparado, deixa o botão visível
  document.getElementById('install-btn').style.display = 'inline-block';
});

const root = document.querySelector('#app');
root.innerHTML = `
  <h1>Vita Simples (Demo)</h1>
  <div id="api-status">API status: ok</div>
  <div class="form">
    <textarea id="question" placeholder="Digite sua pergunta aqui..." rows="4"></textarea>
    <button id="send">Enviar</button>
  </div>
  <div id="response"></div>
  <!-- botão de instalação sempre visível -->
  <button id="install-btn" style="margin-top:1rem;">Instalar App</button>
`;

const btnSend = document.getElementById('send');
const out = document.getElementById('response');
btnSend.addEventListener('click', () => {
  const question = document.getElementById('question').value.trim();
  if (!question) return out.textContent = 'Por favor, digite uma pergunta.';
  out.textContent = 'Enviando pergunta…';
  fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, userId: 1 })
  })
    .then(res => res.json())
    .then(data => out.textContent = `Resposta: ${data.answer}`)
    .catch(() => out.textContent = 'Erro ao enviar a pergunta.');
});

const btnInstall = document.getElementById('install-btn');
btnInstall.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  // esconde o botão após usar
  btnInstall.style.display = 'none';
  deferredPrompt.prompt();
  deferredPrompt = null;
});
