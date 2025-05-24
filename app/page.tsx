"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  FileText,
  Users,
  Shuffle,
  Settings,
  Upload,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function MemoraLanding() {
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const aiSectionRef = useRef<HTMLElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in-up");
        }
      });
    }, observerOptions);

    const elements = [
      heroRef,
      featuresRef,
      aiSectionRef,
      testimonialsRef,
      ctaRef,
    ];
    elements.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const features = [
    {
      icon: Users,
      title: "User Management",
      description:
        "Secure registration and login system to keep your flashcards organized and accessible across devices.",
    },
    {
      icon: FileText,
      title: "Deck Management",
      description:
        "Create, update, and delete flashcard decks with ease. Organize your study materials however works best for you.",
    },
    {
      icon: Shuffle,
      title: "Smart Study Sessions",
      description:
        "Study with randomized flashcard order and self-evaluation tracking to optimize your learning experience.",
    },
    {
      icon: Brain,
      title: "AI-Powered Generation",
      description:
        "Transform any text or document into comprehensive flashcards using advanced AI technology.",
    },
    {
      icon: Settings,
      title: "Admin Dashboard",
      description:
        "Comprehensive admin tools for managing users, flashcards, and monitoring platform usage.",
    },
    {
      icon: Upload,
      title: "File Upload Support",
      description:
        "Upload documents, PDFs, or text files and let AI automatically generate relevant flashcards.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Medical Student",
      content:
        "Memora's AI flashcard generation saved me hours of study prep. I just upload my lecture notes and get perfectly formatted flashcards instantly!",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Language Teacher",
      content:
        "The ability to create flashcard decks from any text has revolutionized how I prepare materials for my students. Absolutely game-changing.",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "Graduate Student",
      content:
        "The randomized study sessions and self-evaluation features help me identify weak spots in my knowledge. My retention has improved dramatically.",
      rating: 5,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fade-in-up-delay-1 {
          animation: fadeInUp 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-fade-in-up-delay-2 {
          animation: fadeInUp 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }

        .animate-fade-in-up-delay-3 {
          animation: fadeInUp 0.8s ease-out 0.6s forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .scroll-smooth {
          scroll-behavior: smooth;
        }

        .feature-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .testimonial-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .testimonial-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }
      `}</style>

      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-all duration-300">
        <Link href="/" className="flex items-center justify-center">
          <Brain className="h-8 w-8 text-primary transition-transform duration-300 hover:scale-110" />
          <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Memora
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => scrollToSection("features")}
            className="text-sm font-medium hover:underline underline-offset-4 transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("testimonials")}
            className="text-sm font-medium hover:underline underline-offset-4 transition-colors cursor-pointer"
          >
            Testimonials
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-sm font-medium hover:underline underline-offset-4 transition-colors cursor-pointer"
          >
            Contact
          </button>
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <Link href="/signin">
              <Button
                variant="ghost"
                size="sm"
                className="transition-all duration-300 hover:scale-105"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-105"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-background via-indigo-50/50 to-purple-50/50 dark:from-background dark:via-indigo-950/20 dark:to-purple-950/20 opacity-0"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge
                  variant="secondary"
                  className="mb-4 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 animate-fade-in-up-delay-1"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  AI-Powered Learning
                </Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none animate-fade-in-up-delay-2">
                  Transform Any Text Into
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {" "}
                    Smart Flashcards
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl animate-fade-in-up-delay-3">
                  Memora uses advanced AI to automatically generate flashcards
                  from your text input or uploaded documents. Study smarter, not
                  harder, with intelligent flashcard creation and adaptive
                  learning sessions.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row animate-fade-in-up-delay-3">
                <Link href="/generate">
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-105"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 transition-all duration-300 hover:scale-105"
                >
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-8 animate-fade-in-up-delay-3">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Free forever plan
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  AI-powered generation
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          ref={featuresRef}
          className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 opacity-0"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything You Need to Study Effectively
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From AI-powered flashcard generation to comprehensive study
                  tracking, Memora provides all the tools you need for efficient
                  learning.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="relative overflow-hidden border-indigo-200/50 dark:border-indigo-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm feature-card"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <CardHeader>
                    <feature.icon className="h-10 w-10 text-primary transition-transform duration-300 hover:scale-110" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* AI Feature Highlight */}
        <section
          ref={aiSectionRef}
          className="w-full py-12 md:py-24 lg:py-32 opacity-0"
        >
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge
                    variant="secondary"
                    className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                  >
                    <Brain className="w-3 h-3 mr-1" />
                    AI Technology
                  </Badge>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Let AI Do the Heavy Lifting
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Simply paste your text or upload a document, and our AI will
                    automatically generate comprehensive flashcards with
                    questions and answers. No more manual card creation.
                  </p>
                </div>
                <ul className="grid gap-2 py-4">
                  <li className="flex items-center gap-2 transition-all duration-300 hover:translate-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Upload PDFs, Word docs, or plain text</span>
                  </li>
                  <li className="flex items-center gap-2 transition-all duration-300 hover:translate-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>AI extracts key concepts automatically</span>
                  </li>
                  <li className="flex items-center gap-2 transition-all duration-300 hover:translate-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Generate hundreds of cards in seconds</span>
                  </li>
                  <li className="flex items-center gap-2 transition-all duration-300 hover:translate-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Review and edit generated content</span>
                  </li>
                </ul>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    size="lg"
                    className="transition-all duration-300 hover:scale-105"
                  >
                    Try AI Generation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg blur-3xl animate-pulse" />
                  <Card className="relative w-full max-w-sm transition-all duration-300 hover:scale-105">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Document Upload</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center transition-all duration-300 hover:border-primary/50">
                        <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Drop your file here
                        </p>
                      </div>
                      <Button className="w-full" disabled>
                        <Brain className="mr-2 h-4 w-4" />
                        Generating flashcards...
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          id="testimonials"
          ref={testimonialsRef}
          className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 opacity-0"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Loved by Students and Educators
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  See how Memora is transforming the way people study and learn.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-8">
              {testimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  className="testimonial-card"
                  style={{
                    animationDelay: `${index * 0.2}s`,
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-primary text-primary transition-transform duration-300 hover:scale-125"
                        />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          ref={ctaRef}
          className="w-full py-12 md:py-24 lg:py-32 opacity-0"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Transform Your Study Sessions?
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of students and educators who are already using
                  AI-powered flashcards to learn more effectively.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button
                  size="lg"
                  className="h-12 px-8 transition-all duration-300 hover:scale-105"
                >
                  Start Learning Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 transition-all duration-300 hover:scale-105"
                >
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        id="contact"
        className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t"
      >
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary transition-transform duration-300 hover:scale-110" />
          <span className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Memora
          </span>
        </div>
        <p className="text-xs text-muted-foreground sm:ml-4">
          © {new Date().getFullYear()} Memora. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/terms"
            className="text-xs hover:underline underline-offset-4 transition-all duration-300"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="text-xs hover:underline underline-offset-4 transition-all duration-300"
          >
            Privacy Policy
          </Link>
          <Link
            href="/contact"
            className="text-xs hover:underline underline-offset-4 transition-all duration-300"
          >
            Contact
          </Link>
        </nav>
      </footer>
    </div>
  );
}
