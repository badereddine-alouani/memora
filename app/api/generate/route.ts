import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, maxFlashcards } = body;

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const maxCount = maxFlashcards || 10;

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. When asked to generate JSON, output only raw JSON. Do not use markdown, code blocks, or any formatting. Respond with nothing except the JSON array.",
        },
        {
          role: "user",
          content: `Generate as many flashcards as needed (with 'front' and 'back' fields) in the target language based on the following text: ${text}`,
        },
      ],
    });

    let raw = completion.choices[0].message.content?.trim() || "";
    raw = raw
      .replace(/^[^\[]*?(\[)/s, "$1")
      .replace(/```[\s\S]*?$/, "")
      .trim();

    console.log(raw);
    const parsed = JSON.parse(raw);

    const limitedFlashcards = parsed.slice(0, maxCount);

    return NextResponse.json(
      limitedFlashcards,

      { status: 200 }
    );
  } catch (error) {
    console.error("Flashcard generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}
