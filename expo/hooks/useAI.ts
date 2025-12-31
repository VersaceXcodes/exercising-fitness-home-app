/**
 * useAI Hooks - React hooks for AI integration
 * 
 * Provides useChat() and useAsk() hooks for interacting with LaunchPulse AI
 */

import { useState, useCallback } from 'react';
import { ai, Message } from '../services/ai';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  send: (message: string) => Promise<void>;
  clear: () => void;
}

/**
 * useChat Hook
 * 
 * Manages a conversation with the AI assistant
 * Perfect for chatbot interfaces
 */
export function useChat(systemPrompt?: string): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Add user message
    const userChatMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userChatMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Build conversation history
      const apiMessages: Message[] = [];
      
      // Add system prompt if provided
      if (systemPrompt) {
        apiMessages.push({
          role: 'system',
          content: systemPrompt,
        });
      }

      // Add conversation history
      messages.forEach(msg => {
        apiMessages.push({
          role: msg.role,
          content: msg.content,
        });
      });

      // Add new user message
      apiMessages.push({
        role: 'user',
        content: userMessage,
      });

      // Get AI response
      const response = await ai.chat({
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500,
      });

      const assistantContent = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

      // Add assistant message
      const assistantChatMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantChatMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(errorMessage);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [messages, systemPrompt]);

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    send,
    clear,
  };
}

interface UseAskReturn {
  answer: string | null;
  isLoading: boolean;
  error: string | null;
  ask: (question: string, systemPrompt?: string) => Promise<void>;
  clear: () => void;
}

/**
 * useAsk Hook
 * 
 * For one-off questions to the AI
 * Simpler than useChat, no conversation history
 */
export function useAsk(): UseAskReturn {
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(async (question: string, systemPrompt?: string) => {
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const response = await ai.ask(question, systemPrompt);
      setAnswer(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(errorMessage);
      console.error('Ask error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setAnswer(null);
    setError(null);
  }, []);

  return {
    answer,
    isLoading,
    error,
    ask,
    clear,
  };
}
