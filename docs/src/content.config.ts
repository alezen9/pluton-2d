import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

export const exampleCategoryOrder = [
  "Getting Started",
  "Profiles",
  "Parametric",
  "Blueprints",
  "Effects & Performance",
  "Personal Playground",
  "Draft",
] as const;

export type ExampleCategory = (typeof exampleCategoryOrder)[number];

export const hiddenExampleCategories: ExampleCategory[] = ["Draft"];

const zExample = z.object({
  title: z.string(),
  category: z.enum(exampleCategoryOrder),
  description: z.string(),
});

const examples = defineCollection({
  loader: glob({
    base: "./src/content",
    pattern: "**/index.mdx",
    generateId: ({ entry }) =>
      entry.replaceAll("\\", "/").replace(/\/index\.mdx$/, ""),
  }),
  schema: () => zExample,
});

export const collections = { examples };
