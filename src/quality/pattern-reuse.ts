import type { OllamaService } from "./ollama";

interface PatternReuseInput {
  project_patterns: string;
  new_diff: string;
}

interface PatternReuseOutput {
  reuse_score: number;
  reinvented_wheels: string[];
  good_reuses: string[];
}

const SYSTEM_PROMPT = `你是一个代码审查员。你的任务是对比项目现有代码模式和新提交的代码，判断新代码是否合理复用了项目的现有工具函数、类型定义和组件。

输出必须是严格的 JSON 格式，不要包含任何额外文字：
{
  "reuse_score": <0-100 整数>,
  "reinvented_wheels": ["<重复造轮子的具体位置>"],
  "good_reuses": ["<合理复用的例子>"]
}`;

export async function evaluatePatternReuse(
  ollama: OllamaService,
  input: PatternReuseInput,
): Promise<PatternReuseOutput> {
  const prompt = `项目现有代码模式:
${input.project_patterns}

新提交的代码 diff:
${input.new_diff}

请判断新代码是否合理复用了项目已有的模式。`;

  try {
    const raw = await ollama.generate(prompt, SYSTEM_PROMPT);
    // Extract JSON from the response (handle possible markdown wrapping)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as PatternReuseOutput;
    }
    return { reuse_score: 50, reinvented_wheels: [], good_reuses: [] };
  } catch {
    return { reuse_score: 50, reinvented_wheels: [], good_reuses: [] };
  }
}
