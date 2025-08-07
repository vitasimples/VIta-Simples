import './style.css';

const root = document.querySelector('#app');
root.innerHTML = `
  <h1>Vita Simples (Demo)</h1>
  <div id="api-status">API status: ok</div>
  <div class="form">
    <textarea id="question" placeholder="Digite sua pergunta aqui..." rows="4"></textarea>
    <button id="send">Enviar</button>
  </div>
  <div id="response"></div>
`;

const btn = document.getElementById('send');
const out = document.getElementById('response');
btn.addEventListener('click', () => {
  const question = document.getElementById('question').value.trim();
  if (!question) {
    out.textContent = 'Por favor, digite uma pergunta.';
    return;
  }
  out.textContent = 'Enviando pergunta…';

  fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, userId: 1 })
  })
    .then(res => res.json())
    .then(data => {
      out.textContent = `Resposta: ${data.answer}`;
    })
    .catch(err => {
      console.error(err);
      out.textContent = 'Erro ao enviar a pergunta.';
    });
});
