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
    // Tenta primeiro com OpenAI (GPT-3.5 Turbo)
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Você é um assistente útil e objetivo." },
        { role: "user", content: prompt }
      ]
    });

    const respostaOpenAI = completion.choices[0]?.message?.content || "Sem resposta.";
    return res.status(200).json({ resposta: respostaOpenAI, modelo: "OpenAI" });

  } catch (openaiError) {
    console.warn("OpenAI erro:", openaiError.message);

    try {
      // Fallback: Gemini 2.0 Flash
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                { text: prompt }
              ]
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
      return res.status(200).json({ resposta: respostaGemini, modelo: "Gemini" });

    } catch (geminiError) {
      console.error("Gemini erro:", geminiError.message);
      return res.status(500).json({
        error: "Erro nas duas APIs (OpenAI e Gemini).",
        detalhes: {
          openai: openaiError.message,
          gemini: geminiError.message
        }
      });
    }
  }
}
