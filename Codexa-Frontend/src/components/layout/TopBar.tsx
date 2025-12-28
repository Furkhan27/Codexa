import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Search,
  Sparkles,
  Code,
  Eye,
  Columns,
  Plus,
  Command,
  Zap,
  Moon,
  Sun,
  User,
  Settings,
  LogOut,
  CreditCard,
  HelpCircle,
  Crown,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/useAppData";

interface Project {
  id: string;
  title: string;
  chat_id: string;
  code: string;
  code_language: string;
  emoji?: string;
  status: "active" | "paused" | "building";
}

let projects: Project[] = [
  {
    id: "",
    title: "Recent Projects",
    chat_id: "",
    code: "",
    code_language: "",
    emoji: "",
    status: "active",
  },
];

interface TopBarProps {
  onSettingsClick: () => void;
  previewOpen: boolean;
  codeOpen: boolean;
  splitOpen: boolean;
  onPreviewToggle: () => void;
  onCodeToggle: () => void;
  onSplitToggle: () => void;
  onOpenProject: (code: string, language: string, html: string) => void;
  isDark: boolean;
  onThemeToggle: () => void;
}

export function TopBar({
  onSettingsClick,
  previewOpen,
  onOpenProject,
  codeOpen,
  splitOpen,
  onPreviewToggle,
  onCodeToggle,
  onSplitToggle,
  isDark,
  onThemeToggle,
}: TopBarProps) {
  const [activeProject, setActiveProject] = useState(projects[0]);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, userId } = useAuth();
  const { userProjects,loadProjectfiles, setsingleProjectId } = useAppData();

  console.log(user);

  

  useEffect(() => {
    projects = userProjects;
  }, [userId, userProjects]);

  const handleNewProject = () => {
    toast.success("Creating new project...", {
      description: "Your new project is being set up",
    });
    setShowProjectMenu(false);
  };

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "bg-emerald-500";
      case "building":
        return "bg-amber-500 animate-pulse";
      case "paused":
        return "bg-muted-foreground";
    }
  };

  return (
    <header className="h-16 border-b border-border/40 bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 z-50 relative">
      {/* Gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* Left section - Logo and Project Selector */}
      <div className="flex items-center gap-5">
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-bold text-lg text-foreground leading-tight tracking-tight">
              CODEXA
            </span>
            <div className="flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] text-amber-500 font-medium">
                Pro
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-8 bg-gradient-to-b from-transparent via-border to-transparent" />

        {/* Project Selector */}
        <div className="relative">
          <button
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group",
              showProjectMenu
                ? "bg-secondary ring-2 ring-primary/20"
                : "hover:bg-secondary/70"
            )}
          >
            <div className="relative">
              <span className="text-xl">✨</span>
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background",
                  getStatusColor("active")
                )}
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-foreground leading-tight">
                {activeProject.title}
              </span>
              <span className="text-[10px] text-muted-foreground capitalize">
                {"active"}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-300",
                showProjectMenu && "rotate-180"
              )}
            />
          </button>

          {showProjectMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProjectMenu(false)}
              />
              <div className="absolute top-full mt-2 left-0 w-72 z-50 animate-fade-in-scale">
                <div className="bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-border/50 bg-secondary/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Your Projects
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {projects.length} total
                      </span>
                    </div>
                  </div>

                  {/* Projects List */}
                  <div className="p-2">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          setActiveProject(project);
                          loadProjectfiles(project._id);
                          setShowProjectMenu(false);
                          setsingleProjectId(project._id)
                          onOpenProject(
                            project.code,
                            project.code_language,
                            project.code_language === "html" ? project.code : ""
                          );
                          toast.info(`Switched to ${project.title}`);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                          activeProject.id === project.id
                            ? "bg-primary/10 ring-1 ring-primary/30"
                            : "hover:bg-secondary/80"
                        )}
                      >
                        <div className="relative">
                          <span className="text-2xl">✨</span>
                          <div
                            className={cn(
                              "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card",
                              getStatusColor("active")
                            )}
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <div
                            className={cn(
                              "text-sm font-medium",
                              activeProject.id === project.id
                                ? "text-primary"
                                : "text-foreground"
                            )}
                          >
                            {project.title}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {project.status}
                          </div>
                        </div>
                        {activeProject.id === project.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="p-2 border-t border-border/50">
                    <button
                      onClick={handleNewProject}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Project</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center - View Mode Tabs */}
      <div className="hidden md:flex items-center">
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-secondary/50 border border-border/50">
          {[
            {
              id: "preview",
              label: "Preview",
              icon: Eye,
              isActive: previewOpen && !splitOpen,
              onClick: onPreviewToggle,
            },
            {
              id: "code",
              label: "Code",
              icon: Code,
              isActive: codeOpen && !splitOpen,
              onClick: onCodeToggle,
            },
            {
              id: "split",
              label: "Split",
              icon: Columns,
              isActive: splitOpen,
              onClick: onSplitToggle,
              accent: true,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={tab.onClick}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                tab.isActive
                  ? tab.accent
                    ? "bg-gradient-to-r from-accent to-primary text-white shadow-lg shadow-primary/20"
                    : "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right section - Search & Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div
          className={cn(
            "hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300",
            searchFocused
              ? "bg-secondary border-primary/30 ring-2 ring-primary/10 w-64"
              : "bg-secondary/40 border-border/40 hover:bg-secondary/60 w-48"
          )}
        >
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-background/50 border border-border/50 text-[10px] text-muted-foreground">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-8 bg-gradient-to-b from-transparent via-border to-transparent mx-1" />

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onThemeToggle}
            className="relative p-2.5 rounded-xl hover:bg-secondary/80 transition-all duration-200 text-muted-foreground hover:text-foreground group"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 group-hover:scale-110 transition-transform text-primary" />
            )}
          </button>

          <button
            className="relative p-2.5 rounded-xl hover:bg-secondary/80 transition-all duration-200 text-muted-foreground hover:text-foreground group"
            title="Usage"
          >
            <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-border to-transparent mx-1" />

        {/* User Avatar with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              "flex items-center gap-3 px-2 py-1.5 rounded-xl transition-all duration-200 group",
              showUserMenu ? "bg-secondary" : "hover:bg-secondary/80"
            )}
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300 group-hover:scale-105">
                {user?.name
                  ? user.name.charAt(0).toUpperCase() +
                    user.name.charAt(1).toUpperCase()
                  : "U"}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
            </div>
            <div className="hidden xl:flex flex-col items-start">
              <span className="text-sm font-medium text-foreground leading-tight">
                {user?.name ? user?.name : "User Name"}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Pro Plan
              </span>
            </div>
            <ChevronDown
              className={cn(
                "hidden xl:block w-4 h-4 text-muted-foreground transition-transform duration-300",
                showUserMenu && "rotate-180"
              )}
            />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute top-full mt-2 right-0 w-64 z-50 animate-fade-in-scale">
                <div className="bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
                  {/* User Info Header */}
                  <div className="px-4 py-4 border-b border-border/50 bg-gradient-to-br from-secondary/50 to-secondary/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                        {user?.name
                          ? user.name.charAt(0).toUpperCase() +
                            user.name.charAt(1).toUpperCase()
                          : "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {user.name ? user.name : "User Name"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email ? user.email : "john@example.com"}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Crown className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-amber-500 font-medium">
                            Pro Plan
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        onSettingsClick();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-secondary/80 transition-all duration-200"
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Profile Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        onSettingsClick();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-secondary/80 transition-all duration-200"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span>Account Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        toast.info("Billing page coming soon");
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-secondary/80 transition-all duration-200"
                    >
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span>Billing & Plans</span>
                    </button>
                    <button
                      onClick={() => {
                        toast.info("Help center coming soon");
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-secondary/80 transition-all duration-200"
                    >
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      <span>Help & Support</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="p-2 border-t border-border/50">
                    <button
                      onClick={() => {
                        toast.success("Logged out successfully");
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
      </div>
    </header>
  );
}
