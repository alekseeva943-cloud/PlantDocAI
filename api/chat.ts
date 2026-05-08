import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { message, history } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Ты профессиональный помощник по уходу за растениями. Отвечай подробно и полезно.",
        },
        ...(history || []),
        {
          role: "user",
          content: message,
        },
      ],
    });

    return res.status(200).json({
      summary: response.choices[0].message.content,
      recommendations: [],
      suggested_actions: [],
      disclaimer: "Рекомендации ИИ могут быть неточными.",
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "OpenAI Error",
    });
  }
}