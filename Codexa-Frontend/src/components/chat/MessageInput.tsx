import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Send, Paperclip, Mic, Image, Sparkles, Command } from "lucide-react";

interface MessageInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export function MessageInput({ onSend, isLoading = false }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative z-10 px-4 pb-6 pt-2">
      <div className="max-w-3xl mx-auto">
        {/* Main Input Container */}
        <div
          className={cn(
            "relative rounded-2xl transition-all duration-300",
            isFocused
              ? "ring-2 ring-primary/30 shadow-lg shadow-primary/10"
              : "ring-1 ring-border/50"
          )}
        >
          {/* Gradient border effect when focused */}
          {isFocused && (
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 opacity-50 blur-sm -z-10" />
          )}

          <div className="glass-premium rounded-2xl overflow-hidden">
            {/* Textarea */}
            <div className="px-4 pt-4 pb-2">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ask NexusAI anything..."
                className="w-full bg-transparent resize-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none max-h-[150px] scrollbar-thin leading-relaxed"
                rows={1}
                disabled={isLoading}
              />
            </div>

            {/* Bottom Toolbar */}
            <div className="px-3 pb-3 flex items-center justify-between">
              {/* Left Actions */}
              <div className="flex items-center gap-1">
                <button 
                  className="p-2 rounded-xl hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all duration-200 group"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <button 
                  className="p-2 rounded-xl hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all duration-200 group"
                  title="Upload image"
                >
                  <Image className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <button 
                  className="p-2 rounded-xl hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all duration-200 group"
                  title="Voice input"
                >
                  <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                
                <div className="h-5 w-px bg-border/50 mx-1" />
                
                <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all duration-200 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Pro Mode</span>
                </button>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/50 text-[10px] text-muted-foreground">
                  <Command className="w-3 h-3" />
                  <span>+ Enter</span>
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={!message.trim() || isLoading}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                    message.trim() && !isLoading
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.02]"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  <Send className={cn("w-4 h-4", message.trim() && !isLoading && "animate-pulse-soft")} />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Helper text */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <p className="text-[11px] text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono">Shift + Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
}
