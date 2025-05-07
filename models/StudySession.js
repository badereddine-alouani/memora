import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deck",
      required: true,
    },
    dateStudied: {
      type: Date,
      default: Date.now,
    },
    totalTimeSpent: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    incorrectAnswers: {
      type: Number,
      default: 0,
    },
    studyCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const StudySession =
  mongoose.models.StudySession ||
  mongoose.model("StudySession", studySessionSchema);

export default StudySession;
