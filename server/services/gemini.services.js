const Gemini_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const generateGeminiResponse = async (prompt) => {
  const maxRetries = 3;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from server environment");
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let response;

    try {
      response = await fetch(`${Gemini_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      });
    } catch (error) {
      // Retry network errors
      if (attempt < maxRetries) {
        console.error(
          `Gemini network error. Retry ${attempt + 1}/${maxRetries}`
        );
        await sleep(1000 * 2 ** attempt);
        continue;
      }

      console.error("Gemini network failure:", error.message);
      throw new Error("Gemini service is unreachable");
    }

    if (!response.ok) {
      const errorText = await response.text();
      const retryable = [429, 500, 502, 503, 504].includes(
        response.status
      );

      console.error(`Gemini API returned ${response.status}`);

      if (retryable && attempt < maxRetries) {
        await sleep(1000 * 2 ** attempt);
        continue;
      }

      const error = new Error(
        `Gemini API error ${response.status}: ${errorText}`
      );
      error.status = response.status;
      throw error;
    }

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("Gemini returned invalid JSON response");
    }

    const text = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!text) {
      console.error(
        "Gemini returned no text:",
        data.promptFeedback || "No candidate text"
      );
      throw new Error("Gemini returned no text");
    }

    const cleanText = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    try {
      return JSON.parse(cleanText);
    } catch {
      console.error("Gemini returned invalid JSON content");
      throw new Error("Gemini response was not valid JSON");
    }
  }

  throw new Error("Gemini API failed after retries");
};