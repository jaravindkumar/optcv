export const config = { runtime: 'edge' }

export default async function handler(req) {
  // 1. Handle CORS and Methods
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
  }

  try {
    const body = await req.json()

    // 2. Prepare the Gemini Payload
    // We take the 'prompt' from your frontend and format it for Google
    const geminiBody = {
      contents: [{
        parts: [{
          text: body.prompt || "Please synthesize my profile based on the uploaded documents."
        }]
      }],
      generationConfig: {
        temperature: 0.1, // Low temperature for factual CV data
        maxOutputTokens: 2048,
      }
    }

    // 3. Call Gemini (Using your GEMINI_API_KEY from Vercel Env)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    })

    const data = await response.json()

    // 4. Handle Rate Limits (The 429 error you saw in logs)
    if (response.status === 429) {
      return new Response(JSON.stringify({ 
        error: "Gemini is overloaded. Please wait 60 seconds before clicking again." 
      }), { status: 429, headers })
    }

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API Error')
    }

    // 5. TRANSFORM DATA FOR FRONTEND
    // Gemini returns: data.candidates[0].content.parts[0].text
    // Your UI expects: { content: [{ text: "..." }] }
    const synthesizedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated.";

    const frontendCompatibleResponse = {
      content: [{
        text: synthesizedText
      }],
      id: `gemini-${Date.now()}`,
      model: "gemini-2.0-flash"
    }

    return new Response(JSON.stringify(frontendCompatibleResponse), { 
      status: 200, 
      headers 
    })

  } catch (err) {
    console.error('Edge Function Error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers 
    })
  }
}
