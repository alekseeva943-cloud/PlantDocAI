export interface AIResponse {
  plant_name?: string;
  plant_url?: string;
  disease_name?: string;
  disease_url?: string;
  summary: string;
  possible_causes: string[];
  recommendations: string[];
  detailed_advice?: string;
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
