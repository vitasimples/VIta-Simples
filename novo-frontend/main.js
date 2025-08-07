import './style.css';

const root = document.querySelector('#app');
root.innerHTML = `
  <h1>Vita Simples (Demo)</h1>
  <div id="api-status">API status: ok</div>
  <div class="form">
    <textarea id="question" placeholder="Digite sua pergunta aqui..." rows="4"></textarea>
    <button id="send">Enviar</button>
    <button id="clear-history">Limpar histórico</button>
    <button id="export-history">Exportar histórico</button>
  </div>
  <div id="response"></div>
  <h3>Histórico:</h3>
  <ul id="history"></ul>
`;

const btnSend = document.getElementById('send');
const btnClear = document.getElementById('clear-history');
const btnExport = document.getElementById('export-history');
const out = document.getElementById('response');
const historyEl = document.getElementById('history');

const getHistory = () => {
  const h = localStorage.getItem('questionHistory');
  return h ? JSON.parse(h) : [];
};

const saveToHistory = (entry) => {
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem('questionHistory', JSON.stringify(history));
};

const renderHistory = () => {
  const history = getHistory();
  historyEl.innerHTML = '';
  history.forEach(({ question, answer }, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>Pergunta:</strong> ${question}<br/><strong>Resposta:</strong> ${answer}`;
    historyEl.appendChild(li);
  });
};

btnSend.addEventListener('click', () => {
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
      saveToHistory({ question, answer: data.answer });
      renderHistory();
    })
    .catch(err => {
      console.error(err);
      out.textContent = 'Erro ao enviar a pergunta.';
    });
});

btnClear.addEventListener('click', () => {
  localStorage.removeItem('questionHistory');
  renderHistory();
});

btnExport.addEventListener('click', () => {
  const history = getHistory();
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'historico-vita-simples.json';
  a.click();
  URL.revokeObjectURL(url);
});

// Exibe o histórico assim que o site é carregado
renderHistory();
