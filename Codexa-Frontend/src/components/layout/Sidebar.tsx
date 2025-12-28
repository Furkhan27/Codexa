import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Trash2,
  Zap,
  Pencil,
  Check,
  X,
  Settings,
  Sparkles,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { set } from "date-fns";
import { useAppData } from "@/context/useAppData";

interface Chat {
  id: string;
  title: string;
  emoji: string;
  timestamp: string;
  preview: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSettingsClick: () => void;
}

export function Sidebar({ isOpen, onToggle, onSettingsClick }: SidebarProps) {
  const { userId } = useAuth();
  const { userChats } = useAppData();
  const navigate = useNavigate();
  // Chat list is now PROJECT list
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState("");
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { chatId } = useParams();
  // ============================================
  // 🚀 LOAD PROJECTS FROM BACKEND
  // ============================================
  useEffect(() => {
    if (!userId) return;

    // Convert backend projects → Sidebar Chat format
    const formatted = userChats.map((p: any) => ({
      id: p._id,
      title: p.title || "Untitled Project",
      emoji: "📁",
      timestamp: new Date(p.created_at).toLocaleDateString(),
      preview: p.description || "No description",
    }));

    setChats(formatted);
    // if (formatted.length > 0) setActiveChat(formatted[0].id);

    setActiveChat(chatId || "");
  
  }, [userId, chatId, userChats]);

  const handleProjectClick = (chatID: string) => {
    navigate(`/c/${chatID}`);
    setActiveChat(chatID);
  };
  // ============================================
  // ➕ CREATE NEW LOCAL CHAT (Frontend Only)
  // ============================================
  const handleNewChat = () => {
    // const emojis = ["💬", "🚀", "⚡", "🎯", "💡", "🔥", "🌟", "🎨"];
    // const newChat: Chat = {
    //   id: Date.now().toString(),
    //   title: "New Project",
    //   emoji: emojis[Math.floor(Math.random() * emojis.length)],
    //   timestamp: "Just now",
    //   preview: "Start building...",
    // };

    // setChats((prev) => [newChat, ...prev]);
    // setActiveChat(newChat.id);

    navigate("/");
    setActiveChat("");
    // toast.success("New project created!");
  };

  // ============================================
  // ❌ DELETE CHAT (Frontend Only)
  // ============================================
  const handleDeleteChat = (chatId: string, e: any) => {
    e.stopPropagation();

    setChats((prev) => prev.filter((c) => c.id !== chatId));

    if (activeChat === chatId) {
      const next = chats.find((c) => c.id !== chatId);
      setActiveChat(next?.id || "");
    }

    toast.success("Project removed");
  };

  // ============================================
  // ✏️ RENAME CHAT
  // ============================================
  const handleStartRename = (chat: Chat, e: any) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleSaveRename = (chatId: string) => {
    if (editingTitle.trim()) {
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId ? { ...c, title: editingTitle.trim() } : c
        )
      );
      toast.success("Project renamed");
    }
    setEditingChatId(null);
    setEditingTitle("");
  };

  const handleCancelRename = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  // ============================================
  // 🔍 SEARCH FILTER
  // ============================================
  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ============================================
  // UI / COMPONENT — NO DESIGN CHANGES MADE
  // ============================================
  return (
    <aside
      className={cn(
        "h-full border-r border-border/50 bg-card/50 backdrop-blur-sm flex flex-col transition-all duration-300 ease-out relative",
        isOpen ? "w-72" : "w-16"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      {/* Header */}
      <div className="p-4 border-b border-border/50 relative z-10">
        <div
          className={cn(
            "flex items-center gap-2",
            isOpen ? "mb-4" : "justify-center"
          )}
        >
          <button
            onClick={onToggle}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 hover:shadow-primary/50 transition-all duration-300 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </button>
          {isOpen && (
            <div>
              <span className="text-sm font-semibold text-foreground">
                CODEXA
              </span>
              <span className="text-[10px] text-muted-foreground block">
                Projects
              </span>
            </div>
          )}
        </div>

        {/* Search */}
        {isOpen && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            />
          </div>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-3 relative z-10">
        <button
          onClick={handleNewChat}
          className={cn(
            "w-full flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium text-sm transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.02]",
            !isOpen && "justify-center px-3"
          )}
        >
          <Plus className="w-4 h-4" />
          {isOpen && <span>New Project</span>}
        </button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-1 relative z-10">
        <div className="space-y-1">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => {
                setActiveChat(chat.id);
                handleProjectClick(chat.id);
              }}
              onMouseEnter={() => setHoveredChat(chat.id)}
              onMouseLeave={() => setHoveredChat(null)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                activeChat === chat.id
                  ? "bg-primary/10 text-foreground border border-primary/30"
                  : "hover:bg-secondary/70 text-muted-foreground hover:text-foreground border border-transparent",
                !isOpen && "justify-center px-2"
              )}
            >
              {activeChat === chat.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary" />
              )}

              <span className="text-lg shrink-0">{chat.emoji}</span>

              {isOpen && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    {editingChatId === chat.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 text-sm bg-background border border-border rounded-lg px-2 py-1 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                        <button
                          onClick={() => handleSaveRename(chat.id)}
                          className="p-1.5 rounded-lg hover:bg-primary/20 text-primary"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleCancelRename}
                          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm font-medium truncate">
                          {chat.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {chat.timestamp}
                        </div>
                      </>
                    )}
                  </div>

                  {hoveredChat === chat.id && editingChatId !== chat.id && (
                    <div className="flex items-center gap-0.5 animate-fade-in">
                      <button
                        onClick={(e) => handleStartRename(chat, e)}
                        className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="p-3 border-t border-border/50 space-y-2 relative z-10">
        {isOpen && (
          <div className="p-3 rounded-xl bg-gradient-to-br from-secondary/80 to-secondary/40 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium">API Usage</span>
              </div>
              <span className="text-xs text-primary font-medium">75%</span>
            </div>
            <div className="h-2 bg-background/50 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-primary to-accent rounded-full" />
            </div>
            <div className="text-[10px] text-muted-foreground mt-2">
              7,500 / 10,000 tokens
            </div>
          </div>
        )}

        <button
          onClick={onSettingsClick}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/70 text-muted-foreground hover:text-foreground group border border-transparent hover:border-border/50",
            !isOpen && "justify-center px-2"
          )}
        >
          <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
          {isOpen && <span className="text-sm">Settings</span>}
        </button>
      </div>
    </aside>
  );
}
