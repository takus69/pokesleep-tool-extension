import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export function packageRootForModule(moduleId) {
  const normalized = moduleId.replaceAll("\\", "/");
  const marker = "/node_modules/";
  const markerIndex = normalized.lastIndexOf(marker);
  if (markerIndex < 0) return null;

  const packagePath = normalized.slice(markerIndex + marker.length).split("/");
  const segmentCount = packagePath[0]?.startsWith("@") ? 2 : 1;
  if (packagePath.length < segmentCount) return null;
  return (
    normalized.slice(0, markerIndex + marker.length).replace(/^\0/, "") +
    packagePath.slice(0, segmentCount).join("/")
  );
}

export function bundledPackageLicenses(bundle) {
  const roots = new Set();
  for (const artifact of Object.values(bundle)) {
    if (artifact.type !== "chunk") continue;
    for (const moduleId of Object.keys(artifact.modules)) {
      const root = packageRootForModule(moduleId);
      if (root !== null) roots.add(root);
    }
  }

  const packages = Array.from(roots, (root) => {
    const manifestPath = path.join(root, "package.json");
    if (!existsSync(manifestPath)) {
      throw new Error(`Bundled package has no manifest: ${root}`);
    }
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const noticeFiles = readdirSync(root)
      .filter((fileName) =>
        /^(?:licen[cs]e|copying|notice)(?:[.-].*)?$/i.test(fileName),
      )
      .sort();
    if (!manifest.license || noticeFiles.length === 0) {
      throw new Error(
        `Bundled package has incomplete license metadata: ${manifest.name}@${manifest.version}`,
      );
    }
    return {
      name: manifest.name,
      version: manifest.version,
      license: manifest.license,
      notices: noticeFiles.map((fileName) => ({
        fileName,
        content: readFileSync(path.join(root, fileName), "utf8").trim(),
      })),
    };
  }).sort(
    (a, b) =>
      a.name.localeCompare(b.name) || a.version.localeCompare(b.version),
  );

  const sections = [
    "# Bundled npm package licenses",
    "",
    "Generated from the modules in the production bundle. Development-only packages are excluded.",
    "This file does not cover official upstream source or artwork; see THIRD_PARTY_NOTICES.md.",
    "",
  ];
  for (const entry of packages) {
    sections.push(
      `## ${entry.name}@${entry.version}`,
      "",
      `Declared license: ${entry.license}`,
      "",
    );
    for (const notice of entry.notices) {
      sections.push(
        `### ${notice.fileName}`,
        "",
        "```text",
        notice.content,
        "```",
        "",
      );
    }
  }
  return { text: sections.join("\n"), packages };
}
