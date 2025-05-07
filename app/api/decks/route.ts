import { NextRequest, NextResponse } from "next/server";
import Deck from "@/models/Deck";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const decks = await Deck.find({ userId });

    console.log(userId);
    console.log(decks);

    return NextResponse.json(decks, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { userId, name, description, flashcards } = await req.json();

    if (!userId || !name) {
      return NextResponse.json(
        { message: "user and name fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const deckData = {
      userId,
      name,
      ...(description && { description }),
      ...(flashcards && { flashcards }),
    };

    const newDeck = new Deck(deckData);
    await newDeck.save();

    existingUser.decks.push(newDeck._id);
    await existingUser.save();

    return NextResponse.json(
      { message: "Deck created successfully", deckId: newDeck._id },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
