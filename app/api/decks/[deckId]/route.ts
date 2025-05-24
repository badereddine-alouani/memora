import { NextRequest, NextResponse } from "next/server";
import Deck from "@/models/Deck";
import connectDB from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = await params;

    const deckToDelete = await Deck.findByIdAndDelete(id);

    if (!deckToDelete) {
      return NextResponse.json({ message: "Deck not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Deck deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = await params;
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

    const updatedDeck = await Deck.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedDeck) {
      return NextResponse.json({ message: "Deck not found" }, { status: 404 });
    }

    return NextResponse.json(updatedDeck, { status: 200 });
  } catch (error) {
    console.error("Error updating deck:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
