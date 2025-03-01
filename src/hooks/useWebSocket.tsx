import { useEffect, useState, useRef } from "react";

interface Message {
  sender: 'AI' | 'You';
  text: string;
}

interface WebSocketMessage {
  markdown: string;
  prompt: string;
}

interface WebSocketOptions {
  url: string;
  headers?: Record<string, string>;
}

const useWebSocket = ({ url, headers }: WebSocketOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    console.log('Initializing WebSocket with URL:', url);
    console.log('Headers:', headers);

    try {
      const wsUrl = new URL(url);
      if (headers) {
        Object.entries(headers).forEach(([key, value]) => {
          wsUrl.searchParams.append(key, value);
        });
      }

      console.log('Final WebSocket URL:', wsUrl.toString());
      socketRef.current = new WebSocket(wsUrl.toString());

      socketRef.current.onopen = () => {
        console.log("WebSocket Connected Successfully");
        setIsConnected(true);
      };

      socketRef.current.onmessage = (event: MessageEvent) => {
        console.log('Received message:', event.data);
        try {
          const data = JSON.parse(event.data);
          setMessages(prev => [...prev, { sender: "AI", text: data }]);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          setMessages(prev => [...prev, { sender: "AI", text: event.data }]);
        }
      };

      socketRef.current.onclose = (event: CloseEvent) => {
        console.log("WebSocket Disconnected:", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        setIsConnected(false);
      };

      socketRef.current.onerror = (error: Event) => {
        console.error("WebSocket Error:", error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }

    return () => {
      if (socketRef.current) {
        console.log('Closing WebSocket connection');
        socketRef.current.close();
      }
    };
  }, [url, headers]);

  const sendMessage = (markdown: string, prompt: string): boolean => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        markdown: markdown,
        prompt: prompt
      };
      console.log('Sending message:', message);
      socketRef.current.send(JSON.stringify(message));
      setMessages(prev => [...prev, { sender: "You", text: prompt }]);
      return true;
    }
    return false;
  };

  return { 
    messages, 
    sendMessage, 
    isConnected 
  } as const;
};

export type UseWebSocketReturn = ReturnType<typeof useWebSocket>;
export default useWebSocket;
