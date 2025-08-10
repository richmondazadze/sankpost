import { NextResponse } from "next/server";

type GenerateRequest = {
  prompt: string;
  imageDataUrl?: string | null;
  model?: string;
};

export async function POST(req: Request) {
  try {
    const { prompt, imageDataUrl, model }: GenerateRequest = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Missing prompt" },
        { status: 400 }
      );
    }

    const chosenModel =
      model?.trim() || "google/gemini-2.0-flash-exp:free";

    const messages: any[] = [
      {
        role: "user",
        content: imageDataUrl
          ? [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ]
          : [{ type: "text", text: prompt }],
      },
    ];

    const hasImage = Array.isArray(messages[0]?.content)
      && messages[0].content.some((p: any) => p?.type === "image_url");
    const primaryModel = hasImage
      ? (process.env.OPENROUTER_IMAGE_MODEL?.trim() || chosenModel)
      : chosenModel;

    const callOpenRouter = async (mdl: string) => {
      return fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}`,
          "Content-Type": "application/json",
          // Optional attribution headers
          "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL || "",
          "X-Title": "SankPost AI",
        },
        body: JSON.stringify({ model: mdl, messages }),
      });
    };

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // Try primary with retries on 429/503
    let response = await callOpenRouter(primaryModel);
    let attempt = 0;
    while ((response.status === 429 || response.status === 503) && attempt < 2) {
      await sleep(1000 * Math.pow(2, attempt));
      attempt += 1;
      response = await callOpenRouter(primaryModel);
    }

    // Optional fallback model via env if still rate-limited
    if ((response.status === 429 || response.status === 503) && process.env.OPENROUTER_FALLBACK_MODEL) {
      response = await callOpenRouter(process.env.OPENROUTER_FALLBACK_MODEL);
    }

    if (!response.ok) {
      const errorText = await response.text();
      const status = response.status;
      // Normalize rate limit guidance
      if (status === 429) {
        return NextResponse.json(
          {
            error:
              "Rate limited upstream. Please retry shortly, connect your own Google AI Studio key in OpenRouter integrations, or set OPENROUTER_FALLBACK_MODEL.",
            upstream: errorText,
          },
          { status: 429 }
        );
      }

      // If model is not available with current slug, try known alternates
      if (status === 404 && /No endpoints found/i.test(errorText)) {
        const alternates: string[] = [];
        // Prefer explicit env fallback first
        if (process.env.OPENROUTER_FALLBACK_MODEL) {
          alternates.push(process.env.OPENROUTER_FALLBACK_MODEL);
        }
        // Then try stable/known slugs
        alternates.push(
          "google/gemini-2.0-flash-exp:free",
          "google/gemini-flash-1.5",
          "google/gemini-flash-1.5-8b"
        );

        for (const alt of alternates) {
          try {
            const altResp = await callOpenRouter(alt);
            if (altResp.ok) {
              const data = await altResp.json();
              const text: string = data?.choices?.[0]?.message?.content ?? "";
              return NextResponse.json({ text, model: alt });
            }
          } catch {
            // ignore and continue
          }
        }
      }

      return NextResponse.json({ error: errorText }, { status });
    }

    const data = await response.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ text });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

