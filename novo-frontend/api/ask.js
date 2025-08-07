import { OpenAI } from "openai";
import axios from "axios";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt não fornecido." });
  }

  try {
    // 1. Tenta usar OpenAI primeiro
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Você é um assistente útil e objetivo." },
        { role: "user", content: prompt }
      ]
    });

    const resposta = completion.choices[0]?.message?.content || "Sem resposta.";
    return res.status(200).json({ resposta });

  } catch (errorOpenAI) {
    console.warn("Erro na OpenAI:", errorOpenAI?.response?.data || errorOpenAI.message);

    // 2. Se OpenAI falhar, tenta a Gemini
    try {
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/chat-bison-001:generateMessage?key=${process.env.GOOGLE_API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
              role: "user"
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const respostaGemini = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";
      return res.status(200).json({ resposta: respostaGemini });

    } catch (errorGemini) {
      console.error("Erro na Gemini:", errorGemini?.response?.data || errorGemini.message);
      return res.status(500).json({ error: "Erro ao obter resposta de ambas as IA." });
    }
  }
}
