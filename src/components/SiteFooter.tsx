export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-border bg-secondary px-4 py-8 text-sm text-muted-foreground">
      <p className="mx-auto max-w-5xl leading-relaxed">
        A huge thank you to Bryce Whitlow, the founder of the MLB Hall of Pretty Good! The
        existence of a community-driven project like this is one of the things that makes American
        sports so beautiful, and I'm so glad that I get to be a small part of it. Credits to the
        MLB API for the player stats, and to{" "}
        <a
          href="https://www.baseball-reference.com/"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
        >
          Baseball Reference
        </a>{" "}
        for the WAR data.
      </p>
    </footer>
  );
}
