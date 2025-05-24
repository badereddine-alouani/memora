import { NextRequest, NextResponse } from "next/server";
import Deck from "@/models/Deck";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const decks = await Deck.find({}).populate("userId", "username");

    return NextResponse.json(decks, { status: 200 });
  } catch (error) {
    console.error("Error fetching all decks:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
