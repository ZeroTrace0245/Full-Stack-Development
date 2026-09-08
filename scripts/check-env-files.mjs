import fs from "node:fs";

const forbidden = [".env", "backend/.env"];
const trackedLike = forbidden.filter((file) => fs.existsSync(file));

console.log("Environment file audit:");
for (const file of trackedLike) console.log(`- ${file}: exists locally (keep it out of Git)`);
console.log("Use .env.example files to document configuration keys.");
