"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { BackButton } from "@/components/back-button";

export default function UploadResume() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/candidate/pdf", {
        method: "POST",
        headers: {"Access-Control-Allow-Origin": "*"},
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload resume");

      toast({
        title: "Success",
        description: "Resume uploaded successfully",
      });

      router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload resume",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <BackButton />
      <h1 className="mb-8 mt-4 text-3xl font-bold">Upload Resume</h1>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="resume" className="text-sm font-medium">
            PDF Resume
          </label>
          <div className="flex gap-4">
            <Input
              id="resume"
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading || !file}
          >
            <Upload className="mr-2 h-4 w-4" />
            {loading ? "Uploading..." : "Upload Resume"}
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