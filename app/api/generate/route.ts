import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { prompt, image } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Build contents: text prompt + optional image
    const contents: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    > = [{ text: prompt }];

    if (image) {
      // image is expected as a data URL: "data:<mime>;base64,<data>"
      const match = image.match(
        /^data:(image\/\w+);base64,(.+)$/
      );
      if (match) {
        contents.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    const result: { text?: string; image?: string } = {};

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.text) {
        result.text = (result.text || "") + part.text;
      } else if (part.inlineData) {
        result.image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    if (!result.image && !result.text) {
      return NextResponse.json(
        { error: "No image was generated. Try a different prompt." },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Gemini API error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
