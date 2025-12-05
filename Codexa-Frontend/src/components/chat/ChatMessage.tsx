import { cn } from "@/lib/utils";
import {
  User,
  Sparkles,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
} from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: {
    id: string;
    role: "user" | "assistant";
    title?: string;
    agent: "developer" | "debugger" | "planner" | null;
    content: string;
    code?: {
      language: string;
      content: string;
    };
  };
  index: number;
}

export function ChatMessage({ message, index }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [planSteps, setPlanSteps] = useState<string[]>([]);
  const [title, setTitle] = useState<string | null>(null);
  const [parsedCode, setParsedCode] = useState(message.code || null);

  // Utility: format developer code safely
  function formatCodeString(raw: string, language = "html") {
    if (!raw) return { language, content: "" };

    let cleaned = raw.trim();

    if (
      (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))
    ) {
      cleaned = cleaned.slice(1, -1);
    }

    cleaned = cleaned.replace(/\\n/g, "\n").replace(/\\"/g, '"');

    return { language, content: cleaned };
  }

  // Parse planner + developer content
  useEffect(() => {
    if (message.agent === "planner") {
      try {
        const parsed = JSON.parse(message.content);
        setTitle(parsed.title || null);
        setPlanSteps(parsed.plan || parsed.steps || []);
      } catch {
        console.error("Invalid planner JSON:", message.content);
      }
    }

    if (message.agent === "developer") {
      try {
        const formatted = formatCodeString(message.content, "html");
        setParsedCode(formatted);
      } catch {
        console.error("Developer code formatting failed.");
      }
    }
  }, [message]);

  // Copy message
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(type);
    toast.success(
      type === "up" ? "Thanks for the feedback!" : "We'll improve!"
    );
  };

  return (
    <div
      className={cn(
        "group flex gap-4 animate-fade-in-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          isUser
            ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg"
            : "bg-gradient-to-br from-primary to-accent shadow-lg glow-subtle"
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Sparkles className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message */}
      <div className={cn("flex-1 max-w-[85%]", isUser && "flex justify-end")}>
        <div
          className={cn(
            "rounded-2xl relative",
            isUser
              ? "bg-primary/10 border border-primary/30 px-5 py-3"
              : "glass-premium px-5 py-4"
          )}
        >
          {/* Role */}
          <div
            className={cn(
              "text-xs font-medium mb-2",
              isUser ? "text-primary" : "text-muted-foreground"
            )}
          >
            {isUser ? "You" : "NexusAI"}
          </div>

          {/* Message Rendering */}
          {message.agent === "planner" ? (
            <div className="space-y-2">
              {title && (
                <p className="font-semibold text-lg text-primary">📌 {title}</p>
              )}

              {planSteps.map((step, idx) => (
                <p key={idx} className="leading-relaxed text-foreground">
                  <ReactMarkdown>{`Step ${idx + 1} : ${step}`}</ReactMarkdown>
                  <br />
                </p>
              ))}
            </div>
          ) : message.agent === "developer" ? (
            <p className="leading-relaxed text-foreground font-semibold">
              Code for: {title || "your project"}
            </p>
          ) : (
            <p className="leading-relaxed text-foreground">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </p>
          )}

          {/* Code Block */}
          {parsedCode && (
            <CodeBlock
              code={parsedCode.content}
              language={parsedCode.language}
            />
          )}

          {/* Action Buttons */}
          {!isUser && (
            <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs",
                  copied
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>

              <button className="p-1.5 rounded-lg hover:bg-secondary">
                <RotateCcw className="w-3 h-3" />
              </button>

              <button
                onClick={() => handleFeedback("up")}
                className={cn(
                  "p-1.5 rounded-lg",
                  feedback === "up"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                <ThumbsUp className="w-3 h-3" />
              </button>

              <button
                onClick={() => handleFeedback("down")}
                className={cn(
                  "p-1.5 rounded-lg",
                  feedback === "down"
                    ? "bg-destructive/10 text-destructive"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div
          className={cn(
            "text-[10px] text-muted-foreground mt-1",
            isUser && "text-right"
          )}
        >
          Just now
        </div>
      </div>
    </div>
  );
}
