import { Link, Outlet } from "react-router-dom";
import { BookOpen, History } from "lucide-react";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-foreground font-semibold text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              QuizGen
            </Link>
            <Link
              to="/history"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              <History className="h-4 w-4" />
              History
            </Link>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
