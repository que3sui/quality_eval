import type { OllamaService } from "./ollama";

interface FailureLearningInput {
  historical_failures: string[];
  current_diff: string;
}

interface FailureLearningOutput {
  risk_score: number;
  repeated_patterns: string[];
  warnings: string[];
}

const SYSTEM_PROMPT = `你是一个代码审查员。检查当前改动是否重复了历史上已被 revert 或修复的同类错误。

输出必须是严格的 JSON 格式，不要包含任何额外文字：
{
  "risk_score": <0-100 整数, 越高越危险>,
  "repeated_patterns": ["<识别到的重复错误模式>"],
  "warnings": ["<风险提示>"]
}`;

export async function evaluateFailureLearning(
  ollama: OllamaService,
  input: FailureLearningInput,
): Promise<FailureLearningOutput> {
  if (input.historical_failures.length === 0) {
    return { risk_score: 0, repeated_patterns: [], warnings: [] };
  }

  const historyBlock = input.historical_failures
    .map((f, i) => `--- 历史失败 #${i + 1} ---\n${f}`)
    .join("\n\n");

  const prompt = `历史上被 revert 或修复的失败代码:
${historyBlock}

当前改动的 diff:
${input.current_diff}

请判断当前改动是否重复了历史的错误。`;

  try {
    const raw = await ollama.generate(prompt, SYSTEM_PROMPT);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as FailureLearningOutput;
    }
    return { risk_score: 0, repeated_patterns: [], warnings: [] };
  } catch {
    return { risk_score: 0, repeated_patterns: [], warnings: [] };
  }
}
