import type { LLMConfig } from "../types/config";
import { DEFAULT_LLM_CONFIG } from "../types/config";

export class OllamaService {
  private config: LLMConfig;

  constructor(config: Partial<LLMConfig> = {}) {
    this.config = { ...DEFAULT_LLM_CONFIG, ...config };
  }

  async generate(prompt: string, system?: string): Promise<string> {
    const body = JSON.stringify({
      model: this.config.model,
      prompt,
      system,
      stream: false,
      options: { temperature: 0.1, num_predict: 512 },
    });

    const response = await fetch(`${this.config.endpoint}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(
        `Ollama API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as { response: string };
    return data.response;
  }

  async checkAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      const data = (await response.json()) as {
        models?: Array<{ name: string }>;
      };
      return (data.models || []).some((m) =>
        m.name.startsWith(this.config.model.split(":")[0]),
      );
    } catch {
      return false;
    }
  }
}
// cp 1
