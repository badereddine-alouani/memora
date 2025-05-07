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
