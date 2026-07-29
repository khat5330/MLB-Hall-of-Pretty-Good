import { inductees as staticInductees } from "@/data/inductees";

export type InducteeRow = {
  mlbId: number;
  slug: string;
  name: string;
  pos: string;
  debut: string;
  last: string;
  bats: string;
  throws: string;
  bwar: number | null;
  innerCircle: boolean;
  prettyUnanimous: boolean;
};

function toInducteeRow(i: (typeof staticInductees)[number]): InducteeRow {
  return {
    mlbId: i.id,
    slug: i.slug,
    name: i.name,
    pos: i.pos,
    debut: i.debut,
    last: i.last,
    bats: i.bats ?? "",
    throws: i.throws ?? "",
    bwar: i.bwar ?? null,
    innerCircle: i.innerCircle ?? false,
    prettyUnanimous: i.prettyUnanimous ?? false,
  };
}

export async function fetchPublishedInductees(): Promise<InducteeRow[]> {
  return [...staticInductees]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(toInducteeRow);
}

export async function fetchInducteeBySlug(slug: string): Promise<InducteeRow | null> {
  const found = staticInductees.find((i) => i.slug === slug);
  return found ? toInducteeRow(found) : null;
}
