// Substitua TODO o conteúdo do main.js por este
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
  <h2>Histórico</h2>
  <button id="clear-history">Limpar histórico</button>
  <ul id="history"></ul>
`;

const btn = document.getElementById('send');
const out = document.getElementById('response');
const historyList = document.getElementById('history');
const clearBtn = document.getElementById('clear-history');

// IndexedDB helpers
let db;
const dbName = 'VitaDB';
const storeName = 'History';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onerror = () => reject('Erro ao abrir o IndexedDB');

    request.onupgradeneeded = e => {
      db = e.target.result;
      db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
    };

    request.onsuccess = e => {
      db = e.target.result;
      resolve(db);
    };
  });
}

function saveToDB(entry) {
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  store.add(entry);
}

function getAllFromDB() {
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
}

function clearDB() {
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  store.clear();
}

function renderHistory() {
  getAllFromDB().then(data => {
    if (data.length === 0) {
      historyList.innerHTML = '<li><em>Sem perguntas anteriores.</em></li>';
      return;
    }
    historyList.innerHTML = data.map(item => `
      <li>
        <strong>${item.timestamp}</strong><br>
        <strong>P:</strong> ${item.question}<br>
        <strong>R:</strong> ${item.answer}
      </li>
    `).reverse().slice(0, 10).join('');
  });
}

clearBtn.addEventListener('click', () => {
  clearDB();
  renderHistory();
});

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
      if (data.answer) {
        out.textContent = `Resposta: ${data.answer}`;
        const entry = {
          question,
          answer: data.answer,
          timestamp: new Date().toLocaleString('pt-BR')
        };
        saveToDB(entry);
        renderHistory();
      } else {
        out.textContent = 'Resposta inválida da API.';
      }
    })
    .catch(err => {
      console.error(err);
      out.textContent = 'Erro ao enviar a pergunta.';
    });
});

openDB().then(renderHistory);
