"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Brain,
  Upload,
  Zap,
  Plus,
  Trash2,
  ArrowLeft,
  Save,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface Deck {
  _id: string;
  name: string;
  description?: string;
}

export default function AIGeneratorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id;

  const [inputText, setInputText] = useState("");
  const [selectedDeck, setSelectedDeck] = useState("");
  const [newDeckName, setNewDeckName] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDeck, setNewDeck] = useState({ name: "", description: "" });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<Flashcard[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [existingDecks, setExistingDecks] = useState<Deck[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(true);
  const [maxFlashcards, setMaxFlashcards] = useState(8);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin"); // or any route you want
    }
  }, [status, router]);

  // Fetch existing decks on component mount
  useEffect(() => {
    if (status === "authenticated" && userId) {
      fetchDecks();
    }
  }, [status, userId]);

  const fetchDecks = async () => {
    try {
      setIsLoadingDecks(true);
      const response = await fetch(`/api/decks?userId=${userId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const decks = await response.json();
      setExistingDecks(decks);
    } catch (error) {
      console.error("Error fetching decks:", error);
      // Optionally set an error state here
    } finally {
      setIsLoadingDecks(false);
    }
  };

  const handleCreateDeck = async () => {
    if (newDeck.name.trim()) {
      try {
        const res = await fetch("/api/decks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            name: newDeck.name,
            description: newDeck.description,
          }),
        });

        if (!res.ok) throw new Error("Failed to create deck");

        const data = await res.json();
        const createdDeck = data.newDeck;

        // Add the new deck to the existing decks list
        setExistingDecks((prev) => [...prev, createdDeck]);

        // Optionally select the newly created deck
        setSelectedDeck(createdDeck._id);

        setNewDeck({ name: "", description: "" });
        setIsCreateModalOpen(false);
      } catch (error) {
        console.error("Error creating deck:", error);
        // Optionally show error message to user
      }
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInputText(content.substring(0, 5000)); // Limit to 5000 chars
      };
      reader.readAsText(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const generateFlashcards = async () => {
    if (!inputText.trim()) return;

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          maxFlashcards: maxFlashcards,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const flashcardsData = await response.json();

      // Transform the API response to match your Flashcard type
      const transformedCards: Flashcard[] = flashcardsData.map(
        (card: any, index: number) => ({
          id: `card-${index + 1}`,
          question: card.front,
          answer: card.back,
        })
      );

      setGeneratedCards(transformedCards);
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
      // Optionally set an error state or show a toast notification
      // setError('Failed to generate flashcards. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const editCard = (
    id: string,
    field: "question" | "answer",
    value: string
  ) => {
    setGeneratedCards((cards) =>
      cards.map((card) => (card.id === id ? { ...card, [field]: value } : card))
    );
  };

  const deleteCard = (id: string) => {
    setGeneratedCards((cards) => cards.filter((card) => card.id !== id));
  };

  const addNewCard = () => {
    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      question: "",
      answer: "",
    };
    setGeneratedCards((cards) => [...cards, newCard]);
  };

  const saveToDeck = async () => {
    if (!selectedDeck || generatedCards.length === 0) return;

    setIsSaving(true);

    try {
      // Transform flashcards to match API format
      const flashcardsForAPI = generatedCards.map((card) => ({
        front: card.question,
        back: card.answer,
      }));

      const response = await fetch(
        `/api/decks/${selectedDeck}/flashcards/all`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(flashcardsForAPI),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Flashcards saved successfully:", result);

      // Show success message after successful save
      setShowSuccess(true);

      // Hide success message and reset form after delay
      setTimeout(() => {
        setShowSuccess(false);
        // Reset form
        setInputText("");
        setGeneratedCards([]);
        setSelectedDeck("");
        setNewDeckName("");
      }, 3000);
    } catch (error) {
      console.error("Error saving flashcards:", error);
      // Optionally show error message to user
      // You might want to add an error state here
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = generatedCards.length > 0 && selectedDeck && !isSaving;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-indigo-50/30 to-purple-50/30 dark:from-background dark:via-indigo-950/10 dark:to-purple-950/10">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center">
          <Brain className="h-8 w-8 text-primary" />
          <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Memora
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
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
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          {/* Page Header */}
          <div className="text-center mb-8">
            <Badge
              variant="secondary"
              className="mb-4 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
            >
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered Generation
            </Badge>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              AI Flashcard
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Generator
              </span>
            </h1>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
              Transform any text into comprehensive flashcards instantly. Our AI
              analyzes your content and creates perfect study materials.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_400px] max-w-none">
            {/* Main Input Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Input Your Study Material
                  </CardTitle>
                  <CardDescription>
                    Paste text or upload a document to generate flashcards from
                    your study material
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Text Input */}
                  <div className="space-y-2">
                    <Label htmlFor="text-input">Paste Your Text</Label>
                    <Textarea
                      id="text-input"
                      placeholder="Paste your study material here... (lecture notes, textbook content, articles, research papers, etc.)"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[300px] resize-none break-words whitespace-pre-wrap"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{inputText.length}/5000 characters</span>
                      <span>
                        Recommended: 500+ characters for better results
                      </span>
                    </div>
                  </div>

                  {/* Max Flashcards Input */}
                  <div className="space-y-2">
                    <Label htmlFor="max-cards">
                      Maximum Flashcards to Generate
                    </Label>
                    <div className="flex items-center space-x-4">
                      <Input
                        id="max-cards"
                        type="number"
                        min="1"
                        max="20"
                        value={maxFlashcards}
                        onChange={(e) =>
                          setMaxFlashcards(
                            Math.max(
                              1,
                              Math.min(20, parseInt(e.target.value) || 1)
                            )
                          )
                        }
                        className="w-24"
                      />
                      <div className="flex-1">
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={maxFlashcards}
                          onChange={(e) =>
                            setMaxFlashcards(parseInt(e.target.value))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                        />
                      </div>
                      <span className="text-sm text-muted-foreground min-w-[60px]">
                        {maxFlashcards} card{maxFlashcards !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Choose between 1-20 flashcards. More cards work better
                      with longer content.
                    </p>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>Or Upload a Document</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                        dragActive
                          ? "border-primary bg-primary/5 scale-105"
                          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Drop your file here or click to browse
                        <br />
                        <span className="text-xs">
                          Supports: TXT, PDF, DOC, DOCX (Max 10MB)
                        </span>
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={generateFlashcards}
                    disabled={!inputText.trim() || isGenerating}
                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Generating {maxFlashcards} flashcard
                        {maxFlashcards !== 1 ? "s" : ""}...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Generate Flashcards
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Generated Flashcards */}
              {generatedCards.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>
                          Generated Flashcards ({generatedCards.length})
                        </CardTitle>
                        <CardDescription>
                          Review and edit your flashcards before saving
                        </CardDescription>
                      </div>
                      <Button onClick={addNewCard} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Card
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {generatedCards.map((card, index) => (
                      <Card key={card.id} className="relative">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="secondary">Card {index + 1}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCard(card.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <Label className="text-xs font-medium text-muted-foreground">
                                Question
                              </Label>
                              <Textarea
                                value={card.question}
                                onChange={(e) =>
                                  editCard(card.id, "question", e.target.value)
                                }
                                placeholder="Enter the question..."
                                className="min-h-[80px] resize-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-medium text-muted-foreground">
                                Answer
                              </Label>
                              <Textarea
                                value={card.answer}
                                onChange={(e) =>
                                  editCard(card.id, "answer", e.target.value)
                                }
                                placeholder="Enter the answer..."
                                className="min-h-[80px] resize-none"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Deck Selection */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Save className="h-5 w-5 text-primary" />
                    Save to Deck
                  </CardTitle>
                  <CardDescription>
                    Choose where to save your generated flashcards
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Existing Deck Selection */}
                  <div className="space-y-2">
                    <Label>Select Existing Deck</Label>
                    <Select
                      value={selectedDeck}
                      onValueChange={setSelectedDeck}
                      disabled={isLoadingDecks}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingDecks
                              ? "Loading decks..."
                              : existingDecks.length === 0
                              ? "No decks available"
                              : "Choose a deck..."
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {existingDecks.map((deck) => (
                          <SelectItem key={deck._id} value={deck._id}>
                            {deck.name}
                          </SelectItem>
                        ))}
                        {existingDecks.length === 0 && !isLoadingDecks && (
                          <SelectItem value=" " disabled>
                            No decks found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or
                      </span>
                    </div>
                  </div>

                  {/* New Deck Creation */}
                  <Dialog
                    open={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="lg" className="w-full">
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
                              setNewDeck({
                                ...newDeck,
                                description: e.target.value,
                              })
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

                  {/* Save Button */}
                  <Button
                    onClick={saveToDeck}
                    disabled={!canSave}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Saving to Deck...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Flashcards
                      </>
                    )}
                  </Button>

                  {generatedCards.length > 0 && (
                    <div className="text-xs text-muted-foreground text-center">
                      {generatedCards.length} flashcard
                      {generatedCards.length !== 1 ? "s" : ""} ready to save
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    💡 Tips for Better Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <p>• Use clear, well-structured text</p>
                  <p>• Include key concepts and definitions</p>
                  <p>• Longer text generates more cards</p>
                  <p>• Review and edit generated cards</p>
                  <p>• Add your own cards if needed</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Loading Message */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Saving flashcards...
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && !isSaving && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
            Flashcards saved successfully!
          </div>
        </div>
      )}
    </div>
  );
}
