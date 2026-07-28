import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { honoraryInductees } from "@/data/honoraryInductees";

export const Route = createFileRoute("/honorary")({
  head: () => ({
    meta: [
      { title: "Honorary Inductees — MLB Hall of Pretty Good" },
      {
        name: "description",
        content:
          "Honorary inductees of the MLB Hall of Pretty Good — celebrated figures from beyond the major leagues.",
      },
    ],
  }),
  component: HonoraryPage,
});

function HonoraryPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Honorary Inductees
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Legends from beyond the major leagues, inducted by the Hall of Pretty Good community.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {honoraryInductees.map((inductee) => (
            <div
              key={inductee.slug}
              className="flex items-center gap-5 border border-border bg-secondary px-5 py-4"
            >
              <img
                src={inductee.photo}
                alt={inductee.name}
                className="h-20 w-20 flex-shrink-0 rounded-sm object-cover"
              />
              <div className="min-w-0">
                <p className="font-display text-lg font-bold text-primary">{inductee.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-foreground">{inductee.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
