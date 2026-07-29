/**
 * Parses Hall of Pretty Good induction captions (Instagram or pasted by hand).
 *
 * Canonical shape:
 *   "Alex Gordon received 97% of over 39,300 votes and is now officially the
 *    82nd member of the Hall of Pretty Good! Welcome to the Inner Circle."
 */

export type ParsedInduction = {
  isInduction: boolean;
  name: string | null;
  votePct: number | null;
  bwar: number | null;
  innerCircle: boolean;
  prettyUnanimous: boolean;
};

const INDUCTION_SIGNALS = [
  /member of the hall of pretty good/i,
  /voted into the hall of pretty good/i,
  /welcome(?:s)? .{0,60}to the hall of pretty good/i,
  /inducted into the hall of pretty good/i,
  /is now officially .{0,40}hall of pretty good/i,
];

const NAME_PATTERNS = [
  /([A-Z][^\n.!?]{1,60}?)\s+(?:has\s+)?received\s+\d/,
  /([A-Z][^\n.!?]{1,60}?)\s+(?:has\s+been|is|was)\s+(?:now\s+)?(?:officially\s+)?(?:been\s+)?(?:voted|inducted|elected)/,
  /welcome\s+([A-Z][^\n.!?,]{1,60}?)\s+(?:to|into)\s+the\s+hall of pretty good/i,
];

function cleanName(raw: string): string {
  return raw
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/^(?:congratulations|congrats)[,!\s]+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseInductionCaption(caption: string): ParsedInduction {
  const text = caption ?? "";
  const isInduction = INDUCTION_SIGNALS.some((re) => re.test(text));

  let name: string | null = null;
  for (const re of NAME_PATTERNS) {
    const m = text.match(re);
    if (m?.[1]) {
      const candidate = cleanName(m[1]);
      if (candidate.length >= 3) {
        name = candidate;
        break;
      }
    }
  }

  const pctMatch = text.match(/(\d{1,3}(?:\.\d+)?)\s*%/);
  const votePct = pctMatch ? Number(pctMatch[1]) : null;

  const bwarMatch =
    text.match(/(-?\d{1,3}(?:\.\d+)?)\s*(?:career\s+)?bWAR/i) ??
    text.match(/bWAR[:\s]+(-?\d{1,3}(?:\.\d+)?)/i);
  const bwar = bwarMatch ? Number(bwarMatch[1]) : null;

  const innerCircle =
    /inner circle/i.test(text) || (votePct !== null && votePct >= 90);
  const prettyUnanimous =
    /pretty unanimous/i.test(text) || (votePct !== null && votePct >= 99);

  return { isInduction, name, votePct, bwar, innerCircle, prettyUnanimous };
}

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}