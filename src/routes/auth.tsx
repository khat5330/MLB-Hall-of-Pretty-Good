import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Hall of Pretty Good Admin" },
      { name: "description", content: "Sign in to manage Hall of Pretty Good inductees and review new induction posts." },
      { property: "og:title", content: "Sign in — Hall of Pretty Good Admin" },
      { property: "og:description", content: "Sign in to manage Hall of Pretty Good inductees and review new induction posts." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function signIn() {
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error.message ?? "Sign-in failed.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
        <div className="border border-border bg-secondary p-6">
          <h1 className="text-xl font-bold text-primary">Admin sign-in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to review induction posts and publish new inductees.
          </p>
          <button
            type="button"
            onClick={signIn}
            disabled={busy}
            className="mt-5 w-full rounded-sm bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? "Opening Google…" : "Continue with Google"}
          </button>
          {error && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}