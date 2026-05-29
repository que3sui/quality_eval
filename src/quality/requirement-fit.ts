import type { OllamaService } from "./ollama";

interface RequirementFitInput {
  user_prompt: string;
  changes_summary: string;
}

interface RequirementFitOutput {
  completeness_score: number;
  covered_requirements: string[];
  missed_requirements: string[];
  over_implementation: string[];
}

const SYSTEM_PROMPT = `你是一个需求分析师。对比用户的原始需求和 agent 实际修改的代码，判断需求是否被完整实现。

输出必须是严格的 JSON 格式，不要包含任何额外文字：
{
  "completeness_score": <0-100 整数>,
  "covered_requirements": ["<已满足的需求点>"],
  "missed_requirements": ["<遗漏的需求点>"],
  "over_implementation": ["<超出需求的过度实现>"]
}`;

export async function evaluateRequirementFit(
  ollama: OllamaService,
  input: RequirementFitInput,
): Promise<RequirementFitOutput> {
  const prompt = `用户需求:
${input.user_prompt}

Agent 实际修改摘要:
${input.changes_summary}

请判断需求是否被完整实现。`;

  try {
    const raw = await ollama.generate(prompt, SYSTEM_PROMPT);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as RequirementFitOutput;
    }
    return {
      completeness_score: 50,
      covered_requirements: [],
      missed_requirements: [],
      over_implementation: [],
    };
  } catch {
    return {
      completeness_score: 50,
      covered_requirements: [],
      missed_requirements: [],
      over_implementation: [],
    };
  }
}
