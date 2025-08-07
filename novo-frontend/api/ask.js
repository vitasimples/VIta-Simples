// novo-frontend/api/ask.js
import "dotenv/config";
import { Configuration, OpenAIApi } from "openai";
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ answer: "Método não permitido." });
  }

  const { question, userId } = req.body;
  console.log(`Pergunta do usuário ${userId || "anônimo"}: ${question}`);

  try {
    const openai = new OpenAIApi(
      new Configuration({ apiKey: process.env.OPENAI_API_KEY })
    );
    const resp = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: question }],
      temperature: 0.7,
    });
    const texto = resp.data.choices[0].message.content.trim();
    return res.status(200).json({ answer: texto });
  } catch (err) {
    console.error("OpenAI erro:", err.message || err);

    if (!process.env.GEMINI_API_KEY) {
      return res
        .status(500)
        .json({ answer: "Desculpe, não consegui responder agora." });
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage?key=${process.env.GEMINI_API_KEY}`;
      const body = {
        prompt: { text: question },
        temperature: 0.7,
        candidateCount: 1,
      };
      const gemResp = await axios.post(url, body);
      const texto = gemResp.data.candidates[0].content.trim();
      return res.status(200).json({ answer: texto });
    } catch (gemErr) {
      console.error("Gemini erro:", gemErr.message || gemErr);
      return res
        .status(500)
        .json({ answer: "Desculpe, não consegui responder agora." });
    }
  }
}
