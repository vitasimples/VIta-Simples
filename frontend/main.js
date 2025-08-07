// Código simplificado do app Vita Simples para rodar no navegador

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  app.innerHTML = `
    <h1>🌱 Vita Simples</h1>
    <p>Aplicativo simples de sobrevivência moderna (frontend simplificado)</p>
    <textarea id="question" placeholder="Digite sua pergunta aqui..." rows="4" style="width:100%;"></textarea>
    <button id="askBtn">Perguntar</button>
    <div id="answer" style="margin-top: 1em; border: 1px solid #ccc; padding: 1em;"></div>
  `;

  const askBtn = document.getElementById("askBtn");
  const questionEl = document.getElementById("question");
  const answerEl = document.getElementById("answer");

  askBtn.addEventListener("click", async () => {
    const question = questionEl.value.trim();
    if (!question) {
      alert("Digite uma pergunta!");
      return;
    }

    answerEl.textContent = "Pensando...";

    try {
      const response = await fetch("http://localhost:3001/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, userId: "local-user" }),
      });

      const data = await response.json();
      answerEl.textContent = data.answer || "Nenhuma resposta recebida.";
    } catch (e) {
      answerEl.textContent = "Erro ao conectar com o servidor backend.";
    }
  });
});
