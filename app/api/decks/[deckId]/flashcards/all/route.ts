import { NextRequest, NextResponse } from "next/server";
import Flashcard from "@/models/Flashcard";
import connectDB from "@/lib/db";
import Deck from "@/models/Deck";

export async function POST(
  req: NextRequest,
  { params }: { params: { deckId: string } }
) {
  try {
    await connectDB();

    const { deckId } = await params;
    if (!deckId) {
      return NextResponse.json(
        { message: "deckId parameter is required" },
        { status: 400 }
      );
    }

    const flashcardsData = await req.json();

    if (!Array.isArray(flashcardsData) || flashcardsData.length === 0) {
      return NextResponse.json(
        { message: "Request body must be a non-empty array of flashcards" },
        { status: 400 }
      );
    }

    for (const card of flashcardsData) {
      if (!card.front || !card.back) {
        return NextResponse.json(
          { message: "Each flashcard must have front and back fields" },
          { status: 400 }
        );
      }
    }

    const deck = await Deck.findById(deckId);
    if (!deck) {
      return NextResponse.json({ message: "Deck not found" }, { status: 404 });
    }

    const createdFlashcards = await Flashcard.insertMany(
      flashcardsData.map(({ front, back }) => ({
        front,
        back,
        deckId,
      }))
    );

    const flashcardIds = createdFlashcards.map((fc) => fc._id);
    deck.flashcards.push(...flashcardIds);

    await deck.save();

    return NextResponse.json(
      {
        message: "Flashcards created and added to deck",
        addedCount: flashcardIds.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding flashcards:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
