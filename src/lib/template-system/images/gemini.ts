const GEMINI_MODEL = "gemini-2.5-flash-image";
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

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
  const response = await fetch(GEMINI_ENDPOINT, {
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
  });

  if (!response.ok) {
    throw new Error(
      `Gemini image generation failed: ${response.status} ${response.statusText}`
    );
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
    throw new Error("Gemini image generation returned no inline image payload.");
  }

  return {
    model: GEMINI_MODEL,
    contentType: part.inlineData.mimeType ?? "image/png",
    bytes: Buffer.from(part.inlineData.data, "base64"),
  };
}
