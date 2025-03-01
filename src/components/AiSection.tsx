import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { Textarea } from "./ui/textarea"; // Add this import
import { Button } from './ui/button';
import useWebSocket from '@/hooks/useWebSocket';
import { cn } from '@/lib/utils';
import MDEditor from '@uiw/react-md-editor';
import { useTheme } from 'next-themes'; // Add this import

interface AiSectionProps {
  markdown?: string;
}

function AiSection({ markdown = "" }: AiSectionProps) {
  const [prompt, setPrompt] = useState('');
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://fokakefir.go.ro:80/chat_ws';
  const { messages, sendMessage, isConnected } = useWebSocket({ url: wsUrl });
  const { resolvedTheme } = useTheme();

  const handleSendMessage = () => {
    if (prompt.trim()) {
      console.log('Sending:', {
        markdown: markdown || "",
        prompt: prompt.trim()
      });
      sendMessage(markdown || "", prompt.trim());
      setPrompt('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto'; // Reset height
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 38), 114); // 38px is ~1 line, 114px is ~3 lines
    textarea.style.height = `${newHeight}px`;
    setPrompt(e.target.value);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden"> {/* Added overflow-hidden */}
      <CardHeader className="flex-shrink-0 pb-3"> {/* Added flex-shrink-0 */}
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            AI Assistant
          </CardTitle>
          <div className={cn(
            "h-2 w-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-red-500"
          )} />
        </div>
        <CardDescription>
          {isConnected ? "Connected to AI" : "Connecting to AI..."}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={cn(
              "flex",
              msg.sender === "You" && "justify-end"
            )}>
              {msg.sender === "AI" && (
                <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center text-primary-foreground font-bold mr-2">
                  AI
                </div>
              )}
              <div className={cn(
                "p-3 rounded-lg max-w-[80%]",
                msg.sender === "AI" 
                  ? "bg-muted rounded-tl-none" 
                  : "bg-secondary text-secondary-foreground rounded-tr-none" // Changed from bg-primary
              )}>
                <div 
                  className="text-sm whitespace-pre-wrap wmde-markdown-var" 
                  data-color-mode={resolvedTheme}
                >
                  {msg.sender === "You" ? (
                    <p>{msg.text}</p> // Simple text for user messages
                  ) : (
                    <MDEditor.Markdown
                      source={msg.text}
                      className="!bg-transparent"
                      style={{ backgroundColor: 'transparent' }}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex-shrink-0 border-t pt-3"> {/* Added flex-shrink-0 */}
        <div className="flex w-full gap-2 items-start"> {/* Added items-start */}
          <Textarea 
            placeholder={isConnected ? "Ask anything..." : "Connecting..."}
            value={prompt}
            onChange={adjustTextareaHeight}
            onKeyDown={handleKeyPress}
            disabled={!isConnected}
            className="flex-grow min-h-[38px] max-h-[114px] resize-none transition-height duration-150 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
            rows={1}
          />
          <div className="flex-shrink-0 self-stretch flex items-center"> {/* Added wrapper div */}
            <Button 
              size="icon"
              onClick={handleSendMessage}
              disabled={!isConnected || !prompt.trim()}
              className="h-[38px]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default AiSection;
