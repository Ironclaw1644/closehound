import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = path.resolve(new URL(".", import.meta.url).pathname, "..");
const extensions = [".ts", ".tsx", ".js", ".mjs"];

function resolveAliasTarget(specifier) {
  const basePath = path.join(projectRoot, "src", specifier.slice(2));

  for (const extension of extensions) {
    if (fs.existsSync(`${basePath}${extension}`)) {
      return `${basePath}${extension}`;
    }
  }

  for (const extension of extensions) {
    const indexPath = path.join(basePath, `index${extension}`);
    if (fs.existsSync(indexPath)) {
      return indexPath;
    }
  }

  if (fs.existsSync(basePath)) {
    return basePath;
  }

  return basePath;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const fileUrl = pathToFileURL(resolveAliasTarget(specifier)).href;
    return nextResolve(fileUrl, context);
  }

  return nextResolve(specifier, context);
}
