const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

const generateWithInput = async (
  model: string,
  prompt: string,
  systemPrompt: string,
  temperature: number = 0.7,
  maxTokens: number = 100
): Promise<string> => {
  const response = await fetch(`${OPENROUTER_BASE_URL}/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Prompt Time Machine",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      temperature,
      max_tokens: maxTokens,
    }),
  });
  console.log(response);
  return response.json();
};

export async function generateWithOpenRouter(
  prompt: string,
  type: string,
  model: string,
  systemPrompt: string,
  temperature: number = 0.7,
  maxTokens: number = 100
): Promise<string> {
  if (type === "completion") {
    return await generateWithInput(
      model,
      prompt,
      systemPrompt,
      temperature,
      maxTokens
    );
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Prompt Time Machine",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      console.error("OpenRouter API error:", response);
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("OpenRouter error:", error);
    // Return a fallback response
    return `[Generated response for: ${prompt.substring(0, 30)}...]`;
  }
}
