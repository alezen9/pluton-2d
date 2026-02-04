import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const zExample = z.object({
  title: z.string(),
  category: z.string(),
  description: z.string(),
});

const examples = defineCollection({
  loader: glob({
    base: "./src/content/examples",
    pattern: "**/index.mdx",
    generateId: ({ entry }) => entry.split("/")[0],
  }),
  schema: () => zExample,
});

export const collections = { examples };
