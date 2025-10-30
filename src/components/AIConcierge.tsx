import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, X, Loader2, Bot, User, Mic, Clock, Star, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { mapService, mapStylist, mapAddOn } from "@/lib/booking-data";
import type { RawStylistRow } from "@/lib/booking-data";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
};

const QUICK_REPLIES = [
  { icon: Calendar, text: "Book appointment", action: "booking" },
  { icon: Clock, text: "Opening hours", action: "hours" },
  { icon: Star, text: "View services", action: "services" },
  { icon: User, text: "Our stylists", action: "stylists" },
];

export default function AIConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load chat history from localStorage
    const saved = localStorage.getItem('ai-concierge-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only restore if less than 24 hours old
        if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed.messages;
        }
      } catch (e) {
        console.error('Failed to parse chat history:', e);
      }
    }
    return [
      {
        role: "assistant",
        content: "Welcome to The Bridge Barbershop! I'm your AI concierge. How can I help you today? I can assist with bookings, service information, or answer any questions about our shop.",
        timestamp: Date.now(),
      },
    ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load context data for AI
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*");
      if (error) throw error;
      return data.map(mapService);
    },
  });

  const { data: stylists } = useQuery({
    queryKey: ["stylists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stylists")
        .select("*");
      if (error) throw error;
      return (data as RawStylistRow[]).map(mapStylist);
    },
  });

  const { data: addOns } = useQuery({
    queryKey: ["add-ons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("add_ons").select("*");
      if (error) throw error;
      return data.map(mapAddOn);
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Persist chat history
  useEffect(() => {
    localStorage.setItem('ai-concierge-history', JSON.stringify({
      messages,
      timestamp: Date.now(),
    }));
  }, [messages]);

  const handleQuickReply = (action: string) => {
    const quickReplyMap: Record<string, string> = {
      booking: "I'd like to book an appointment",
      hours: "What are your opening hours?",
      services: "Can you show me your services?",
      stylists: "Tell me about your stylists",
    };

    setInput(quickReplyMap[action] || "");
    setShowQuickReplies(false);
    setTimeout(() => {
      handleSendMessage(quickReplyMap[action]);
    }, 100);
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: textToSend,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsTyping(true);
    setShowQuickReplies(false);

    try {
      const context = {
        services: services?.map((s) => ({
          name: s.name,
          description: s.description,
          price: s.price,
          duration: s.duration,
          category: s.category,
        })),
        stylists: stylists?.map((s) => ({
          name: s.name,
          title: s.title,
          bio: s.bio,
          yearsExperience: s.yearsExperience,
          rating: s.rating,
        })),
        addOns: addOns?.map((a) => ({
          name: a.name,
          description: a.description,
          price: a.price,
          duration: a.duration,
        })),
      };

      const { data, error } = await supabase.functions.invoke("ai-concierge", {
        body: {
          messages: messages.concat(userMessage).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message || data.fallback || "I apologize, but I'm having trouble right now. Please try again.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling AI concierge:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Unable to reach our AI concierge. Please try again or call us directly.",
      });

      const fallbackMessage: Message = {
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or feel free to call us directly at (403) XXX-XXXX.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-16 w-16 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 bg-gradient-to-br from-primary to-primary/80 relative"
          aria-label="Open AI Concierge"
        >
          <MessageCircle className="h-7 w-7" />
          {messages.length > 1 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">
              {messages.filter(m => m.role === 'assistant' && m.timestamp && m.timestamp > Date.now() - 60000).length}
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[400px] h-[600px] flex flex-col shadow-2xl z-50 border-primary/20 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center relative">
            <Bot className="h-6 w-6 text-primary" />
            <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
          <div>
            <h3 className="font-semibold text-primary">AI Concierge</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="inline-block h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              Online now
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setMessages([{
                role: "assistant",
                content: "Welcome to The Bridge Barbershop! I'm your AI concierge. How can I help you today?",
                timestamp: Date.now(),
              }]);
              setShowQuickReplies(true);
              localStorage.removeItem('ai-concierge-history');
            }}
            className="h-8 w-8"
            title="Clear chat history"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${message.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                  }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                {message.timestamp && (
                  <p className="text-xs opacity-60 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
              {message.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3 rounded-tl-sm">
                <div className="flex gap-1 items-center">
                  <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {showQuickReplies && messages.length === 1 && (
        <div className="px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2">Quick replies:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_REPLIES.map((reply) => (
              <Badge
                key={reply.action}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1.5"
                onClick={() => handleQuickReply(reply.action)}
              >
                <reply.icon className="h-3 w-3 mr-1.5" />
                {reply.text}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            disabled={isLoading}
            className="shrink-0"
            title="Voice input (coming soon)"
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Powered by AI • Messages saved for 24 hours
        </p>
      </div>
    </Card>
  );
}
