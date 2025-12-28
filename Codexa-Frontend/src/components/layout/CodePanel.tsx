import { useState, useMemo } from "react";
import {
  Copy,
  Check,
  X,
  Download,
  Settings2,
  Braces,
  FolderTree,
  Folder,
  File as FileIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Highlight, themes } from "prism-react-renderer";
import { useAppData } from "@/context/useAppData";

/* ----------------------------------------
   Tree Types (STRICT & SAFE)
---------------------------------------- */
type FolderNode = {
  type: "folder";
  children: Record<string, TreeNode>;
};

type FileNode = {
  type: "file";
  file: any;
};

type TreeNode = FolderNode | FileNode;

export function CodePanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { projectFiles, selectedFile, setSelectedFile } = useAppData();

  const [copied, setCopied] = useState(false);
  const [showFolderView, setShowFolderView] = useState(
    selectedFile === null
  );

  const activeFile = selectedFile;

  /* ----------------------------------------
     Actions
  ---------------------------------------- */
  const handleCopy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ----------------------------------------
     Build Folder Tree (NO UNION MUTATION)
  ---------------------------------------- */
  const folderTree = useMemo<FolderNode>(() => {
    const root: FolderNode = {
      type: "folder",
      children: {},
    };

    projectFiles.forEach((file) => {
      const parts = file.path.split("/");
      let current: FolderNode = root;

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current.children[part] = {
            type: "file",
            file,
          };
        } else {
          if (!current.children[part]) {
            current.children[part] = {
              type: "folder",
              children: {},
            };
          }
          current = current.children[part] as FolderNode;
        }
      });
    });

    return root;
  }, [projectFiles]);

  /* ----------------------------------------
     Render Tree
  ---------------------------------------- */
  const renderTree = (node: FolderNode, depth = 0) => {
    return Object.entries(node.children).map(([name, child]) => (
      <div key={name} style={{ paddingLeft: depth * 14 }}>
        <div
          onClick={() => {
            if (child.type === "file") {
              setSelectedFile(child.file);
              setShowFolderView(false);
            }
          }}
          className="flex items-center gap-2 py-1 text-sm rounded-md cursor-pointer
                     text-muted-foreground hover:text-foreground
                     hover:bg-secondary/40 transition"
        >
          {child.type === "folder" ? (
            <Folder className="w-4 h-4 text-primary" />
          ) : (
            <FileIcon className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="font-medium">{name}</span>
        </div>

        {child.type === "folder" &&
          renderTree(child, depth + 1)}
      </div>
    ));
  };

  if (!isOpen) return <b>Loading ...</b>;

  return (
    <div className="h-full flex flex-col bg-card/50 border-l border-border/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 flex justify-between bg-secondary/30">
        <div className="flex items-center gap-2">
          <Braces className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Code</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-secondary"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-border/50 flex justify-between bg-background/20">
        <button
          onClick={() => setShowFolderView((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                     text-xs border border-border/50 hover:bg-secondary"
        >
          <FolderTree className="w-4 h-4" />
          {showFolderView ? "Show Code" : "Show Files"}
        </button>
        <button
          onClick={() => setShowFolderView((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                     text-xs text-muted-foreground  hover:bg-secondary"
        >
          <FileIcon className="w-4 h-4 text-muted-foreground" />
          {activeFile.name.toUpperCase()}
        </button>

        {activeFile && (
          <div className="flex gap-1">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg text-xs hover:bg-secondary"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg text-xs hover:bg-secondary"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button className="p-1.5 rounded-lg hover:bg-secondary">
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Viewer */}
      <div className="flex-1 overflow-auto bg-[#011627]">
        {showFolderView || !activeFile ? (
          <div className="p-4 text-sm bg-background/40">
            <div className="flex items-center gap-2 mb-3 text-primary font-semibold">
              <FolderTree className="w-4 h-4" />
              Project Structure
            </div>
            {renderTree(folderTree)}
          </div>
        ) : (
          <Highlight
            theme={themes.nightOwl}
            code={activeFile.content}
            language={activeFile.language}
          >
            {({ tokens, getLineProps, getTokenProps }) => (
              <pre className="text-[13px] p-4 font-mono">
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    <span className="pr-6 text-slate-500 select-none">
                      {i + 1}
                    </span>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        )}
      </div>

      {/* Footer */}
      {activeFile && (
        <div className="px-4 py-2 border-t border-border/50 bg-secondary/30 text-xs text-muted-foreground flex justify-between">
          <span>{activeFile.language.toUpperCase()}</span>
          <span>{activeFile.content.split("\n").length} lines</span>
        </div>
      )}
    </div>
  );
}
