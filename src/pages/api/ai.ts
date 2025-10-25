import type { NextApiRequest, NextApiResponse } from 'next'

type AiPayload = {
  swot?: { strength: string; weakness: string; opportunities: string; threats: string };
  goals?: Array<{ kompetensi: string; alasan: string; target: string; indikator: string }>;
  activities?: Array<{ jenis: string; judul: string; penyelenggara: string }>;
  implementation?: unknown[];
};

type AiSuggestions = {
  goals?: Array<{ kompetensi: string; alasan: string; target: string; indikator: string }>;
  activities?: Array<{ jenis: string; judul: string; penyelenggara: string }>;
};

// Simple helper to build a user prompt from payload
function buildUserPrompt(type: string | undefined, payload: AiPayload) {
  if (!payload) return 'Tolong berikan saran IDP umum (goals dan activities).'
  // Prefer a compact human-readable summary for the model
  try {
    const parts: string[] = []
    if (payload.swot) parts.push(`SWOT:\n${JSON.stringify(payload.swot)}`)
    if (payload.goals) parts.push(`Current goals:\n${JSON.stringify(payload.goals)}`)
    if (payload.activities) parts.push(`Current activities:\n${JSON.stringify(payload.activities)}`)
    if (payload.implementation) parts.push(`Implementation notes:\n${JSON.stringify(payload.implementation)}`)
    const joined = parts.join('\n\n')
    return `Analisis IDP berikut dan sarankan 3 goals dan 3 activities yang relevan, ringkas dan actionable. Berikan juga alasan singkat untuk tiap saran.\n\n${joined}`
  } catch {
    return `Analisis IDP berikut dan sarankan 3 goals dan 3 activities yang relevan, ringkas dan actionable. Payload: ${String(payload)}`
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  const { type, payload } = req.body as { type?: string; payload?: AiPayload } ?? {}

  // Build messages ensuring messages[1].content exists
  const messages = [
    {
      role: 'system',
      content:
        'You are an HR assistant. Provide concise, actionable IDP recommendations. IMPORTANT: Reply with a single JSON object and ONLY that JSON. The object must have a top-level key "suggestions". Inside "suggestions", include optional keys "goals" (array of objects with keys: kompetensi, alasan, target, indikator) and "activities" (array of objects with keys: jenis, judul, penyelenggara). Do NOT include any explanatory text outside the JSON.'
    },
    { role: 'user', content: buildUserPrompt(type, payload || {}) }
  ]

  // Log for debugging — remove or redact in production
  console.log('[api/ai] outgoing messages:', messages)

  // Map to provider request
  const providerUrl = process.env.AI_PROVIDER_URL || 'https://api.openai.com/v1/chat/completions'
  const apiKey = process.env.AI_PROVIDER_KEY || process.env.OPENAI_API_KEY
  const model = process.env.AI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini'

  if (!apiKey) {
    return res.status(500).json({ message: 'AI provider API key not configured on server.' })
  }

  try {
    const body = {
      model,
      messages,
      max_tokens: 800
    }

    const providerRes = await fetch(providerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    })

    const json = await providerRes.json()

    // Try to extract text content from common provider response shapes
    let textContent: string | null = null
    try {
      if (json.choices && Array.isArray(json.choices) && json.choices[0]) {
        const choice = json.choices[0]
        if (choice.message && choice.message.content) textContent = String(choice.message.content)
        else if (choice.text) textContent = String(choice.text)
      }
    } catch {
      // ignore
    }

    // If no textContent found, fallback to stringifying entire response
    if (!textContent) textContent = JSON.stringify(json)

    // Heuristic: try to parse textContent as JSON directly
    let suggestions: AiSuggestions | null = null
    try {
      suggestions = JSON.parse(textContent)
    } catch {
      // If direct parse fails, try to extract JSON block between ``` or between first {..}
      const fenceMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
      if (fenceMatch && fenceMatch[1]) {
        try { suggestions = JSON.parse(fenceMatch[1]) } catch {}
      }
      if (!suggestions) {
        // find first { ... } block
        const braceMatch = textContent.match(/\{[\s\S]*\}/)
        if (braceMatch) {
          try { suggestions = JSON.parse(braceMatch[0]) } catch {}
        }
      }
    }

    // Attach suggestions if found, otherwise suggestions stays null
    const out = { provider: json, suggestions }
    res.status(providerRes.status).json(out)
  } catch (err) {
    console.error('AI proxy error', err)
    res.status(500).json({ message: 'Error contacting AI provider', error: String(err) })
  }
}
