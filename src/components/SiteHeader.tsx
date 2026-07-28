import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="border-b-4 border-primary bg-background">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold tracking-tight text-primary sm:text-xl">
              Hall of Pretty Good
            </span>
            <span className="hidden text-xs uppercase tracking-widest text-muted-foreground sm:inline">
              Inductee Database
            </span>
          </Link>
          <Link
            to="/honorary"
            className="text-sm font-medium text-muted-foreground underline-offset-2 hover:text-primary hover:underline [&.active]:font-semibold [&.active]:text-primary"
          >
            Honorary
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://www.instagram.com/mlbhallofgood"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-primary underline underline-offset-2"
          >
            The Official Hall of Pretty Good!
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
