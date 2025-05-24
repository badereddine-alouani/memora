import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Flashcard from "@/models/Flashcard";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const deleted = await Flashcard.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Flashcard not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Flashcard deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Flashcard Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const updates = await req.json();

    if (!updates.front && !updates.back) {
      return NextResponse.json(
        { message: "At least one of 'front' or 'back' must be provided" },
        { status: 400 }
      );
    }

    const updatedFlashcard = await Flashcard.findByIdAndUpdate(
      params.id,
      updates,
      { new: true }
    );

    if (!updatedFlashcard) {
      return NextResponse.json(
        { message: "Flashcard not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedFlashcard, { status: 200 });
  } catch (error) {
    console.error("Update Flashcard Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
