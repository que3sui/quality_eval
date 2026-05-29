# Agent-Eff

Measure AI coding agent efficiency across project iterations.

## The Problem

AI coding agents are highly efficient when scaffolding new projects, but efficiency drops significantly during later iterations. There's no quantitative way to measure this decline.

Agent-Eff gives you a **percentage-based composite score** that tracks your agent's efficiency across sessions and iterations.

## Installation

```bash
npm install -g agent-eff
```

## Quick Start

```bash
# Initialize in your project
cd your-project
agent-eff init --write

# Start using Claude Code — data is collected automatically via hooks

# After a few sessions, analyze efficiency
agent-eff analyze
```

## Metrics (8 dimensions)

### Process Efficiency (75%)

| #   | Metric                          | What it measures                                         |
| --- | ------------------------------- | -------------------------------------------------------- |
| EPR | Exploration-to-Production Ratio | Productive calls (Edit/Write) vs exploratory (Read/Grep) |
| FAA | First-Attempt Accuracy          | Did the agent get it right the first time?               |
| CSI | Code Survivability Index        | How much code survives N+3 iterations? (requires git)    |
| TP  | Target Precision                | Files changed / files explored                           |
| IC  | Iteration Convergence           | How many rounds to converge on a solution?               |

### Output Quality (25%)

| #   | Metric               | What it measures                                                   |
| --- | -------------------- | ------------------------------------------------------------------ |
| LPR | Lint Pass Rate       | How often edits pass lint on first try?                            |
| CE  | Change Endurance     | Do changes survive subsequent iterations?                          |
| DC  | Decision Consistency | Pattern reuse, requirement fit, failure learning (requires Ollama) |

## Commands

```
agent-eff init [--write]       Initialize data collection
agent-eff analyze [options]    Compute efficiency scores
agent-eff config               View current configuration

Options:
  --latest        Analyze only the latest session (default)
  --session <id>  Analyze a specific session
  --all           Analyze all sessions
  --quality       Enable Tier 3 deep quality analysis (requires Ollama)
  --format json   Output as JSON
```

## Tier 3: Deep Quality Analysis

Requires [Ollama](https://ollama.com/) with a local model:

```bash
ollama pull qwen2.5-coder:7b
agent-eff analyze --quality
```

Uses the local LLM to evaluate:

- **Pattern Reuse**: Is new code reusing existing project patterns?
- **Requirement Fit**: Does the change fully address what was asked?
- **Failure Learning**: Is the agent repeating past mistakes?

## How It Works

```
Claude Code Session
  │
  ├── PostToolUse hook → agent-eff record   (append to JSONL, <5ms)
  └── Stop hook → agent-eff record          (capture git state)

$ agent-eff analyze
  ├── Read JSONL → detect iterations
  ├── Compute 8 metrics
  └── Display composite score + trend
```

All data is stored locally in `.agent-eff/`. No network calls. No telemetry.

## Configuration

Edit `.agent-eff/config.json` to customize weights or thresholds:

```json
{
  "weights": {
    "EPR": 0.2,
    "FAA": 0.2,
    "CSI": 0.15,
    "TP": 0.1,
    "IC": 0.1,
    "LPR": 0.1,
    "CE": 0.1,
    "DC": 0.05
  },
  "llm": {
    "provider": "ollama",
    "endpoint": "http://localhost:11434",
    "model": "qwen2.5-coder:7b"
  }
}
```

## License

MIT
