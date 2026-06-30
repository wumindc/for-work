// @author codex
const topicModules = import.meta.glob("../../content/topics/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

const questionModules = import.meta.glob("../../content/questions/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

const idFromPath = (filePath: string) =>
  filePath.split("/").pop()?.replace(/\.md$/, "") ?? filePath;

const modulesToMap = (modules: Record<string, unknown>) =>
  new Map(
    Object.entries(modules).map(([filePath, content]) => [
      idFromPath(filePath),
      String(content),
    ]),
  );

export const topicMarkdownById = modulesToMap(topicModules);
export const questionMarkdownById = modulesToMap(questionModules);
