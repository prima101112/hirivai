"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/back-button";

export default function AddCandidate() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      id: formData.get("id") as string,
      description: formData.get("description") as string,
    };

    try {
      const response = await fetch("http://localhost:8000/candidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to add candidate");

      toast({
        title: "Success",
        description: "Candidate added successfully",
      });

      router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add candidate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <BackButton />
      <h1 className="mb-8 mt-4 text-3xl font-bold">Add Candidate</h1>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="id" className="text-sm font-medium">
            Candidate ID
          </label>
          <Input
            id="id"
            name="id"
            required
            placeholder="Enter candidate ID"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            required
            placeholder="Enter candidate description"
            rows={5}
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Candidate"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}