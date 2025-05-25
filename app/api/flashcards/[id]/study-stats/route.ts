import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Flashcard from "@/models/Flashcard";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { isCorrect } = await req.json();

    if (typeof isCorrect !== "boolean") {
      return NextResponse.json(
        { message: "'isCorrect' boolean is required in request body" },
        { status: 400 }
      );
    }

    const flashcard = await Flashcard.findById(params.id);
    if (!flashcard) {
      return NextResponse.json(
        { message: "Flashcard not found" },
        { status: 404 }
      );
    }

    flashcard.studyStats.studyCount =
      (flashcard.studyStats.studyCount || 0) + 1;
    flashcard.studyStats.lastStudied = new Date();

    if (isCorrect) {
      flashcard.studyStats.correctCount =
        (flashcard.studyStats.correctCount || 0) + 1;
    }

    await flashcard.save();

    return NextResponse.json(
      {
        message: "Study stats updated successfully",
        studyStats: flashcard.studyStats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Study Stats Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
