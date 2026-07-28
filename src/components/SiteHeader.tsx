import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="border-b-4 border-primary bg-background">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-lg font-bold tracking-tight text-primary sm:text-xl">
            Hall of Pretty Good
          </span>
          <span className="hidden text-xs uppercase tracking-widest text-muted-foreground sm:inline">
            Inductee Database
          </span>
        </Link>
        <a
          href="https://www.instagram.com/hallofprettygoodinductees"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-primary underline underline-offset-2"
        >
          @hallofprettygoodinductees
        </a>
      </div>
    </header>
  );
}