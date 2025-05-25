import { NextRequest, NextResponse } from "next/server";
import Deck from "@/models/Deck";
import connectDB from "@/lib/db";
import Flashcard from "@/models/Flashcard";

export async function GET(
  req: NextRequest,
  { params }: { params: { deckId: string } }
) {
  try {
    await connectDB();
    const { deckId } = params;

    const deck = await Deck.findById(deckId).populate("flashcards");

    if (!deck) {
      return NextResponse.json({ message: "Deck not found" }, { status: 404 });
    }

    return NextResponse.json(deck, { status: 200 });
  } catch (error) {
    console.error("Error fetching deck:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { deckId: string } }
) {
  try {
    await connectDB();

    const { deckId } = params;

    const deckToDelete = await Deck.findById(deckId);
    if (!deckToDelete) {
      return NextResponse.json({ message: "Deck not found" }, { status: 404 });
    }

    await Flashcard.deleteMany({ deckId });

    await Deck.findByIdAndDelete(deckId);

    return NextResponse.json(
      { message: "Deck and associated flashcards deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting deck and flashcards:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { deckId: string } }
) {
  try {
    await connectDB();
    const { deckId } = await params;
    const body = await req.json();

    const { name, description } = body;

    if (name === undefined && description === undefined) {
      return NextResponse.json(
        { message: "Nothing to update" },
        { status: 400 }
      );
    }

    const updateData: Partial<{ name: string; description: string }> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const updatedDeck = await Deck.findByIdAndUpdate(deckId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedDeck) {
      return NextResponse.json({ message: "Deck not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Deck updated successfully", updatedDeck },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating deck:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
