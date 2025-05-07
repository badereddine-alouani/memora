import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    front: {
      type: String,
      required: true,
      trim: true,
    },
    back: {
      type: String,
      required: true,
      trim: true,
    },
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deck",
      required: true,
    },

    studyStats: {
      lastStudied: {
        type: Date,
        default: null,
      },
      studyCount: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

flashcardSchema.pre("save", function (next) {
  if (this.studyStats.lastStudied) {
    this.studyStats.studyCount += 1;
  }
  next();
});

const Flashcard =
  mongoose.models.Flashcard || mongoose.model("Flashcard", flashcardSchema);

export default Flashcard;
