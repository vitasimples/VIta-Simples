// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function askAI(question) {
  // 1) Tenta OpenAI se houver chave
  if (process.env.OPENAI_API_KEY) {
    const { OpenAI } = require("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    try {
      const resp = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: question }],
        temperature: 0.7
      });
      return resp.choices[0].message.content.trim();
    } catch (err) {
      console.warn("OpenAI erro:", err.response?.status || err.message);
      if (err.response?.status !== 429) throw err;
      // se for cota, cai no fallback
    }
  }

  // 2) Fallback para Gemini
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Nenhuma chave de IA disponível");
  }
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  const body = { contents: [{ parts: [{ text: question }] }] };
  const headers = {
    "Content-Type": "application/json",
    "x-goog-api-key": process.env.GEMINI_API_KEY
  };

  const gemResp = await axios.post(url, body, { headers });
  //console.log("👁️ Gemini raw response:", JSON.stringify(gemResp.data, null, 2));

  // Extrai o texto que está em candidates[0].content.parts[].text
  const candidate = gemResp.data.candidates?.[0] || {};
  let text = "";
  if (candidate.content?.parts) {
    text = candidate.content.parts.map((p) => p.text).join("");
  } else if (candidate.text) {
    text = candidate.text;
  } else if (candidate.message) {
    text = candidate.message;
  }
  return text.trim();
}

// Rota de perguntas
app.post("/ask", async (req, res) => {
  const { question, userId } = req.body;
  console.log(`Pergunta do usuário ${userId}: ${question}`);
  try {
    const answer = await askAI(question);
    res.json({ answer });
  } catch (e) {
    //console.error("Erro ao chamar IA:", e.message);
    res.status(500).json({ answer: "Desculpe, não consegui responder agora." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
