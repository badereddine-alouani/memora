import mongoose from "mongoose";

const deckSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    flashcards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flashcard",
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Deck = mongoose.models.Deck || mongoose.model("Deck", deckSchema);

export default Deck;
