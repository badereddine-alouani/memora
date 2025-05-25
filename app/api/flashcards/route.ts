import { NextRequest, NextResponse } from "next/server";
import Flashcard from "@/models/Flashcard";
import Deck from "@/models/Deck";
import connectDB from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { deckId, front, back } = await req.json();

    if (!deckId || !front || !back) {
      return NextResponse.json(
        { message: "deckId, front and back fields are required" },
        { status: 400 }
      );
    }

    const deck = await Deck.findById(deckId);
    if (!deck) {
      return NextResponse.json({ message: "Deck not found" }, { status: 404 });
    }

    const newFlashcard = new Flashcard({ deckId, front, back });
    await newFlashcard.save();

    deck.flashcards.push(newFlashcard._id);
    await deck.save();

    return NextResponse.json(
      {
        message: "Flashcard created successfully",
        flashcardId: newFlashcard._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating flashcard:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
