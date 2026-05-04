import "server-only";

// Gemini "nano banana 2" image generation, accessed through Google's Generative
// Language REST API. We POST a text-only prompt and get back base64 image bytes
// inline. Caller decides where to persist them (Supabase Storage, etc.).

const DEFAULT_MODEL = "gemini-2.5-flash-image";
const ENDPOINT_TEMPLATE =
  "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent";

export type GeminiImage = {
  base64: string;
  mimeType: string;
};

function getApiKey(): string {
  const key =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    "";
  if (!key) {
    throw new Error("GEMINI_API_KEY (or GOOGLE_API_KEY) is not configured.");
  }
  return key;
}

export async function generateGeminiImage(opts: {
  prompt: string;
  model?: string;
  timeoutMs?: number;
}): Promise<GeminiImage> {
  const apiKey = getApiKey();
  const model = opts.model ?? process.env.GEMINI_IMAGE_MODEL ?? DEFAULT_MODEL;
  const url =
    ENDPOINT_TEMPLATE.replace("{model}", encodeURIComponent(model)) +
    `?key=${encodeURIComponent(apiKey)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), opts.timeoutMs ?? 90_000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: opts.prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ["IMAGE"],
        },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Gemini image gen failed (${res.status}): ${text.slice(0, 240)}`);
    }

    const body = (await res.json()) as {
      candidates?: {
        content?: {
          parts?: { inlineData?: { data?: string; mimeType?: string } }[];
        };
      }[];
    };

    const parts = body.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return {
          base64: part.inlineData.data,
          mimeType: part.inlineData.mimeType ?? "image/png",
        };
      }
    }
    throw new Error("Gemini returned no image data.");
  } finally {
    clearTimeout(timeoutId);
  }
}
