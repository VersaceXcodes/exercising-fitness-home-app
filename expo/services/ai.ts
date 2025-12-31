/**
 * AI Service - LaunchPulse AI Proxy Integration
 * 
 * This service provides an OpenAI-compatible interface using LaunchPulse's AI proxy.
 * DO NOT install openai SDK or add API keys - this uses LaunchPulse infrastructure.
 */

const API_URL = process.env.EXPO_PUBLIC_LAUNCHPULSE_API_URL || 'https://api.launchpulse.ai';
const API_KEY = process.env.EXPO_PUBLIC_LAUNCHPULSE_AI_KEY;
const PROJECT_ID = process.env.EXPO_PUBLIC_LAUNCHPULSE_PROJECT_ID;

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: Message;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class AIService {
  private apiUrl: string;
  private apiKey: string;
  private projectId: string;

  constructor() {
    this.apiUrl = API_URL;
    this.apiKey = API_KEY || '';
    this.projectId = PROJECT_ID || '';

    if (!this.apiKey) {
      console.warn('EXPO_PUBLIC_LAUNCHPULSE_AI_KEY is not set. AI features may not work.');
    }
    if (!this.projectId) {
      console.warn('EXPO_PUBLIC_LAUNCHPULSE_PROJECT_ID is not set. AI features may not work.');
    }
  }

  /**
   * Send a chat completion request to the AI
   */
  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Project-ID': this.projectId,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `AI request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  }

  /**
   * Ask a single question and get a response
   * This is a simplified interface for one-off questions
   */
  async ask(question: string, systemPrompt?: string): Promise<string> {
    const messages: Message[] = [];
    
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }
    
    messages.push({
      role: 'user',
      content: question,
    });

    const response = await this.chat({
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Ask a fitness-related question with fitness context
   */
  async askFitness(question: string): Promise<string> {
    const systemPrompt = `You are a knowledgeable and encouraging fitness assistant for a home workout app. 
Your role is to:
- Provide accurate, safe fitness advice
- Answer questions about exercises, workouts, nutrition, and recovery
- Be motivating and supportive
- Keep responses concise and practical (2-3 paragraphs max)
- Recommend consulting professionals for medical concerns
- Focus on home workouts and bodyweight exercises

Always prioritize user safety and proper form.`;

    return this.ask(question, systemPrompt);
  }
}

// Export singleton instance
export const ai = new AIService();

// Export types for use in other files
export type { Message, ChatCompletionRequest, ChatCompletionResponse };
