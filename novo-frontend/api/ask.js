export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { question } = req.body;

  if (!question || question.trim() === '') {
    return res.status(400).json({ error: 'Pergunta inválida' });
  }

  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    const engine = geminiKey ? 'Gemini' : 'OpenAI';
    console.log(`🧠 Engine selecionada: ${engine}`);

    if (geminiKey) {
      // Gemini API
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + geminiKey,
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
        console.error('❌ Resposta inválida da API Gemini:', data);
        return res.status(400).json({ error: 'Resposta inválida da API Gemini', detalhes: data });
      }

      return res.status(200).json({ answer: text });

    } else if (openaiKey) {
      // OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: question }],
          temperature: 0.7
        })
      });

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;

      if (!text) {
        console.error('❌ Resposta inválida da API OpenAI:', data);
        return res.status(400).json({ error: 'Resposta inválida da API OpenAI', detalhes: data });
      }

      return res.status(200).json({ answer: text });

    } else {
      return res.status(500).json({ error: 'Nenhuma chave de API foi configurada.' });
    }

  } catch (err) {
    console.error('💥 Erro ao processar pergunta:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
