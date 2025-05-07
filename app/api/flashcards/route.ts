import { NextRequest, NextResponse } from "next/server";
import Flashcard from "@/models/Flashcard";
import connectDB from "@/lib/db";
import Deck from "@/models/Deck";

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

    const deck = Deck.findById(deckId);

    if (!deck) {
      return NextResponse.json({ message: "Deck not found" }, { status: 404 });
    }

    const newFlashcard = new Flashcard({ deckId, front, back });
    await newFlashcard.save();

    return NextResponse.json(
      { message: "Flashcard created successfully", deckId: newFlashcard._id },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
