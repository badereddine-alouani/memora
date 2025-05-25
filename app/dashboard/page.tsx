"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Brain,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  BookOpen,
  Calendar,
  FileText,
  X,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

interface Deck {
  id: string;
  name: string;
  description: string;
  flashcardCount: number;
  lastModified: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id;
  const username = (session?.user as any)?.username;

  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [newDeck, setNewDeck] = useState({ name: "", description: "" });
  const [editDeck, setEditDeck] = useState({ name: "", description: "" });

  // Filter decks based on search term
  const filteredDecks = decks.filter((deck) =>
    deck.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDeck = async () => {
    if (newDeck.name.trim()) {
      try {
        const res = await fetch("http://localhost:3000/api/decks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId, // Replace with dynamic userId if needed
            name: newDeck.name,
            description: newDeck.description,
          }),
        });

        if (!res.ok) throw new Error("Failed to create deck");

        const data = await res.json();
        const createdDeck = data.newDeck;

        const transformedDeck: Deck = {
          id: createdDeck._id,
          name: createdDeck.name,
          description: createdDeck.description,
          flashcardCount: createdDeck.flashcards?.length || 0,
          lastModified: new Date(createdDeck.updatedAt)
            .toISOString()
            .split("T")[0],
          createdAt: new Date(createdDeck.createdAt)
            .toISOString()
            .split("T")[0],
        };

        setDecks([transformedDeck, ...decks]);
        setNewDeck({ name: "", description: "" });
        setIsCreateModalOpen(false);
      } catch (error) {
        console.error("Error creating deck:", error);
      }
    }
  };

  const handleEditDeck = async () => {
    if (!selectedDeck || !editDeck.name.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/decks/${selectedDeck.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editDeck.name,
            description: editDeck.description,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update deck");
      }

      const updatedDeckData = await res.json();
      const updatedDeck = updatedDeckData.updatedDeck;

      setDecks((prevDecks) =>
        prevDecks.map((deck) =>
          deck.id === selectedDeck.id
            ? {
                ...deck,
                name: updatedDeck.name,
                description: updatedDeck.description,
                lastModified: new Date(updatedDeck.updatedAt)
                  .toISOString()
                  .split("T")[0],
              }
            : deck
        )
      );

      setIsEditModalOpen(false);
      setSelectedDeck(null);
    } catch (error) {
      console.error("Error updating deck:", error);
    }
  };

  const handleDeleteDeck = async () => {
    if (!selectedDeck) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/decks/${selectedDeck.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete deck");
      }

      setDecks(decks.filter((deck) => deck.id !== selectedDeck.id));
      setIsDeleteDialogOpen(false);
      setSelectedDeck(null);
    } catch (error) {
      console.error("Error deleting deck:", error);
    }
  };

  const openEditModal = (deck: Deck) => {
    setSelectedDeck(deck);
    setEditDeck({ name: deck.name, description: deck.description });
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (deck: Deck) => {
    setSelectedDeck(deck);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/decks?userId=${userId}`
        );
        const data = await res.json();
        if (data.length > 0) {
          const transformed = data.map((deck: any) => ({
            id: deck._id,
            name: deck.name,
            description: deck.description,
            flashcardCount: deck.flashcards?.length || 0,
            lastModified: new Date(deck.updatedAt).toISOString().split("T")[0],
            createdAt: new Date(deck.createdAt).toISOString().split("T")[0],
          }));
          setDecks(transformed);
        }
      } catch (error) {
        console.error("Failed to fetch decks:", error);
      }
    };

    if (status === "authenticated" && userId) {
      fetchDecks();
    }
  }, [status, userId]);

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
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, {username}!
              </h1>
              <p className="text-sm text-muted-foreground">
                Ready to continue your learning journey?
              </p>
            </div>
          </div>
        </div>
        {/* Page Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Decks</h1>
              <p className="text-muted-foreground">
                Manage your flashcard decks and track your learning progress
              </p>
            </div>
            <Dialog
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            >
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Deck
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Deck</DialogTitle>
                  <DialogDescription>
                    Create a new flashcard deck to organize your study
                    materials.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Deck Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter deck name..."
                      value={newDeck.name}
                      onChange={(e) =>
                        setNewDeck({ ...newDeck, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter deck description..."
                      value={newDeck.description}
                      onChange={(e) =>
                        setNewDeck({ ...newDeck, description: e.target.value })
                      }
                    />
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
                    onClick={handleCreateDeck}
                    disabled={!newDeck.name.trim()}
                  >
                    Create Deck
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search decks..."
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

        {/* Decks Grid */}
        {filteredDecks.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "No decks found" : "No decks yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? `No decks match "${searchTerm}". Try a different search term.`
                : "Create your first flashcard deck to get started with studying."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Deck
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDecks.map((deck) => (
              <Card key={deck.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="line-clamp-2">{deck.name}</span>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openEditModal(deck)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => openDeleteDialog(deck)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {deck.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{deck.flashcardCount} cards</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(deck.lastModified)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/deck/${deck.id}`)}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/deck/${deck.id}/study`)}
                    >
                      <BookOpen className="mr-1 h-3 w-3" />
                      Study
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Deck</DialogTitle>
              <DialogDescription>
                Update your deck name and description.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Deck Name</Label>
                <Input
                  id="edit-name"
                  value={editDeck.name}
                  onChange={(e) =>
                    setEditDeck({ ...editDeck, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editDeck.description}
                  onChange={(e) =>
                    setEditDeck({ ...editDeck, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditDeck} disabled={!editDeck.name.trim()}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the deck "{selectedDeck?.name}" and
                all its flashcards. This action cannot be undone.
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
      </main>
    </div>
  );
}
