import type { NextApiRequest, NextApiResponse } from "next";

type AiPayload = {
  swot?: { strength: string; weakness: string; opportunities: string; threats: string };
  goals?: Array<{ kompetensi: string; alasan: string; target: string; indikator: string }>;
  activities?: Array<{ jenis: string; judul: string; penyelenggara: string }>;
  implementation?: unknown[];
};

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
};

type OpenAiResponse = {
  choices?: {
    message?: {
      content?: string;
    };
    text?: string;
  }[];
};

type AiSuggestions = {
  goals?: Array<{ kompetensi: string; alasan: string; target: string; indikator: string }>;
  activities?: Array<{ jenis: string; judul: string; penyelenggara: string }>;
};

// 🧩 Helper: buat prompt dari payload user
function buildUserPrompt(type: string | undefined, payload: AiPayload) {
  if (!payload) return "Tolong berikan saran IDP umum (goals dan activities).";

  try {
    const parts: string[] = [];
    if (payload.swot) parts.push(`SWOT:\n${JSON.stringify(payload.swot, null, 2)}`);
    if (payload.goals) parts.push(`Current goals:\n${JSON.stringify(payload.goals, null, 2)}`);
    if (payload.activities) parts.push(`Current activities:\n${JSON.stringify(payload.activities, null, 2)}`);
    if (payload.implementation)
      parts.push(`Implementation notes:\n${JSON.stringify(payload.implementation, null, 2)}`);

    const joined = parts.join("\n\n");

    return `Sebagai AI One, analisis mendalam IDP berikut dan berikan rekomendasi pengembangan SDM yang strategis:

${joined}

Berdasarkan analisis SWOT dan data pengembangan di atas, berikan 3-5 goals dan 3-5 activities yang:
1. Memanfaatkan kekuatan (strengths) untuk menangkap peluang (opportunities)
2. Mengatasi kelemahan (weaknesses) dan memitigasi ancaman (threats)  
3. Spesifik, terukur, dan dapat dicapai dalam timeframe yang realistis
4. Selaras dengan tren pengembangan SDM terkini

Untuk setiap rekomendasi, sertakan alasan yang kuat berdasarkan analisis SWOT.`;
  } catch {
    return `AI One, berikan analisis IDP dan rekomendasi pengembangan SDM berdasarkan data berikut: ${String(payload)}. 
    
Sertakan goals dan activities yang strategis untuk pengembangan kompetensi dan karir.`;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { type, payload } = req.body as { type?: string; payload?: AiPayload } ?? {};

  const messages = [
    {
      role: "system",
      content:
        'You are AI One, an intelligent assistant specialized in Human Resource Development. Your role is to analyze Individual Development Plans (IDP) and provide strategic, actionable recommendations for professional growth. ' +
        'IMPORTANT: Reply with a single JSON object and ONLY that JSON. ' +
        'The object must have a top-level key "suggestions". Inside "suggestions", include optional keys ' +
        '"goals" (array of objects with keys: kompetensi, alasan, target, indikator) and "activities" ' +
        '(array of objects with keys: jenis, judul, penyelenggara). Provide specific, measurable, and relevant recommendations based on the SWOT analysis. Do NOT include any explanatory text outside the JSON.'
    },
    { role: "user", content: buildUserPrompt(type, payload || {}) }
  ];

  console.log("[api/ai] outgoing messages:", messages);

  // 🎯 Tentukan provider dan model
  const providerUrl =
    process.env.AI_PROVIDER_URL ||
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

  const apiKey =
    process.env.AI_PROVIDER_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.GEMINI_API_KEY;

  const model =
    process.env.AI_MODEL ||
    process.env.OPENAI_MODEL ||
    process.env.GEMINI_MODEL ||
    "gpt-4o-mini";

  if (!apiKey) {
    return res.status(500).json({ message: "AI provider API key not configured on server." });
  }

  const isGemini = providerUrl.includes("generativelanguage.googleapis.com");

  try {
    let providerRes;

    if (isGemini) {
      // 🎯 Format khusus Gemini
      const geminiBody = {
        contents: messages.map(m => ({
          role: m.role === "system" ? "user" : m.role, // Gemini tidak kenal 'system'
          parts: [{ text: m.content }]
        }))
      };

      const geminiUrl = `${providerUrl}?key=${apiKey}`;

      providerRes = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(geminiBody)
      });
    } else {
      // 🎯 Default OpenAI/OpenRouter style
      const openaiBody = { model, messages, max_tokens: 800 };

      providerRes = await fetch(providerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(openaiBody)
      });
    }

    const providerText = await providerRes.text();
    let json: unknown = null;
    try {
      json = JSON.parse(providerText);
    } catch {
      json = providerText;
    }

    if (!providerRes.ok) {
      console.error('[api/ai] provider error', providerRes.status, providerText);
      if (process.env.NODE_ENV === 'development') {
        // json is unknown; return it directly without using `any`
        return res.status(providerRes.status).json({ error: json });
      }
      return res.status(providerRes.status).json({ error: 'AI provider returned an error' });
    }

    // 🧠 Parsing text dari response
    let textContent: string | null = null;

    if (isGemini) {
      const geminiRes = json as GeminiResponse;
      textContent = geminiRes.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } else {
      const openaiRes = json as OpenAiResponse;
      const choice = openaiRes.choices?.[0];
      textContent = choice?.message?.content || choice?.text || null;
    }

    if (!textContent) textContent = JSON.stringify(json);

    // 🧩 Parsing hasil JSON
    let suggestions: AiSuggestions | null = null;
    try {
      suggestions = JSON.parse(textContent);
    } catch {
      const fenceMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (fenceMatch?.[1]) {
        try {
          suggestions = JSON.parse(fenceMatch[1]);
        } catch {}
      }
      if (!suggestions) {
        const braceMatch = textContent.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          try {
            suggestions = JSON.parse(braceMatch[0]);
          } catch {}
        }
      }
    }

    const out = {
      provider: isGemini ? "gemini" : "openai",
      suggestions,
      raw: json
    };

    res.status(200).json(out);
  } catch (err) {
    console.error("AI proxy error", err);
    res.status(500).json({ message: "Error contacting AI provider", error: String(err) });
  }
}

