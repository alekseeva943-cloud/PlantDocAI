import { OpenAIProvider } from '../providers/openai.provider';
import { PLANT_ANALYSIS_PROMPT, CHAT_PROMPT } from '../prompts/plant.prompts';

export interface AIResponse {
  summary: string;
  possible_causes: string[];
  recommendations: string[];
  suggested_actions: string[];
  disclaimer: string;
}

export class PlantAIOrchestrator {
  private provider: OpenAIProvider;

  constructor() {
    this.provider = new OpenAIProvider();
  }

  async analyzePlantImage(imageBase64: string): Promise<AIResponse> {
    try {
      const rawResponse = await this.provider.analyzeImage(imageBase64, PLANT_ANALYSIS_PROMPT);
      if (!rawResponse) throw new Error('No response from AI provider');
      return JSON.parse(rawResponse) as AIResponse;
    } catch (error) {
      console.error('PlantAIOrchestrator.analyzePlantImage Error:', error);
      throw error;
    }
  }

  async handleChat(userInput: string, history: any[] = []): Promise<AIResponse> {
    try {
      const messages = [
        { role: 'system', content: CHAT_PROMPT },
        ...history,
        { role: 'user', content: userInput },
      ];
      const rawResponse = await this.provider.chat(messages);
      if (!rawResponse) throw new Error('No response from AI provider');
      return JSON.parse(rawResponse) as AIResponse;
    } catch (error) {
      console.error('PlantAIOrchestrator.handleChat Error:', error);
      throw error;
    }
  }

  async transcribeVoice(file: Express.Multer.File): Promise<string> {
    return await this.provider.transcribe(file);
  }
}
