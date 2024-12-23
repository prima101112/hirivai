"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { BackButton } from "@/components/back-button";

export default function SearchCandidates() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/candidate/query?query=${encodeURIComponent(query)}`,
        {
          method: "POST",headers: {"Access-Control-Allow-Origin": "*"}
        }
      );

      if (!response.ok) throw new Error("Failed to search candidates");

      const data = await response.json();
      setResults(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search candidates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <BackButton />
      <h1 className="mb-8 mt-4 text-3xl font-bold">Search Candidates</h1>
      
      <form onSubmit={onSubmit} className="mb-8">
        <div className="flex gap-4">
          <Input
            placeholder="Enter search query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !query.trim()}>
            <Search className="mr-2 h-4 w-4" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>

      {(
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Results</h2>
          <div className="divide-y rounded-lg border">
          {results.response}
        </div>
  </div>
      )}

{results.length === 0 && query && !loading && (
  <div className="text-center text-muted-foreground">
    No results found
  </div>
)}
    </div>
  );
}