import { OpenAI } from "openai";
import axios from "axios";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  const userPrompt = req.body?.prompt;

  if (!userPrompt) {
    return res.status(400).json({ error: "Prompt não fornecido." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.7
    });

    const responseText = completion.choices[0].message.content;
    return res.status(200).json({ response: responseText });
  } catch (openaiError) {
    console.error("Erro com OpenAI:", openaiError.message);

    try {
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: userPrompt
                }
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

      const geminiText = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return res.status(200).json({ response: geminiText || "Sem resposta do Gemini." });
    } catch (geminiError) {
      console.error("Erro com Gemini:", geminiError.message);
      return res.status(500).json({ error: "Erro nas duas APIs." });
    }
  }
}
