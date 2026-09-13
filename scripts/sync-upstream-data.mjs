import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const sourceRoot = path.resolve(
  process.env.POKESLEEP_TOOL_SOURCE ??
    path.join(repositoryRoot, "..", "pokesleep-tool"),
);
const destination = path.join(repositoryRoot, "src", "vendor", "upstream-data");
const files = ["pokemon.json", "event.json", "field.json"];

function assertShape(name, parsed) {
  if (name === "pokemon.json" && !Array.isArray(parsed))
    throw new TypeError("pokemon.json must be an array");
  if (name === "field.json" && !Array.isArray(parsed))
    throw new TypeError("field.json must be an array");
  if (
    name === "event.json" &&
    (typeof parsed !== "object" ||
      parsed === null ||
      !Array.isArray(parsed.drowsy) ||
      !Array.isArray(parsed.bonus))
  )
    throw new TypeError("event.json must contain drowsy and bonus arrays");
}

await mkdir(destination, { recursive: true });
const manifest = {
  source: "https://github.com/nitoyon/pokesleep-tool",
  commit: "unknown",
  files: {},
};
try {
  manifest.commit = execFileSync(
    "git",
    ["-C", sourceRoot, "rev-parse", "HEAD"],
    {
      encoding: "utf8",
    },
  ).trim();
} catch {
  try {
    const head = (await readFile(path.join(sourceRoot, ".git", "HEAD"), "utf8"))
      .trim()
      .replace(/^ref:\s*/, "");
    manifest.commit = /^[0-9a-f]{40}$/i.test(head)
      ? head
      : (
          await readFile(
            path.join(sourceRoot, ".git", ...head.split("/")),
            "utf8",
          )
        ).trim();
  } catch {
    // A source export without .git is supported; hashes still make it reproducible.
  }
}

for (const file of files) {
  const content = await readFile(
    path.join(sourceRoot, "src", "data", file),
    "utf8",
  );
  assertShape(file, JSON.parse(content));
  await writeFile(path.join(destination, file), content);
  manifest.files[file] = createHash("sha256").update(content).digest("hex");
}
await writeFile(
  path.join(destination, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(`Synced upstream data at ${manifest.commit}`);
