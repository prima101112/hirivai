import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton() {
  return (
    <Link href="/">
      <Button variant="ghost" className="gap-2">
        <ChevronLeft className="h-4 w-4" />
        Back to Menu
      </Button>
    </Link>
  );
}