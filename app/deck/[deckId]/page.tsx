"use client";

import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "next-auth/react";

type Difficulty = "easy" | "medium" | "hard";

interface CardType {
  _id: string;
  front: string;
  back: string;
  deckId: string;
  difficulty?: Difficulty;
  studyStats: {
    lastStudied: string | null;
    studyCount: number;
    correctCount?: number;
  };
  createdAt: string;
  updatedAt: string;
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

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [cardToEdit, setCardToEdit] = useState<CardType | null>(null);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newCard, setNewCard] = useState({
    front: "",
    back: "",
    difficulty: "medium" as Difficulty,
  });

  const [editCard, setEditCard] = useState({
    front: "",
    back: "",
    difficulty: "medium" as Difficulty,
  });

  // Fetch deck and flashcards data
  useEffect(() => {
    const fetchData = async () => {
      if (!deckId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch deck info
        const deckResponse = await fetch(`/api/decks/${deckId}`);
        if (!deckResponse.ok) {
          throw new Error("Failed to fetch deck");
        }
        const deckData = await deckResponse.json();
        setDeck(deckData);

        // Fetch flashcards
        const cardsResponse = await fetch(`/api/decks/${deckId}/flashcards`);
        if (!cardsResponse.ok) {
          throw new Error("Failed to fetch flashcards");
        }
        const cardsData = await cardsResponse.json();
        setCards(cardsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deckId]);

  // Filter cards based on search term
  const filteredCards = cards.filter(
    (card) =>
      card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.back.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCard = async () => {
    if (!newCard.front.trim() || !newCard.back.trim()) return;

    try {
      setIsCreating(true);
      const response = await fetch(`/api/decks/${deckId}/flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          front: newCard.front,
          back: newCard.back,
          difficulty: newCard.difficulty,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create flashcard");
      }

      const data = await response.json();
      const createdCard = data.newFlashcard;
      setCards([createdCard, ...cards]);
      setNewCard({ front: "", back: "", difficulty: "medium" });
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Error creating card:", err);
      setError("Failed to create flashcard");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    setCardToDelete(cardId);
  };

  const confirmDeleteCard = async () => {
    if (!cardToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/flashcards/${cardToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete flashcard");
      }

      setCards(cards.filter((card) => card._id !== cardToDelete));
      setCardToDelete(null);
    } catch (err) {
      console.error("Error deleting card:", err);
      setError("Failed to delete flashcard");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (card: CardType) => {
    setCardToEdit(card);
    setEditCard({
      front: card.front,
      back: card.back,
      difficulty: card.difficulty || "medium",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateCard = async () => {
    if (!cardToEdit) return;

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/flashcards/${cardToEdit._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          front: editCard.front,
          back: editCard.back,
          difficulty: editCard.difficulty,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update flashcard");
      }

      const data = await response.json();
      const updatedCard = data.updatedFlashcard;
      setCards(
        cards.map((card) => (card._id === cardToEdit._id ? updatedCard : card))
      );
      setIsEditModalOpen(false);
      setCardToEdit(null);
    } catch (err) {
      console.error("Error updating card:", err);
      setError("Failed to update flashcard");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteDeck = async () => {
    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete deck");
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Error deleting deck:", err);
      setError("Failed to delete deck");
    }
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
    console.log(card);
    const timesReviewed = card.studyStats?.studyCount || 0;
    const correctCount = card.studyStats?.correctCount || 0;
    if (timesReviewed === 0) return 0;
    return Math.round((correctCount / timesReviewed) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <Link href="/" className="flex items-center justify-center">
            <Brain className="h-8 w-8 text-primary" />
            <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Memora
            </span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 sm:gap-6">
            <Link
              href="/generate"
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign Out
              </Button>
            </div>
          </nav>
        </header>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-lg">Loading deck...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <Link href="/" className="flex items-center justify-center">
            <Brain className="h-8 w-8 text-primary" />
            <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Memora
            </span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 sm:gap-6">
            <Link
              href="/generate"
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
              <Button variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </nav>
        </header>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Error Loading Deck</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Deck Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The requested deck could not be found.
            </p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            href="/generate"
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign Out
            </Button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-16 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="mt-2 text-red-700 dark:text-red-300"
            >
              Dismiss
            </Button>
          </div>
        )}

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
              <Link href={`/deck/${deckId}/study`}>
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
                      <Label htmlFor="question">Question (Front)</Label>
                      <Textarea
                        id="question"
                        placeholder="Enter the front of the card..."
                        value={newCard.front}
                        onChange={(e) =>
                          setNewCard({ ...newCard, front: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="answer">Answer (Back)</Label>
                      <Textarea
                        id="answer"
                        placeholder="Enter the back of the card..."
                        value={newCard.back}
                        onChange={(e) =>
                          setNewCard({ ...newCard, back: e.target.value })
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
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateCard}
                      disabled={
                        !newCard.front.trim() ||
                        !newCard.back.trim() ||
                        isCreating
                      }
                    >
                      {isCreating && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
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
              <Card
                key={card._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge
                      className={getDifficultyColor(
                        card.difficulty || "medium"
                      )}
                    >
                      {card.difficulty || "medium"}
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
                        onClick={() => handleDeleteCard(card._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Front:</h4>
                    <p className="text-sm text-muted-foreground">
                      {card.front}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Back:</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAnswer(card._id)}
                        className="h-6 w-6 p-0"
                      >
                        {showAnswers[card._id] ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    {showAnswers[card._id] ? (
                      <p className="text-sm text-muted-foreground">
                        {card.back}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Click to reveal answer
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>Reviewed {card.studyStats.studyCount} times</span>
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
                <Label htmlFor="edit-question">Question (Front)</Label>
                <Textarea
                  id="edit-question"
                  value={editCard.front}
                  onChange={(e) =>
                    setEditCard({ ...editCard, front: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-answer">Answer (Back)</Label>
                <Textarea
                  id="edit-answer"
                  value={editCard.back}
                  onChange={(e) =>
                    setEditCard({ ...editCard, back: e.target.value })
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
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateCard}
                disabled={
                  !editCard.front.trim() || !editCard.back.trim() || isUpdating
                }
              >
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
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
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                card from your deck.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteCard}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
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
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the deck "{deck.name}" and all
                    its flashcards. This action cannot be undone.
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
