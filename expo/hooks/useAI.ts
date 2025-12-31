/**
 * useAI Hooks - React hooks for AI integration
 *
 * Provides useChat() and useAsk() hooks for interacting with LaunchPulse AI
 */

import { useState, useCallback, useRef } from 'react';
import { ai, type Message } from '../services/ai';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseChatOptions {
  /** System prompt to include at the start of every conversation */
  systemPrompt?: string;
  /** Callback when AI responds */
  onResponse?: (content: string) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  streamingContent: string;
  send: (message: string) => Promise<void>;
  sendStream: (message: string) => Promise<void>;
  clear: () => void;
  stop: () => void;
}

/**
 * useChat Hook
 *
 * Manages a conversation with the AI assistant
 * Perfect for chatbot interfaces
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { systemPrompt, onResponse, onError } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');

  const shouldStopRef = useRef(false);

  const send = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

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

      // Get AI response using the correct API
      const response = await ai.chat.completions.create({
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
      onResponse?.(assistantContent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [messages, systemPrompt, isLoading, onResponse, onError]);

  const sendStream = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading || isStreaming) return;

    // Add user message
    const userChatMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userChatMessage]);
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingContent('');
    setError(null);
    shouldStopRef.current = false;

    try {
      // Build conversation history
      const apiMessages: Message[] = [];

      if (systemPrompt) {
        apiMessages.push({
          role: 'system',
          content: systemPrompt,
        });
      }

      messages.forEach(msg => {
        apiMessages.push({
          role: msg.role,
          content: msg.content,
        });
      });

      apiMessages.push({
        role: 'user',
        content: userMessage,
      });

      let fullContent = '';

      // Stream the response
      for await (const chunk of ai.chat.completions.stream({
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500,
      })) {
        if (shouldStopRef.current) break;

        fullContent += chunk;
        setStreamingContent(fullContent);
      }

      // Add completed assistant message
      const assistantChatMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: fullContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantChatMessage]);
      setStreamingContent('');
      onResponse?.(fullContent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      console.error('Stream error:', err);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [messages, systemPrompt, isLoading, isStreaming, onResponse, onError]);

  const stop = useCallback(() => {
    shouldStopRef.current = true;
    setIsStreaming(false);
    setIsLoading(false);
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
    setStreamingContent('');
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    streamingContent,
    send,
    sendStream,
    clear,
    stop,
  };
}

interface UseAskReturn {
  answer: string | null;
  isLoading: boolean;
  error: string | null;
  ask: (question: string, systemPrompt?: string) => Promise<string>;
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

  const ask = useCallback(async (question: string, systemPrompt?: string): Promise<string> => {
    if (!question.trim()) return '';

    setIsLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const response = await ai.ask(question, { systemPrompt });
      setAnswer(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(errorMessage);
      console.error('Ask error:', err);
      throw err;
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

export default useChat;
