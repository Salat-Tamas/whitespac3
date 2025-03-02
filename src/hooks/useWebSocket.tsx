import { useState, useEffect, useCallback, useRef } from 'react';

interface UseWebSocketProps {
  url: string;
}

interface Message {
  sender: 'AI' | 'You';
  text: string;
}

export default function useWebSocket({ url }: UseWebSocketProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const sendMessage = useCallback((markdown: string, prompt: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setIsProcessing(true); // Set processing state when sending
      wsRef.current.send(JSON.stringify({
        markdown,
        prompt
      }));
      setMessages(prev => [...prev, { sender: 'You', text: prompt }]);
    }
  }, []);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
      setIsProcessing(false); // Reset processing state on new connection
    };

    ws.onmessage = (event) => {
      console.log('Received message:', event.data);
      setMessages(prev => [...prev, { sender: 'AI', text: event.data }]);
      setIsProcessing(false); // Reset processing state when response received
    };

    ws.onerror = (error: Event) => {
      console.error("WebSocket Error:", error);
      setIsConnected(false);
    };

    ws.onclose = (event: CloseEvent) => {
      console.log("WebSocket Disconnected:", {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      setIsConnected(false);
    };

    return () => {
      ws.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [url]);

  return {
    messages,
    sendMessage,
    isConnected,
    isProcessing // Add this to the return object
  };
}
