import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Candidate Management System</h1>
        </div>
      </header>
      
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Link 
            href="/add-candidate"
            className="group rounded-lg border p-6 transition-colors hover:border-foreground/50"
          >
            <h2 className="mb-2 text-xl font-semibold">
              Add Candidate Text
              <ArrowRight className="ml-2 inline-block transition-transform group-hover:translate-x-1" />
            </h2>
            <p className="text-muted-foreground">
              Add a new candidate by entering their information manually.
            </p>
          </Link>

          <Link 
            href="/upload-resume"
            className="group rounded-lg border p-6 transition-colors hover:border-foreground/50"
          >
            <h2 className="mb-2 text-xl font-semibold">
              Upload Resume
              <ArrowRight className="ml-2 inline-block transition-transform group-hover:translate-x-1" />
            </h2>
            <p className="text-muted-foreground">
              Add a new candidate by uploading their PDF resume.
            </p>
          </Link>

          <Link 
            href="/search"
            className="group rounded-lg border p-6 transition-colors hover:border-foreground/50"
          >
            <h2 className="mb-2 text-xl font-semibold">
              Search Candidates
              <ArrowRight className="ml-2 inline-block transition-transform group-hover:translate-x-1" />
            </h2>
            <p className="text-muted-foreground">
              Search and query through all candidates in the system.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}