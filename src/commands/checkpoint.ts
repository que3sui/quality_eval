import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const GAP_SEC = 60;

export function checkpointCommand(): void {
  const cwd = process.cwd();
  const stampFile = path.join(cwd, ".agent-eff", "checkpoint-stamp");

  const now = Math.floor(Date.now() / 1000);
  let lastCommit = 0;
  try {
    lastCommit = parseInt(fs.readFileSync(stampFile, "utf-8").trim(), 10) || 0;
  } catch {}

  if (now - lastCommit < GAP_SEC) return; // too soon

  try {
    execSync("git add -A", { cwd, stdio: "ignore", timeout: 3000 });
    execSync('git commit -m "checkpoint [agent-eff]"', {
      cwd,
      stdio: "ignore",
      timeout: 5000,
    });
  } catch {
    // No changes to commit, or not a git repo — silent
  }

  fs.writeFileSync(stampFile, String(now), "utf-8");
}
