import './style.css';

const root = document.querySelector('#app');
root.innerHTML = `
  <div id="header"></div>
  <div class="content">
    <div class="icons">
      <button id="clear-history" title="Limpar histórico">🗑</button>
      <button id="download-history" title="Baixar histórico">⬇️</button>
      <button id="export-history" title="Exportar histórico">📤</button>
    </div>

    <textarea id="question" placeholder="Digite sua pergunta aqui..." rows="4"></textarea>
    <button id="send">Enviar</button>
    <div id="response"></div>
    <ul id="history"></ul>
  </div>
`;

const btn = document.getElementById('send');
const out = document.getElementById('response');
const historyList = document.getElementById('history');
const clearBtn = document.getElementById('clear-history');
const downloadBtn = document.getElementById('download-history');
const exportBtn = document.getElementById('export-history');

const STORAGE_KEY = 'vita_user_history_1';

function saveToHistory(question, answer) {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  history.unshift({ question, answer, timestamp: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  historyList.innerHTML = '';
  for (const item of history) {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>Pergunta:</strong> ${item.question}<br>
      <strong>Resposta:</strong> ${formatAnswer(item.answer)}
    `;
    historyList.appendChild(li);
  }
}

function formatAnswer(answer) {
  if (typeof answer === 'string') {
    return answer;
  }

  if (Array.isArray(answer)) {
    return answer.map(part => {
      if (part.text) return part.text;
      if (part.inlineData && part.inlineData.mimeType.startsWith("image/")) {
        const base64 = part.inlineData.data;
        return `<img class="generated-image" src="data:${part.inlineData.mimeType};base64,${base64}" alt="Imagem gerada">`;
      }
      return '[conteúdo não suportado]';
    }).join("<br>");
  }

  return '[formato de resposta desconhecido]';
}

btn.addEventListener('click', async () => {
  const question = document.getElementById('question').value.trim();
  if (!question) {
    out.textContent = 'Por favor, digite uma pergunta.';
    return;
  }

  out.textContent = 'Enviando pergunta…';

  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, userId: 1 })
    });

    const data = await res.json();
    if (data.answer) {
      out.innerHTML = `Resposta: ${formatAnswer(data.answer)}`;
      saveToHistory(question, data.answer);
    } else {
      out.textContent = 'Erro: resposta inesperada.';
    }
  } catch (err) {
    console.error(err);
    out.textContent = 'Erro ao enviar a pergunta.';
  }
});

clearBtn.addEventListener('click', () => {
  if (confirm('Tem certeza que deseja limpar o histórico?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
  }
});

downloadBtn.addEventListener('click', () => {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const text = history.map(h => `Pergunta: ${h.question}\nResposta: ${formatAnswer(h.answer).replace(/<[^>]+>/g, '')}`).join('\n\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'historico_vita.txt';
  a.click();
  URL.revokeObjectURL(url);
});

exportBtn.addEventListener('click', () => {
  const history = localStorage.getItem(STORAGE_KEY);
  if (!history) return alert('Histórico vazio.');
  navigator.clipboard.writeText(history).then(() => {
    alert('Histórico exportado para a área de transferência.');
  });
});

renderHistory();
