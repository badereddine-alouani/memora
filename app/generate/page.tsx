"use client";

import type React from "react";

import { useState, useRef } from "react";
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

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export default function AIGeneratorPage() {
  const [inputText, setInputText] = useState("");
  const [selectedDeck, setSelectedDeck] = useState("");
  const [newDeckName, setNewDeckName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<Flashcard[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock existing decks
  const existingDecks = [
    { id: "1", name: "Biology Basics" },
    { id: "2", name: "Spanish Vocabulary" },
    { id: "3", name: "History Facts" },
    { id: "4", name: "Computer Science" },
    { id: "5", name: "Mathematics" },
  ];

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

    // Simulate AI generation with a delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Mock generated flashcards based on input length
    const numberOfCards = Math.min(Math.floor(inputText.length / 200) + 2, 8);
    const mockCards: Flashcard[] = Array.from(
      { length: numberOfCards },
      (_, i) => ({
        id: `card-${i + 1}`,
        question: `What is the key concept #${i + 1} from the provided text?`,
        answer: `This is the AI-generated answer for concept #${
          i + 1
        } based on the analysis of your input text. The AI has identified this as an important point to remember.`,
      })
    );

    setGeneratedCards(mockCards);
    setIsGenerating(false);
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

  const saveToDeck = () => {
    // Handle saving cards to selected deck
    console.log(
      "Saving cards to deck:",
      selectedDeck || newDeckName,
      generatedCards
    );
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      // Reset form
      setInputText("");
      setGeneratedCards([]);
      setSelectedDeck("");
      setNewDeckName("");
    }, 2000);
  };

  const canSave =
    generatedCards.length > 0 && (selectedDeck || newDeckName.trim());

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
          <ThemeToggle />
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Sign Up
              </Button>
            </Link>
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
                      className="min-h-[300px] resize-none"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{inputText.length}/5000 characters</span>
                      <span>
                        Recommended: 500+ characters for better results
                      </span>
                    </div>
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
                        Analyzing and Generating...
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
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a deck..." />
                      </SelectTrigger>
                      <SelectContent>
                        {existingDecks.map((deck) => (
                          <SelectItem key={deck.id} value={deck.id}>
                            {deck.name}
                          </SelectItem>
                        ))}
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
                  <div className="space-y-2">
                    <Label htmlFor="new-deck">Create New Deck</Label>
                    <Input
                      id="new-deck"
                      placeholder="Enter deck name..."
                      value={newDeckName}
                      onChange={(e) => setNewDeckName(e.target.value)}
                    />
                  </div>

                  {/* Save Button */}
                  <Button
                    onClick={saveToDeck}
                    disabled={!canSave}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {showSuccess ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Saving...
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

      {/* Success Message */}
      {showSuccess && (
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
