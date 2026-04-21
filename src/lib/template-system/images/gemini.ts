const GEMINI_MODEL = "gemini-3.1-flash-image-preview";
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent";
const MAX_RETRIES = 6;
const REQUEST_TIMEOUT_MS = 120_000;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

function getGeminiApiKey() {
  const key =
    process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();

  if (!key) {
    throw new Error(
      "Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_API_KEY before running image generation."
    );
  }

  return key;
}

export async function generateGeminiImage(input: {
  prompt: string;
  negativePrompt: string;
}) {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response: Response;

    try {
      response = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: {
          "x-goog-api-key": getGeminiApiKey(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${input.prompt}\n\nAvoid the following: ${input.negativePrompt}`,
                },
              ],
            },
          ],
        }),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeout);

      if (
        error instanceof Error &&
        error.name === "AbortError" &&
        attempt < MAX_RETRIES
      ) {
        await new Promise((resolve) =>
          setTimeout(resolve, attempt * 5000 + Math.floor(Math.random() * 1000))
        );
        continue;
      }

      lastError =
        error instanceof Error
          ? error
          : new Error("Gemini image generation failed unexpectedly.");
      break;
    }

    clearTimeout(timeout);

    if (!response.ok) {
      if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < MAX_RETRIES) {
        await new Promise((resolve) =>
          setTimeout(resolve, attempt * 5000 + Math.floor(Math.random() * 1000))
        );
        continue;
      }

      const error = new Error(
        `Gemini image generation failed: ${response.status} ${response.statusText}`
      );
      lastError = error;
      break;
    }

    const payload = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
            inlineData?: {
              mimeType?: string;
              data?: string;
            };
          }>;
        };
      }>;
    };

    const part = payload.candidates?.[0]?.content?.parts?.find(
      (candidatePart) => candidatePart.inlineData?.data
    );

    if (!part?.inlineData?.data) {
      const textResponse = payload.candidates?.[0]?.content?.parts
        ?.map((candidatePart) => candidatePart.text?.trim())
        .filter(Boolean)
        .join(" ")
        .trim();

      lastError = new Error(
        textResponse
          ? `Gemini image generation returned no inline image payload. Model text: ${textResponse}`
          : "Gemini image generation returned no inline image payload."
      );
      break;
    }

    return {
      model: GEMINI_MODEL,
      contentType: part.inlineData.mimeType ?? "image/png",
      bytes: Buffer.from(part.inlineData.data, "base64"),
    };
  }

  throw lastError ?? new Error("Gemini image generation failed unexpectedly.");
}
