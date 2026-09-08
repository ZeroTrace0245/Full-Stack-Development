import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = ["package.json", "vite.config.js", "src", "backend", ".gitignore"];
const missing = required.filter((item) => !fs.existsSync(path.join(root, item)));

if (missing.length) {
  console.error(`Missing project paths: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("Project health check passed.");
console.log(`Node: ${process.version}`);
console.log(`Root: ${root}`);
