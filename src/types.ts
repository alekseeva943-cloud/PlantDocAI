export interface AIResponse {
  summary: string;
  possible_causes: string[];
  recommendations: string[];
  suggested_actions: string[];
  disclaimer: string;
  transcribed_text?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'image' | 'voice';
  data?: AIResponse;
  imageUrl?: string;
}
