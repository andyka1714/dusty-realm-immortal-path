import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const SOURCE_ROOTS = ["App.tsx", "components", "pages"];
const CONTROL_PATTERN = /<(button|input|select|textarea)\b/g;

const ALLOWED_PATH_SEGMENTS = [
  `${path.sep}components${path.sep}ui${path.sep}`,
];

const collectSourceFiles = (entryPath: string): string[] => {
  const absolutePath = path.resolve(process.cwd(), entryPath);
  const stats = statSync(absolutePath);

  if (stats.isFile()) {
    return absolutePath.endsWith(".tsx") ? [absolutePath] : [];
  }

  return readdirSync(absolutePath).flatMap((child) =>
    collectSourceFiles(path.join(entryPath, child))
  );
};

describe("shared UI native control guard", () => {
  it("keeps app source controls behind shared UI primitives", () => {
    const violations = SOURCE_ROOTS.flatMap(collectSourceFiles)
      .filter((filePath) =>
        !ALLOWED_PATH_SEGMENTS.some((segment) => filePath.includes(segment))
      )
      .flatMap((filePath) => {
        const source = readFileSync(filePath, "utf8");
        const relativePath = path.relative(process.cwd(), filePath);
        const lines = source.split("\n");

        return lines.flatMap((line, index) => {
          CONTROL_PATTERN.lastIndex = 0;
          const matches = [...line.matchAll(CONTROL_PATTERN)];

          return matches.map((match) => `${relativePath}:${index + 1}: ${match[0]}`);
        });
      });

    expect(violations).toEqual([]);
  });
});
