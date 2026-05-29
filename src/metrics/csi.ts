import { execSync } from "child_process";
import type { MetricResult } from "../types/metrics";
import type { Iteration } from "../types/events";

export function computeCSI(
  _iterations: Iteration[],
  cwd: string,
): MetricResult {
  try {
    // Get checkpoint commits from oldest to newest
    const log = execSync(
      'git log --oneline --fixed-strings --grep="agent-eff checkpoint" --format="%H" --reverse',
      {
        cwd,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
        timeout: 5000,
      },
    ).trim();

    const commits = log.split("\n").filter(Boolean);
    if (commits.length < 3) {
      return {
        name: "CSI",
        value: null,
        numerator: 0,
        denominator: 0,
        display: "N/A",
      };
    }

    let totalAdded = 0;
    let totalSurvived = 0;

    // For each commit, check if its changed files survived to HEAD
    const head = execSync("git rev-parse HEAD", {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
      timeout: 3000,
    }).trim();

    for (const commit of commits) {
      // Get changed files and added lines
      const numstat = execSync(`git diff --numstat ${commit}~1..${commit}`, {
        cwd,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
        timeout: 5000,
      }).trim();

      if (!numstat) continue;

      for (const line of numstat.split("\n")) {
        const parts = line.split("\t");
        const added = parseInt(parts[0], 10) || 0;
        const file = parts[2];
        if (!file || added === 0) continue;

        totalAdded += added;

        // Check if this file was modified after this commit
        const laterChanges = execSync(
          `git log --oneline ${commit}..${head} -- "${file}"`,
          {
            cwd,
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "ignore"],
            timeout: 3000,
          },
        ).trim();

        if (!laterChanges) {
          // No later changes to this file — all added lines survived
          totalSurvived += added;
        } else {
          // File was modified later — estimate 50% survival
          totalSurvived += Math.round(added * 0.5);
        }
      }
    }

    if (totalAdded === 0) {
      return {
        name: "CSI",
        value: null,
        numerator: 0,
        denominator: 0,
        display: "N/A",
      };
    }

    const value = totalSurvived / totalAdded;
    return {
      name: "CSI",
      value,
      numerator: totalSurvived,
      denominator: totalAdded,
      display: `${(value * 100).toFixed(1)}%`,
    };
  } catch {
    return {
      name: "CSI",
      value: null,
      numerator: 0,
      denominator: 0,
      display: "N/A",
    };
  }
}
