// novo-frontend/api/ask.js
import { Configuration, OpenAIApi } from "openai";
import axios from "axios";

const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }
  const { question, userId } = req.body;

  // Função de fallback
  async function askAI(q) {
    try {
      const resp = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: q }],
        temperature: 0.7,
      });
      return resp.data.choices[0].message.content.trim();
    } catch {
      // se OpenAI falhar, fallback para Gemini
      const gemUrl =
        `https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage?key=${process.env.GEMINI_API_KEY}`;
      const gemBody = { prompt: { text: q }, temperature: 0.7, candidateCount: 1 };
      const gem = await axios.post(gemUrl, gemBody);
      return gem.data.candidates[0].content.trim();
    }
  }

  try {
    const answer = await askAI(question);
    res.status(200).json({ answer });
  } catch (e) {
    console.error(e);
    res.status(500).json({ answer: "Desculpe, não consegui responder agora." });
  }
}
