"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Brain,
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  ArrowLeft,
  FileText,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

type Difficulty = "easy" | "medium" | "hard";

interface CardType {
  id: string;
  question: string;
  answer: string;
  difficulty: Difficulty;
  deckId: string;
  lastReviewed: string;
  timesReviewed: number;
  correctCount: number;
}

interface Deck {
  id: string;
  name: string;
  description: string;
  flashcardCount: number;
}

const DeckPage = () => {
  const params = useParams();
  const deckId = params?.deckId as string;
  const router = useRouter();

  // Mock deck data
  const [deck] = useState<Deck>({
    id: deckId,
    name: "Spanish Vocabulary",
    description: "Essential Spanish words and phrases for beginners",
    flashcardCount: 45,
  });

  // Mock flashcards data
  const [cards, setCards] = useState<CardType[]>([
    {
      id: "1",
      question: "What is 'hello' in Spanish?",
      answer: "Hola",
      difficulty: "easy",
      deckId: deckId,
      lastReviewed: "2024-01-15",
      timesReviewed: 5,
      correctCount: 4,
    },
    {
      id: "2",
      question: "How do you say 'goodbye' in Spanish?",
      answer: "Adiós",
      difficulty: "easy",
      deckId: deckId,
      lastReviewed: "2024-01-14",
      timesReviewed: 3,
      correctCount: 3,
    },
    {
      id: "3",
      question: "What does 'por favor' mean?",
      answer: "Please",
      difficulty: "medium",
      deckId: deckId,
      lastReviewed: "2024-01-13",
      timesReviewed: 4,
      correctCount: 2,
    },
    {
      id: "4",
      question: "Translate 'I am learning Spanish'",
      answer: "Estoy aprendiendo español",
      difficulty: "hard",
      deckId: deckId,
      lastReviewed: "2024-01-12",
      timesReviewed: 2,
      correctCount: 1,
    },
    {
      id: "5",
      question: "What does 'gracias' mean?",
      answer: "Thank you",
      difficulty: "easy",
      deckId: deckId,
      lastReviewed: "2024-01-11",
      timesReviewed: 6,
      correctCount: 5,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [cardToEdit, setCardToEdit] = useState<CardType | null>(null);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});

  const [newCard, setNewCard] = useState({
    question: "",
    answer: "",
    difficulty: "medium" as Difficulty,
  });

  const [editCard, setEditCard] = useState({
    question: "",
    answer: "",
    difficulty: "medium" as Difficulty,
  });

  // Filter cards based on search term
  const filteredCards = cards.filter(
    (card) =>
      card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCard = () => {
    if (newCard.question.trim() && newCard.answer.trim()) {
      const card: CardType = {
        id: Date.now().toString(),
        question: newCard.question,
        answer: newCard.answer,
        difficulty: newCard.difficulty,
        deckId: deckId,
        lastReviewed: new Date().toISOString().split("T")[0],
        timesReviewed: 0,
        correctCount: 0,
      };
      setCards([card, ...cards]);
      setNewCard({ question: "", answer: "", difficulty: "medium" });
      setIsCreateModalOpen(false);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    setCardToDelete(cardId);
  };

  const confirmDeleteCard = () => {
    if (!cardToDelete) return;
    setCards(cards.filter((card) => card.id !== cardToDelete));
    setCardToDelete(null);
  };

  const openEditModal = (card: CardType) => {
    setCardToEdit(card);
    setEditCard({
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateCard = () => {
    if (!cardToEdit) return;

    setCards(
      cards.map((card) =>
        card.id === cardToEdit.id
          ? {
              ...card,
              question: editCard.question,
              answer: editCard.answer,
              difficulty: editCard.difficulty,
            }
          : card
      )
    );
    setIsEditModalOpen(false);
    setCardToEdit(null);
  };

  const handleDeleteDeck = () => {
    router.push("/dashboard");
  };

  const toggleAnswer = (cardId: string) => {
    setShowAnswers((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
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

  const getAccuracyPercentage = (card: CardType) => {
    if (card.timesReviewed === 0) return 0;
    return Math.round((card.correctCount / card.timesReviewed) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center">
          <Brain className="h-8 w-8 text-primary" />
          <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Memora
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link
            href="/ai-generator"
            className="text-sm font-medium hover:underline underline-offset-4 transition-colors"
          >
            AI Generator
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium hover:underline underline-offset-4 transition-colors"
          >
            Dashboard
          </Link>
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              Profile
            </Button>
            <Button variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-16 py-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{deck.name}</h1>
              <p className="text-muted-foreground">{deck.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="secondary">
                  <FileText className="mr-1 h-3 w-3" />
                  {cards.length} cards
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href={`/study/${deck.id}`}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Start Studying
                </Button>
              </Link>

              <Dialog
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Card
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Flashcard</DialogTitle>
                    <DialogDescription>
                      Add a new flashcard to this deck.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="question">Question</Label>
                      <Textarea
                        id="question"
                        placeholder="Enter the question..."
                        value={newCard.question}
                        onChange={(e) =>
                          setNewCard({ ...newCard, question: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="answer">Answer</Label>
                      <Textarea
                        id="answer"
                        placeholder="Enter the answer..."
                        value={newCard.answer}
                        onChange={(e) =>
                          setNewCard({ ...newCard, answer: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select
                        value={newCard.difficulty}
                        onValueChange={(value) =>
                          setNewCard({
                            ...newCard,
                            difficulty: value as Difficulty,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateCard}
                      disabled={
                        !newCard.question.trim() || !newCard.answer.trim()
                      }
                    >
                      Create Card
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search flashcards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Flashcards Grid */}
        {filteredCards.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "No cards found" : "No flashcards yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? `No flashcards match "${searchTerm}". Try a different search term.`
                : "Add your first flashcard to start studying."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Card
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCards.map((card) => (
              <Card key={card.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge className={getDifficultyColor(card.difficulty)}>
                      {card.difficulty}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openEditModal(card)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Question:</h4>
                    <p className="text-sm text-muted-foreground">
                      {card.question}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Answer:</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAnswer(card.id)}
                        className="h-6 w-6 p-0"
                      >
                        {showAnswers[card.id] ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    {showAnswers[card.id] ? (
                      <p className="text-sm text-muted-foreground">
                        {card.answer}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Click to reveal answer
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>Reviewed {card.timesReviewed} times</span>
                    <span>{getAccuracyPercentage(card)}% accuracy</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Flashcard</DialogTitle>
              <DialogDescription>
                Update the question and answer for this flashcard.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-question">Question</Label>
                <Textarea
                  id="edit-question"
                  value={editCard.question}
                  onChange={(e) =>
                    setEditCard({ ...editCard, question: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-answer">Answer</Label>
                <Textarea
                  id="edit-answer"
                  value={editCard.answer}
                  onChange={(e) =>
                    setEditCard({ ...editCard, answer: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-difficulty">Difficulty</Label>
                <Select
                  value={editCard.difficulty}
                  onValueChange={(value) =>
                    setEditCard({
                      ...editCard,
                      difficulty: value as Difficulty,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateCard}
                disabled={!editCard.question.trim() || !editCard.answer.trim()}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!cardToDelete}
          onOpenChange={() => setCardToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                card from your deck.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteCard}>
                Delete Card
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Deck Section */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-destructive">
                Danger Zone
              </h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete this deck and all its flashcards.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Deck</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the deck "{deck.name}" and all associated cards.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteDeck}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Deck
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeckPage;
