export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { question } = req.body;

  if (!question || question.trim() === '') {
    return res.status(400).json({ error: 'Pergunta inválida' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: question
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(400).json({ error: 'Resposta inválida da API Gemini', detalhes: data });
    }

    return res.status(200).json({ answer: text });

  } catch (err) {
    console.error('Erro ao chamar Gemini API:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
