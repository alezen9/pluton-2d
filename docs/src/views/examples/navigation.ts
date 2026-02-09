import { getCollection } from "astro:content";
import { readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { exampleCategoryOrder, hiddenExampleCategories } from "../../content.config";
import type { ExampleCategory } from "../../content.config";

export type ExampleNavigationItem = {
  path: string;
  label: string;
};

export type ExampleNavigationGroup = {
  label: ExampleCategory;
  items: ExampleNavigationItem[];
};

const isHiddenExample = (entryId: string, category: ExampleCategory) =>
  entryId.startsWith("drafts/") || hiddenExampleCategories.includes(category);

const buildExampleNavigation = async (): Promise<ExampleNavigationGroup[]> => {
  const exampleCollection = await getCollection("examples");
  const exampleItemsByCategory: Partial<
    Record<ExampleCategory, ExampleNavigationItem[]>
  > = {};

  for (const exampleEntry of exampleCollection) {
    const category = exampleEntry.data.category;
    if (isHiddenExample(exampleEntry.id, category)) continue;
    const arr = exampleItemsByCategory[category] ?? [];
    arr.push({
      path: `/examples/${exampleEntry.id}`,
      label: exampleEntry.data.title,
    });
    exampleItemsByCategory[category] = arr;
  }

  return exampleCategoryOrder
    .filter((category) => !hiddenExampleCategories.includes(category))
    .filter((category) => exampleItemsByCategory[category])
    .map((category) => ({
      label: category,
      items: exampleItemsByCategory[category] ?? [],
    }));
};

let cachedExampleNavigation: Promise<ExampleNavigationGroup[]> | undefined;
let cachedContentSignature: string | undefined;

const contentRootDir = fileURLToPath(new URL("../../content", import.meta.url));

const collectExampleIndexFiles = async (
  dirPath: string,
  files: string[],
): Promise<void> => {
  const entries = await readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await collectExampleIndexFiles(entryPath, files);
      continue;
    }

    if (entry.isFile() && entry.name === "index.mdx") {
      files.push(entryPath);
    }
  }
};

const getContentSignature = async (): Promise<string> => {
  const files: string[] = [];
  await collectExampleIndexFiles(contentRootDir, files);
  files.sort();

  const fingerprints = await Promise.all(
    files.map(async (filePath) => {
      const fileStat = await stat(filePath);
      const relativePath = path.relative(contentRootDir, filePath);
      return `${relativePath}:${fileStat.mtimeMs}:${fileStat.size}`;
    }),
  );

  return fingerprints.join("|");
};

export const getExampleNavigation = async () => {
  if (!import.meta.env.DEV) return buildExampleNavigation();
  const contentSignature = await getContentSignature();
  if (!cachedExampleNavigation || cachedContentSignature !== contentSignature) {
    cachedContentSignature = contentSignature;
    cachedExampleNavigation = buildExampleNavigation();
  }

  return cachedExampleNavigation;
};
