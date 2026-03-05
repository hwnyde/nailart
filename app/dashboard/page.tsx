"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { DashboardNavbar } from "@/components/dashboard/navbar";
import { PromptArea } from "@/components/dashboard/PromptArea";

interface GenerationResult {
  image?: string;
  text?: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  const handleGenerate = async (data: {
    prompt: string;
    image: string | null;
  }) => {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: data.prompt, image: data.image }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to generate image");
        return;
      }

      setResult(json);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#181818" }}
      >
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className="min-h-screen font-montserrat relative"
      style={{
        background: "#181818",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    >
      <DashboardNavbar />

      <main
        className="flex flex-col items-center justify-center px-4"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        <div className="w-full max-w-2xl flex flex-col gap-8">
          {/* Result area */}
          {(result || isGenerating || error) && (
            <div className="flex flex-col items-center gap-4">
              {isGenerating && (
                <div className="flex flex-col items-center gap-3 py-12">
                  <div className="w-10 h-10 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                  <p className="text-gray-400 text-sm">
                    Generating your thumbnail...
                  </p>
                </div>
              )}

              {error && (
                <div className="w-full rounded-2xl bg-red-500/10 border border-red-500/20 p-4">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              {result?.image && (
                <div className="w-full flex flex-col items-center gap-3">
                  <img
                    src={result.image}
                    alt="Generated thumbnail"
                    className="w-full max-w-xl rounded-2xl shadow-2xl"
                  />
                  <div className="flex gap-2">
                    <a
                      href={result.image}
                      download="thumbnail.png"
                      className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/80 transition-colors no-underline"
                    >
                      Download
                    </a>
                    <button
                      onClick={() => {
                        setResult(null);
                        setError(null);
                      }}
                      className="px-4 py-2 rounded-full bg-[#303030] text-white text-sm font-medium hover:bg-[#404040] transition-colors border-none cursor-pointer"
                    >
                      New Thumbnail
                    </button>
                  </div>
                </div>
              )}

              {result?.text && (
                <p className="text-gray-300 text-sm text-center max-w-lg">
                  {result.text}
                </p>
              )}
            </div>
          )}

          {/* Title & Prompt */}
          {!result && !isGenerating && (
            <h1 className="text-center text-white text-3xl font-semibold m-0">
              Describe Your Thumbnail
            </h1>
          )}

          <PromptArea onSubmit={handleGenerate} isLoading={isGenerating} />
        </div>
      </main>
    </div>
  );
}
