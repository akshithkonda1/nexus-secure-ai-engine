import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/components/button";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-5xl font-semibold"> Error: 404 Not Found</h1>
      <p className="max-w-md text-muted">We couldn’t find that page. Try heading back to the chat workspace.</p>
      <Button asChild>
        <Link to="/">Return home</Link>
      </Button>
    </div>
  );
}
