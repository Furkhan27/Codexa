import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, X, FileCode, ChevronDown, Download, Settings2, Terminal, Braces } from "lucide-react";
import { toast } from "sonner";
import { Highlight, themes } from "prism-react-renderer";

interface CodePanelProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
}

interface CodeFile {
  id: string;
  name: string;
  language: string;
  code: string;
  icon: string;
}

export function CodePanel({ isOpen, onClose, code, language }: CodePanelProps) {
  const [copied, setCopied] = useState(false);
  const [activeFile, setActiveFile] = useState<CodeFile | null>(null);
  const [showFileMenu, setShowFileMenu] = useState(false);

  // ✅ Create a “virtual file” from backend code
  useEffect(() => {
    if (code) {
      setActiveFile({
        id: "generated",
        name: `generated.${language === "tsx" ? "tsx" : language || "txt"}`,
        language: language || "txt",
        code: code,
        icon: "📄",
      });
    }
  }, [code, language]);

  const handleCopy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${activeFile.name}`);
  };

  if (!isOpen || !activeFile) return null;

  return (
    <div className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-l border-border/50 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none" />

      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between shrink-0 bg-secondary/30 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Braces className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Code</span>
          </div>

          {/* Language pill */}
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
            {activeFile.language.toUpperCase()}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* File Menu (still kept for UI consistency) */}
      <div className="px-2 py-2 border-b border-border/50 flex items-center gap-2 bg-background/30 overflow-x-auto scrollbar-thin relative z-10">
        <button
          onClick={() => setShowFileMenu(!showFileMenu)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shrink-0",
            "bg-primary/10 text-primary border border-primary/30"
          )}
        >
          <span>📄</span>
          {activeFile.name}
        </button>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between bg-background/20 relative z-10">
        <div className="relative">
          <button
            onClick={() => setShowFileMenu(!showFileMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border/50"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{activeFile.name}</span>
            <ChevronDown className={cn("w-3 h-3 transition-transform", showFileMenu && "rotate-180")} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200",
              copied
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent"
            )}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="flex-1 overflow-auto scrollbar-thin bg-[#011627] relative z-10">
        <Highlight theme={themes.nightOwl} code={activeFile.code} language={activeFile.language}>
          {({ tokens, getLineProps, getTokenProps }) => (
            <pre className="text-[13px] leading-relaxed p-4 min-h-full font-mono">
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })} className="table-row group hover:bg-white/5 transition-colors">
                  <span className="table-cell pr-6 text-slate-500 select-none text-right w-12 sticky left-0 bg-[#011627] group-hover:text-slate-400 transition-colors">
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

      {/* Footer Status Bar */}
      <div className="px-4 py-2.5 border-t border-border/50 bg-secondary/30 backdrop-blur-sm flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-primary" />
            <span>Ln 1, Col 1</span>
          </div>
          <span>UTF-8</span>
          <span className="text-primary">{activeFile.language.toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{activeFile.code.split("\n").length} lines</span>
        </div>
      </div>
    </div>
  );
}
