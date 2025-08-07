// novo-frontend/api/ask.js
import OpenAI from "openai";
import axios from "axios";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question } = req.body;

  try {
    // 1) Chama OpenAI
    const resp = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: question }],
      temperature: 0.7,
    });
    const answer = resp.choices?.[0]?.message?.content?.trim() || "";
    return res.status(200).json({ answer });
  } catch (err) {
    console.error("OpenAI erro:", err);

    // 2) Fallback para Gemini (se você tiver GEMINI_API_KEY)
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
      const gem = await axios.post(url, body);
      const gemAnswer = gem.data.candidates?.[0]?.content?.trim() || "";
      return res.status(200).json({ answer: gemAnswer });
    } catch (e) {
      console.error("Gemini erro:", e);
      return res
        .status(500)
        .json({ answer: "Desculpe, não consegui responder agora." });
    }
  }
}
