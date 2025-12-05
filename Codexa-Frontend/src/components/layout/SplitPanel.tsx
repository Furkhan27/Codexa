import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  ExternalLink,
  X,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  FileCode,
  Download,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { Highlight, themes } from "prism-react-renderer";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

type DeviceMode = "desktop" | "tablet" | "mobile";

interface SplitPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const sampleCode = `import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ 
  variant = "primary",
  size = "md",
  children,
  onClick 
}: ButtonProps) {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-secondary text-foreground",
    ghost: "bg-transparent hover:bg-secondary"
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl font-medium transition-all",
        variants[variant]
      )}
    >
      {children}
    </button>
  );
}`;

export function SplitPanel({ isOpen, onClose }: SplitPanelProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleCode);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sampleCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Button.tsx";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded Button.tsx");
  };

  if (!isOpen) return null;

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0 bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-sm font-semibold text-foreground">Split View</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
            Preview + Code
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Split Content */}
      <ResizablePanelGroup direction="vertical" className="flex-1">
        {/* Preview Section */}
        <ResizablePanel defaultSize={50} minSize={25}>
          <div className="h-full flex flex-col">
            {/* Preview Controls */}
            <div className="px-3 py-2 border-b border-border flex items-center justify-between bg-background/50">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-muted-foreground">Preview</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-secondary/50">
                  {[
                    { mode: "desktop" as DeviceMode, icon: Monitor },
                    { mode: "tablet" as DeviceMode, icon: Tablet },
                    { mode: "mobile" as DeviceMode, icon: Smartphone },
                  ].map(({ mode, icon: Icon }) => (
                    <button
                      key={mode}
                      onClick={() => setDeviceMode(mode)}
                      className={cn(
                        "p-1.5 rounded transition-all duration-200",
                        deviceMode === mode
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleRefresh}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
                </button>
                <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-hidden p-3 bg-[repeating-linear-gradient(45deg,hsl(var(--secondary)/0.2)_0px,hsl(var(--secondary)/0.2)_1px,transparent_1px,transparent_8px)]">
              <div className={cn(
                "h-full mx-auto bg-background rounded-lg border border-border shadow-lg overflow-hidden transition-all duration-300",
                deviceMode === "desktop" && "w-full",
                deviceMode === "tablet" && "max-w-[400px]",
                deviceMode === "mobile" && "max-w-[280px]"
              )}>
                {/* Mini Browser Chrome */}
                <div className="h-6 bg-secondary/50 border-b border-border flex items-center px-2 gap-1.5">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/70" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
                    <div className="w-2 h-2 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex-1 mx-2">
                    <div className="h-3.5 bg-background/60 rounded text-[8px] flex items-center px-2 text-muted-foreground">
                      localhost:3000
                    </div>
                  </div>
                </div>

                {/* Preview Area */}
                <div className="h-[calc(100%-1.5rem)] flex flex-col items-center justify-center gap-2 p-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md animate-float">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-semibold text-foreground">Live Preview</h3>
                    <p className="text-[10px] text-muted-foreground">UI appears here</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-medium text-emerald-500">Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-border/50 hover:bg-primary/30 transition-colors data-[panel-group-direction=vertical]:h-2" />

        {/* Code Section */}
        <ResizablePanel defaultSize={50} minSize={25}>
          <div className="h-full flex flex-col">
            {/* Code Controls */}
            <div className="px-3 py-2 border-b border-border flex items-center justify-between bg-background/50">
              <div className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Button.tsx</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] transition-all",
                    copied
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto scrollbar-thin bg-[#011627]">
              <Highlight theme={themes.nightOwl} code={sampleCode} language="tsx">
                {({ tokens, getLineProps, getTokenProps }) => (
                  <pre className="text-[11px] leading-relaxed p-3 min-h-full">
                    {tokens.map((line, i) => (
                      <div key={i} {...getLineProps({ line })} className="table-row hover:bg-white/5">
                        <span className="table-cell pr-4 text-slate-600 select-none text-right w-8">
                          {i + 1}
                        </span>
                        <span className="table-cell">
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                          ))}
                        </span>
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
