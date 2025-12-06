import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { PreviewPanel } from "./PreviewPanel";
import { CodePanel } from "./CodePanel";
import { SplitPanel } from "./SplitPanel";
import { ChatContainer } from "../chat/ChatContainer";
import { SettingsPanel } from "../settings/SettingsPanel";
import { useParams } from "react-router-dom";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {projectId} = useParams();

  // ✅ When a project is clicked in sidebar
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Panels
  const [previewOpen, setPreviewOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);

  // Code + HTML preview storage
  const [generatedCode, setGeneratedCode] = useState("");
  const [generatedLanguage, setGeneratedLanguage] = useState("html");
  const [generatedHTML, setGeneratedHTML] = useState("");

  // Theme
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("nexus-theme");
    return savedTheme ? savedTheme !== '"light"' : true;
  });

  const [previousDarkTheme, setPreviousDarkTheme] = useState<string>(() => {
    const saved = localStorage.getItem("nexus-previous-dark-theme");
    return saved ? JSON.parse(saved) : "dark";
  });

  const handleThemeToggle = () => {
    const root = document.documentElement;

    if (isDark) {
      const darkThemes = ["dark", "original", "gray", "custom"];
      const currentDark = darkThemes.find(t => root.classList.contains(t)) || "dark";

      setPreviousDarkTheme(currentDark);
      localStorage.setItem("nexus-previous-dark-theme", JSON.stringify(currentDark));

      root.classList.remove("dark", "original", "gray", "custom");
      root.classList.add("light");
      localStorage.setItem("nexus-theme", '"light"');

      setIsDark(false);
    } else {
      root.classList.remove("light");
      root.classList.add(previousDarkTheme);

      localStorage.setItem("nexus-theme", JSON.stringify(previousDarkTheme));
      setIsDark(true);
    }
  };

  const handlePreviewToggle = () => {
    if (splitOpen) setSplitOpen(false);
    setPreviewOpen(!previewOpen);
  };

  const handleCodeToggle = () => {
    if (splitOpen) setSplitOpen(false);
    setCodeOpen(!codeOpen);
  };

  const handleSplitToggle = () => {
    if (!splitOpen) {
      setPreviewOpen(false);
      setCodeOpen(false);
    }
    setSplitOpen(!splitOpen);
  };

  const hasSidePanel = previewOpen || codeOpen || splitOpen;

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background relative">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Top Bar */}
      <TopBar
        onSettingsClick={() => setSettingsOpen(true)}
        previewOpen={previewOpen}
        codeOpen={codeOpen}
        splitOpen={splitOpen}
        onPreviewToggle={handlePreviewToggle}
        onCodeToggle={handleCodeToggle}
        onSplitToggle={handleSplitToggle}
        isDark={isDark}
        onThemeToggle={handleThemeToggle}
      />

      {/* Main */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onSettingsClick={() => setSettingsOpen(true)}
        />

        {/* Resizable Panels */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">

          {/* Chat Area */}
          <ResizablePanel defaultSize={hasSidePanel ? 60 : 100} minSize={35}>
            <main className="h-full flex flex-col overflow-hidden">
              <ChatContainer
                selectedchatId={selectedProjectId}
                onCodeGenerated={(code, lang, html) => {
                  setGeneratedCode(code);
                  setGeneratedLanguage(lang);
                  setGeneratedHTML(html);

                  setCodeOpen(true);
                  setPreviewOpen(true);
                }}
              />
            </main>
          </ResizablePanel>

          {/* Preview Panel */}
          {previewOpen && !splitOpen && (
            <>
              <ResizableHandle withHandle className="bg-border/30 hover:bg-primary/30 transition-colors" />
              <ResizablePanel defaultSize={40} minSize={20} maxSize={50}>
                <PreviewPanel
                  isOpen={previewOpen}
                  onClose={() => setPreviewOpen(false)}
                  code={generatedHTML}
                />
              </ResizablePanel>
            </>
          )}

          {/* Code Panel */}
          {codeOpen && !splitOpen && (
            <>
              <ResizableHandle withHandle className="bg-border/30 hover:bg-primary/30 transition-colors" />
              <ResizablePanel defaultSize={40} minSize={20} maxSize={50}>
                <CodePanel
                  isOpen={codeOpen}
                  onClose={() => setCodeOpen(false)}
                  code={generatedCode}
                  language={generatedLanguage}
                />
              </ResizablePanel>
            </>
          )}

          {/* Split Panel */}
          {splitOpen && (
            <>
              <ResizableHandle withHandle className="bg-border/30 hover:bg-accent/30 transition-colors" />
              <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
                <SplitPanel
                  isOpen={splitOpen}
                  onClose={() => setSplitOpen(false)}
                  // code={generatedHTML}
                  // language={generatedLanguage}
                />
              </ResizablePanel>
            </>
          )}

        </ResizablePanelGroup>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        isDark={isDark}
        onThemeChange={setIsDark}
      />
    </div>
  );
}
