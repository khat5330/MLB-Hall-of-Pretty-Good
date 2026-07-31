import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Hall of Pretty Good Admin" },
      {
        name: "description",
        content: "Sign in to manage Hall of Pretty Good inductees and review new induction posts.",
      },
      { property: "og:title", content: "Sign in — Hall of Pretty Good Admin" },
      {
        property: "og:description",
        content: "Sign in to manage Hall of Pretty Good inductees and review new induction posts.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message || "Sign-in failed.");
      setBusy(false);
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
        <form onSubmit={signIn} className="border border-border bg-secondary p-6">
          <h1 className="text-xl font-bold text-primary">Admin sign-in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to review induction posts and publish new inductees.
          </p>

          <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
          </label>

          <label className="mt-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="mt-5 w-full rounded-sm bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
          {error && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          )}
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
