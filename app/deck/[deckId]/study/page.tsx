"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Eye,
  RefreshCw,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Difficulty = "easy" | "medium" | "hard";

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  difficulty: Difficulty;
}

interface StudyStats {
  correct: number;
  incorrect: number;
  total: number;
}

const flipCardStyles = `
  .perspective-1000 {
    perspective: 1000px;
  }
  .transform-style-preserve-3d {
    transform-style: preserve-3d;
  }
  .backface-hidden {
    backface-visibility: hidden;
  }
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
`;

export default function StudyPage() {
  // Mock deck and flashcards data
  const { deckId } = useParams();

  const [deck, setDeck] = useState<{
    name: string;
    description: string;
  } | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState<StudyStats>({
    correct: 0,
    incorrect: 0,
    total: 0,
  });
  const [studyTime, setStudyTime] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [incorrectCards, setIncorrectCards] = useState<Flashcard[]>([]);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const response = await fetch(`/api/decks/${deckId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch deck: ${response.status}`);
        }
        const deckData = await response.json();
        setDeck(deckData);
      } catch (err) {
        console.error("Error fetching deck:", err);
      }
    };

    fetchDeck();
  }, [deckId]);

  // Timer effect
  useEffect(() => {
    if (!isSessionComplete) {
      const timer = setInterval(() => {
        setStudyTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isSessionComplete]);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/decks/${deckId}/flashcards`);

        if (!response.ok) {
          throw new Error(`Failed to fetch flashcards: ${response.status}`);
        }

        const data = await response.json();
        setFlashcards(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load flashcards"
        );
        console.error("Error fetching flashcards:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcards();
  }, [deckId]);

  const currentCard = flashcards[currentCardIndex];
  const progress =
    ((currentCardIndex + (stats.total > currentCardIndex ? 1 : 0)) /
      flashcards.length) *
    100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleAnswer = async (isCorrect: boolean) => {
    const newStats = {
      total: stats.total + 1,
      correct: isCorrect ? stats.correct + 1 : stats.correct,
      incorrect: !isCorrect ? stats.incorrect + 1 : stats.incorrect,
    };
    setStats(newStats);

    // Add to incorrect cards if wrong
    if (!isCorrect) {
      setIncorrectCards((prev) => [...prev, currentCard]);
    }

    // Make API call to track study stats
    try {
      console.log(currentCard);
      const response = await fetch(
        `http://localhost:3000/api/flashcards/${currentCard._id}/study-stats`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isCorrect: isCorrect,
          }),
        }
      );

      if (!response.ok) {
        console.error("Failed to save study stats:", response.status);
      }
    } catch (error) {
      console.error("Error saving study stats:", error);
      // Continue with the flow even if API call fails
    }

    // Move to next card or end session
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setIsSessionComplete(true);
    }
  };

  const restartSession = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStats({ correct: 0, incorrect: 0, total: 0 });
    setStudyTime(0);
    setIsSessionComplete(false);
    setIncorrectCards([]);
  };

  const getPercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.correct / stats.total) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center space-y-4 p-6">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Error Loading Flashcards</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center space-y-4 p-6">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">No Flashcards Found</h2>
            <p className="text-muted-foreground">
              This deck doesn't have any flashcards yet.
            </p>
            <Link href={`/deck/${deckId}`}>
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Deck
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSessionComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Study Session Complete!</CardTitle>
            <p className="text-muted-foreground">
              Great job studying {deck?.name}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {stats.total}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Studied
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stats.correct}
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {stats.incorrect}
                </div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {getPercentage()}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>

            {/* Time Spent */}
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5" />
                Time Spent: {formatTime(studyTime)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={restartSession} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Study Again
              </Button>
              <Link href={`/deck/${deckId}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go to Deck
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <style jsx>{flipCardStyles}</style>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href={`/deck/${deckId}`}>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </Link>
                <div>
                  <h1 className="font-semibold">Studying: {deck?.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    Flashcard {currentCardIndex + 1} of {flashcards.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  {formatTime(studyTime)}
                </div>
                <div className="text-sm">
                  <span className="text-green-600">{stats.correct}</span> /{" "}
                  <span className="text-red-600">{stats.incorrect}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </header>

        {/* Main Study Area */}
        <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="w-full max-w-2xl">
            {/* Flashcard */}
            <Card className="min-h-[400px] relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className={getDifficultyColor(currentCard.difficulty)}>
                    {currentCard.difficulty}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {currentCardIndex + 1} / {flashcards.length}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative min-h-[400px] perspective-1000">
                <div
                  className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                  onClick={!isFlipped ? handleFlip : undefined}
                >
                  {/* Front of card */}
                  <div className="absolute inset-0 w-full h-full backface-hidden flex flex-col items-center justify-center text-center space-y-6 p-32 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-lg">
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-muted-foreground">
                        Question
                      </h2>
                      <p className="text-2xl leading-relaxed font-medium">
                        {currentCard.front}
                      </p>
                    </div>
                    <div className="mt-8 text-sm text-muted-foreground flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Click to reveal answer
                    </div>
                  </div>

                  {/* Back of card */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 flex flex-col items-center justify-center text-center space-y-6 p-32 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-muted-foreground">
                        Answer
                      </h2>
                      <p className="text-2xl leading-relaxed font-bold text-primary">
                        {currentCard.back}
                      </p>
                    </div>
                    <div className="flex gap-4 mt-8 w-full max-w-md">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnswer(false);
                        }}
                        variant="destructive"
                        size="lg"
                        className="flex-1"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Incorrect
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnswer(true);
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Correct
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Study Stats */}
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-lg font-semibold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Studied</div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">
                    {stats.correct}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="text-lg font-semibold text-red-600">
                    {stats.incorrect}
                  </div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}
