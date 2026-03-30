export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }

  try {
    const body = await req.json()

    /**
     * GEMINI TRANSLATION LAYER
     * Google expects a 'contents' array with 'parts'. 
     * If your frontend is already sending a prompt, we map it here.
     */
    const geminiBody = {
      contents: [{
        parts: [{
          text: body.prompt || "Please analyze these documents for my CV."
        }]
      }],
      generationConfig: {
        temperature: 0.2, // Lower temp is better for factual CV synthesis
        maxOutputTokens: 2048,
      }
    }

    // Note: Gemini puts the API key in the URL query string
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiBody),
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'Gemini API Error' }), { 
        status: response.status, 
        headers 
      })
    }

    /**
     * MAPPING BACK TO YOUR UI
     * Your frontend likely expects the Claude response format. 
     * We wrap Gemini's text into a similar structure so your UI doesn't break.
     */
    const formattedResponse = {
      content: [{ 
        text: data.candidates?.[0]?.content?.parts?.[0]?.text || "No synthesis generated." 
      }],
      id: `gemini-${Date.now()}`
    }

    return new Response(JSON.stringify(formattedResponse), { headers })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}
