const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * Parse a freeform lift log message into structured lift objects.
 * @param {string} message - Raw user input
 * @param {{ sets: number, reps: string }} defaults - User's default preset
 * @returns {Promise<{ lifts: Array, reply: string }>}
 */
export async function parseLiftMessage(message, defaults) {
  const prompt = `You are a gym logging assistant. Parse the following workout message into structured JSON.

Default preset: ${defaults.sets} sets, ${defaults.reps} reps.

Rules:
- Fix typos and shorthand (e.g. "chst prs" → "Chest Press", "dl" → "Deadlift")
- Use defaults when sets or reps are not specified
- Weight is in lbs unless stated otherwise
- If weight is missing, set weight to null
- Capture any notes about failures, drop sets, form, etc.
- Return ONLY valid JSON, no markdown code blocks

Message: "${message}"

Return this exact JSON shape:
{
  "lifts": [
    {
      "name": "Exercise Name",
      "sets": 3,
      "reps": "8-10",
      "weight": 185,
      "notes": "any notes or empty string"
    }
  ],
  "reply": "Friendly 1-2 sentence confirmation of what was logged, mentioning any corrections or assumptions made."
}`;

  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Strip any accidental markdown fences
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse Gemini response as JSON");
  }
}
