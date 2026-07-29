import { createServerFn } from "@tanstack/react-start";
import { fetchInducteeBySlug, fetchPublishedInductees } from "./inductees.server";

export type { InducteeRow } from "./inductees.server";

export const listInductees = createServerFn({ method: "GET" }).handler(async () =>
  fetchPublishedInductees(),
);

export const getInductee = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => fetchInducteeBySlug(data.slug));