import { NextRequest, NextResponse } from "next/server";
import Flashcard from "@/models/Flashcard";
import connectDB from "@/lib/db";
import Deck from "@/models/Deck";

export async function GET(
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

    const deck = await Deck.findById(deckId);
    if (!deck) {
      return NextResponse.json({ message: "Deck not found" }, { status: 404 });
    }

    const flashcards = await Flashcard.find({ deckId });

    return NextResponse.json(flashcards, { status: 200 });
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { deckId: string } }
) {
  try {
    await connectDB();

    const { deckId } = await params;

    const { front, back, difficulty } = await req.json();

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

    const newFlashcard = new Flashcard({ deckId, front, back, difficulty });
    await newFlashcard.save();

    deck.flashcards.push(newFlashcard._id);
    await deck.save();

    return NextResponse.json(
      {
        message: "Flashcard created successfully",
        newFlashcard,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating flashcard:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
