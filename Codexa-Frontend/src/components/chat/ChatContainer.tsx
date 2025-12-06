import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { MessageInput } from "./MessageInput";
import {
  Sparkles,
  Code,
  Palette,
  Globe,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { PreviewPanel } from "../layout/PreviewPanel";
import { CodePanel } from "../layout/CodePanel";
import { useParams, useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  title?: string;
  agent?: "developer" | "debugger" | "planner" | string;
  code?: {
    language: string;
    content: string;
  };
}

interface Props {
  selectedchatId: string | null;
  onCodeGenerated?: (code: string, lang: string, html: string) => void;
}

const suggestions = [
  {
    icon: Code,
    label: "Generate code",
    prompt: "Help me create a React component",
  },
  { icon: Palette, label: "Design UI", prompt: "Design a modern landing page" },
  {
    icon: Globe,
    label: "Build app",
    prompt: "Build a full-stack web application",
  },
  {
    icon: MessageSquare,
    label: "Explain concept",
    prompt: "Explain how React hooks work",
  },
];

export function ChatContainer({ onCodeGenerated }: Props) {
  const { userId } = useAuth();
  const { chatId} = useParams();

  const navigate = useNavigate();
  const [messages, setMessages] =  useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // const [chatId, setchatId] = useState<string | null>(null);

  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [generatedCode, setGeneratedCode] = useState("");
  const [generatedLanguage, setGeneratedLanguage] = useState("html");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history
  useEffect(() => {
    if (!chatId) setMessages([]);

    const loadChat = async () => {
      try {
        const res = await fetch(`http://localhost:8000/chat/${chatId}`);
        const data = await res.json();

        if (data.ok && Array.isArray(data.messages)) {
          const mapped = data.messages.map((msg: any) => ({
            id: msg._id,
            role: msg.role,
            content: msg.content,
            agent: msg.agent,
          }));

          setMessages(mapped);
        }
      } catch (err) {
        console.error("Failed to load chat:", err);
      }
    };

    loadChat();
  }, [chatId]);

  // Handle send
  const handleSend = async (content: string) => {
    if (!content.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          chat_id: chatId || null,
          message: content,
        }),
      });

      const data = await res.json();
      console.log("Chat response data:", data);
      
      if (data.ok && data.chat_id) {
        navigate(`/c/${data.chat_id}`);
      }
      const mappedMessages = data.messages?.map((msg: any) => ({
        id: msg._id,
        role: msg.role,
        content: msg.content,
        agent: msg.agent,
        code: msg.code,
      })) ?? [];

      setMessages(mappedMessages);

      // Trigger code update
      if (data.code) {
        onCodeGenerated?.(
          data.code,
          data.language ?? "html",
          data.preview_html ?? data.code
        );
      }

      // Auto-open when a project is generated
      if (data.type === "project") {
        setGeneratedCode(data.code || "");
        setGeneratedLanguage(data.language || "html");

        setIsCodeOpen(true);
        setIsPreviewOpen(true);
      }
    } catch (error) {
      console.error("Chat error:", error);
    }

    setIsLoading(false);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 ambient-bg pointer-events-none" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6 relative z-10">
        {!hasMessages ? (
          // Welcome screen
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto animate-fade-in-up">
            <div className="relative mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-2xl glow-intense animate-float">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl -z-10 animate-pulse-soft" />
            </div>

            <h1 className="text-4xl font-bold text-foreground mb-3 text-center">
              Welcome to <span className="text-gradient-animate">CODEXA</span>
            </h1>

            <p className="text-lg text-muted-foreground text-center mb-10 max-w-md">
              Your intelligent assistant for building amazing applications. Ask
              me anything or try one of these suggestions.
            </p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
              {suggestions.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(item.prompt)}
                  className={cn(
                    "group flex items-center gap-3 p-4 rounded-2xl",
                    "bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-primary/30",
                    "transition-all duration-300 text-left",
                    "hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground block">
                      {item.label}
                    </span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {item.prompt}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-12 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Real-time responses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Code generation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span>Multi-modal AI</span>
              </div>
            </div>
          </div>
        ) : (
          // Chat messages
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, index) => (
              <ChatMessage key={msg.id} message={msg} index={index} />
            ))}

            {isLoading && (
              <div className="flex gap-4 animate-fade-in-up">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 glow-subtle animate-pulse-soft">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="glass-premium rounded-2xl px-5 py-3 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    CODEXA is thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <MessageInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
