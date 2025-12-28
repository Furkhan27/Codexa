import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { Toggle } from "@/components/ui/toggle";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  User,
  Palette,
  Bell,
  Shield,
  Keyboard,
  Globe,
  Zap,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  ArrowLeft,
  Mail,
  Camera,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Smartphone,
  History,
  Sparkles,
  Save,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onThemeChange: (isDark: boolean) => void;
}

type SettingsTab =
  | "account"
  | "appearance"
  | "notifications"
  | "privacy"
  | "shortcuts"
  | "language"
  | "ai";
type ThemeType = "light" | "dark" | "original" | "gray" | "custom";

const tabs = [
  { id: "account" as SettingsTab, label: "Account", icon: User },
  { id: "appearance" as SettingsTab, label: "Appearance", icon: Palette },
  { id: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
  { id: "privacy" as SettingsTab, label: "Privacy & Security", icon: Shield },
  {
    id: "shortcuts" as SettingsTab,
    label: "Keyboard Shortcuts",
    icon: Keyboard,
  },
  { id: "language" as SettingsTab, label: "Language", icon: Globe },
  { id: "ai" as SettingsTab, label: "AI Settings", icon: Zap },
];

const accentColors = [
  {
    name: "Cyan",
    hue: "187",
    saturation: "100%",
    lightness: "42%",
    darkLightness: "35%",
    isTransparent: false,
  },
  {
    name: "Blue",
    hue: "217",
    saturation: "91%",
    lightness: "60%",
    darkLightness: "50%",
    isTransparent: false,
  },
  {
    name: "Violet",
    hue: "262",
    saturation: "80%",
    lightness: "60%",
    darkLightness: "55%",
    isTransparent: false,
  },
  {
    name: "Pink",
    hue: "330",
    saturation: "81%",
    lightness: "60%",
    darkLightness: "55%",
    isTransparent: false,
  },
  {
    name: "Emerald",
    hue: "160",
    saturation: "84%",
    lightness: "39%",
    darkLightness: "35%",
    isTransparent: false,
  },
  {
    name: "Amber",
    hue: "38",
    saturation: "92%",
    lightness: "50%",
    darkLightness: "45%",
    isTransparent: false,
  },
  {
    name: "Rose",
    hue: "350",
    saturation: "89%",
    lightness: "60%",
    darkLightness: "55%",
    isTransparent: false,
  },
  {
    name: "Transparent",
    hue: "0",
    saturation: "0%",
    lightness: "100%",
    darkLightness: "100%",
    isTransparent: true,
  },
];

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

const shortcuts = [
  { action: "New Chat", keys: ["⌘", "N"] },
  { action: "Search", keys: ["⌘", "K"] },
  { action: "Toggle Sidebar", keys: ["⌘", "B"] },
  { action: "Toggle Preview", keys: ["⌘", "P"] },
  { action: "Toggle Code", keys: ["⌘", "E"] },
  { action: "Settings", keys: ["⌘", ","] },
  { action: "Close Panel", keys: ["Esc"] },
  { action: "Send Message", keys: ["Enter"] },
  { action: "New Line", keys: ["Shift", "Enter"] },
];

// Helper to load settings from localStorage
const loadSetting = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(`nexus-${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Helper to save settings to localStorage
const saveSetting = (key: string, value: unknown) => {
  localStorage.setItem(`nexus-${key}`, JSON.stringify(value));
};

export function SettingsPanel({
  isOpen,
  onClose,
  isDark,
  onThemeChange,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("appearance");
  const [theme, setTheme] = useState<ThemeType>(() =>
    loadSetting("theme", isDark ? "dark" : "light")
  );
  const [selectedModel, setSelectedModel] = useState(() =>
    loadSetting("model", 0)
  );
  const [responseStyle, setResponseStyle] = useState(() =>
    loadSetting("response-style", 1)
  );
  const [selectedAccent, setSelectedAccent] = useState(() =>
    loadSetting("accent-color", 0)
  );
  const [fontSize, setFontSize] = useState(() => loadSetting("font-size", 16));
  const [animationsEnabled, setAnimationsEnabled] = useState(() =>
    loadSetting("animations", true)
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    loadSetting("notifications", true)
  );
  const [soundEnabled, setSoundEnabled] = useState(() =>
    loadSetting("sound", true)
  );
  const [emailNotifications, setEmailNotifications] = useState(() =>
    loadSetting("email-notifications", true)
  );
  const [selectedLanguage, setSelectedLanguage] = useState(() =>
    loadSetting("language", "en")
  );
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() =>
    loadSetting("2fa", false)
  );
  const [dataCollection, setDataCollection] = useState(() =>
    loadSetting("data-collection", true)
  );
  const [codeFormatting, setCodeFormatting] = useState(() =>
    loadSetting("code-formatting", true)
  );
  const [streamingEnabled, setStreamingEnabled] = useState(() =>
    loadSetting("streaming", true)
  );
  const [compactMode, setCompactMode] = useState(() =>
    loadSetting("compact-mode", false)
  );
  const [autoSave, setAutoSave] = useState(() =>
    loadSetting("auto-save", true)
  );
  const [customColor, setCustomColor] = useState(() =>
    loadSetting("custom-color", "#3b82f6")
  );

  const { userId, user } = useAuth();

  // Apply accent color to CSS variables
  useEffect(() => {
    const color = accentColors[selectedAccent];
    const root = document.documentElement;

    if (color.isTransparent) {
      // Transparent accent - use muted foreground color
      root.style.setProperty("--primary", "215 20% 55%");
      root.style.setProperty("--ring", "215 20% 55%");
      root.style.setProperty("--glow-primary", "215 20% 55%");
      root.style.setProperty("--gradient-start", "215 20% 55%");
    } else {
      // Set primary color based on theme
      if (
        isDark ||
        theme === "dark" ||
        theme === "original" ||
        theme === "gray" ||
        theme === "custom"
      ) {
        root.style.setProperty(
          "--primary",
          `${color.hue} ${color.saturation} ${color.lightness}`
        );
        root.style.setProperty(
          "--ring",
          `${color.hue} ${color.saturation} ${color.lightness}`
        );
        root.style.setProperty(
          "--glow-primary",
          `${color.hue} ${color.saturation} ${color.lightness}`
        );
        root.style.setProperty(
          "--gradient-start",
          `${color.hue} ${color.saturation} ${color.lightness}`
        );
      } else {
        root.style.setProperty(
          "--primary",
          `${color.hue} ${color.saturation} ${color.darkLightness}`
        );
        root.style.setProperty(
          "--ring",
          `${color.hue} ${color.saturation} ${color.darkLightness}`
        );
        root.style.setProperty(
          "--glow-primary",
          `${color.hue} ${color.saturation} ${color.darkLightness}`
        );
        root.style.setProperty(
          "--gradient-start",
          `${color.hue} ${color.saturation} ${color.darkLightness}`
        );
      }
    }
    saveSetting("accent-color", selectedAccent);
  }, [selectedAccent, isDark, theme]);

  // Apply font size as CSS variable and persist
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--user-font-size",
      `${fontSize}px`
    );
    saveSetting("font-size", fontSize);
  }, [fontSize]);

  // Apply animations setting
  useEffect(() => {
    if (animationsEnabled) {
      document.documentElement.classList.remove("reduce-motion");
    } else {
      document.documentElement.classList.add("reduce-motion");
    }
    saveSetting("animations", animationsEnabled);
  }, [animationsEnabled]);

  // Persist other settings
  useEffect(() => {
    saveSetting("theme", theme);
  }, [theme]);
  useEffect(() => {
    saveSetting("model", selectedModel);
  }, [selectedModel]);
  useEffect(() => {
    saveSetting("response-style", responseStyle);
  }, [responseStyle]);
  useEffect(() => {
    saveSetting("notifications", notificationsEnabled);
  }, [notificationsEnabled]);
  useEffect(() => {
    saveSetting("sound", soundEnabled);
  }, [soundEnabled]);
  useEffect(() => {
    saveSetting("email-notifications", emailNotifications);
  }, [emailNotifications]);
  useEffect(() => {
    saveSetting("language", selectedLanguage);
  }, [selectedLanguage]);
  useEffect(() => {
    saveSetting("2fa", twoFactorEnabled);
  }, [twoFactorEnabled]);
  useEffect(() => {
    saveSetting("data-collection", dataCollection);
  }, [dataCollection]);
  useEffect(() => {
    saveSetting("code-formatting", codeFormatting);
  }, [codeFormatting]);
  useEffect(() => {
    saveSetting("streaming", streamingEnabled);
  }, [streamingEnabled]);
  useEffect(() => {
    saveSetting("compact-mode", compactMode);
  }, [compactMode]);
  useEffect(() => {
    saveSetting("auto-save", autoSave);
  }, [autoSave]);
  useEffect(() => {
    saveSetting("custom-color", customColor);
  }, [customColor]);

  // Helper function to apply custom color
  const applyCustomColor = (color: string) => {
    const root = document.documentElement;
    // Convert hex to HSL
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    const hue = Math.round(h * 360);
    const sat = Math.round(s * 100);
    const light = Math.round(l * 100);

    root.style.setProperty("--custom-primary", `${hue} ${sat}% ${light}%`);
    root.style.setProperty("--primary", `${hue} ${sat}% ${light}%`);
    root.style.setProperty("--ring", `${hue} ${sat}% ${light}%`);
    root.style.setProperty("--glow-primary", `${hue} ${sat}% ${light}%`);
    root.style.setProperty("--gradient-start", `${hue} ${sat}% ${light}%`);
  };

  // Apply custom color on mount if custom theme is selected
  useEffect(() => {
    if (theme === "custom") {
      const root = document.documentElement;
      root.classList.add("custom");
      applyCustomColor(customColor);
    }
  }, []);

  if (!isOpen) return null;

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove("light", "dark", "original", "gray", "custom");

    if (newTheme === "light") {
      root.classList.add("light");
      onThemeChange(false);
    } else if (newTheme === "dark") {
      root.classList.add("dark");
      onThemeChange(true);
    } else if (newTheme === "original") {
      // Original is the default root theme (no class needed)
      onThemeChange(true);
    } else if (newTheme === "gray") {
      root.classList.add("gray");
      onThemeChange(true);
    } else if (newTheme === "custom") {
      root.classList.add("custom");
      applyCustomColor(customColor);
      onThemeChange(true);
    }
    toast.success(`Theme changed to ${newTheme}`);
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    if (theme === "custom") {
      applyCustomColor(color);
    }
  };

  const handleAccentChange = (index: number) => {
    setSelectedAccent(index);
    toast.success(`Accent color changed to ${accentColors[index].name}`);
  };

  const handleFontSizeChange = (value: number) => {
    const clampedValue = Math.min(24, Math.max(12, value));
    setFontSize(clampedValue);
  };

  const handleFontSizeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 16;
    handleFontSizeChange(value);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFontSizeChange(parseInt(e.target.value));
  };

  const handleAnimationsToggle = () => {
    const newValue = !animationsEnabled;
    setAnimationsEnabled(newValue);
    toast.success(newValue ? "Animations enabled" : "Animations disabled");
  };

  const handleResetSettings = () => {
    setFontSize(16);
    setSelectedAccent(0);
    setAnimationsEnabled(true);
    setCompactMode(false);
    toast.success("Appearance settings reset to defaults");
  };

  const handleModelChange = (index: number) => {
    setSelectedModel(index);
    const modelNames = ["CODEXA Pro", "CODEXA Fast", "CODEXA Light"];
    toast.success(`Switched to ${modelNames[index]}`);
  };

  const handleResponseStyleChange = (index: number) => {
    setResponseStyle(index);
    const styles = ["Concise", "Balanced", "Detailed"];
    toast.success(`Response style set to ${styles[index]}`);
  };

  const getAccentColorClass = (index: number) => {
    const colors = [
      "bg-cyan-500",
      "bg-blue-500",
      "bg-violet-500",
      "bg-pink-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-600 dark:to-gray-800",
    ];
    return colors[index];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in-up"
        onClick={onClose}
      />

      {/* Panel */}
      <GlassCard
        variant="strong"
        className="relative w-full max-w-4xl h-[650px] flex overflow-hidden animate-fade-in-scale"
      >
        {/* Back Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all duration-200 z-10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all duration-200 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sidebar */}
        <div className="w-64 border-r border-border/50 p-4 pt-16 bg-secondary/20">
          <h2 className="text-lg font-semibold text-foreground mb-6 px-3">
            Settings
          </h2>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 pt-16 overflow-y-auto scrollbar-thin">
          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="space-y-8 animate-fade-in-up">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Account
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage your account information and preferences.
                </p>
              </div>

              {/* Profile Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Profile</h4>
                <div className="flex items-start gap-6 p-4 rounded-xl border border-border/50 bg-secondary/20">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                      JD
                    </div>
                    <button className="absolute inset-0 rounded-2xl bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 text-foreground" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Display Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user.name? user.name : "User Name"}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Email
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="email"
                          defaultValue={user.email? user.email : "example@email.com"}
                          className="flex-1 px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">
                  Change Password
                </h4>
                <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-secondary/20">
                  <div>
                    <label className="text-xs text-muted-foreground">
                      Current Password
                    </label>
                    <div className="relative mt-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 pr-10 rounded-lg bg-background border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <button
                    onClick={() =>
                      toast.success("Password updated successfully")
                    }
                    className="w-full mt-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-destructive">
                  Danger Zone
                </h4>
                <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Delete Account
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        toast.error(
                          "Account deletion requires confirmation via email"
                        )
                      }
                      className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="space-y-8 animate-fade-in-up">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Appearance
                </h3>
                <p className="text-sm text-muted-foreground">
                  Customize how CODEXA looks and feels on your device.
                </p>
              </div>

              {/* Theme Selection */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Theme</h4>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    {
                      id: "light" as ThemeType,
                      label: "Light",
                      icon: Sun,
                      bgClass: "bg-white border border-gray-200",
                    },
                    {
                      id: "dark" as ThemeType,
                      label: "Dark",
                      icon: Moon,
                      bgClass: "bg-black",
                    },
                    {
                      id: "original" as ThemeType,
                      label: "Original",
                      icon: Sparkles,
                      bgClass: "bg-[#0d1321]",
                    },
                    {
                      id: "gray" as ThemeType,
                      label: "Gray",
                      icon: Monitor,
                      bgClass: "bg-gray-500",
                    },
                    {
                      id: "custom" as ThemeType,
                      label: "Custom",
                      icon: Palette,
                      bgClass: "",
                    },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleThemeChange(option.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200",
                        theme === option.id
                          ? "border-primary bg-primary/10 glow-subtle"
                          : "border-border/50 hover:border-border hover:bg-secondary/30"
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          option.bgClass,
                          option.id === "custom" && "overflow-hidden",
                          !option.bgClass &&
                            (theme === option.id
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary text-muted-foreground")
                        )}
                        style={
                          option.id === "custom"
                            ? { backgroundColor: customColor }
                            : undefined
                        }
                      >
                        {option.id === "light" && (
                          <option.icon className="w-5 h-5 text-yellow-500" />
                        )}
                        {option.id === "dark" && (
                          <option.icon className="w-5 h-5 text-white" />
                        )}
                        {option.id === "original" && (
                          <option.icon className="w-5 h-5 text-cyan-400" />
                        )}
                        {option.id === "gray" && (
                          <option.icon className="w-5 h-5 text-white" />
                        )}
                        {option.id === "custom" && (
                          <option.icon className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          theme === option.id
                            ? "text-primary"
                            : "text-foreground"
                        )}
                      >
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Theme Color Picker */}
              {theme === "custom" && (
                <div className="space-y-4 p-4 rounded-xl border border-primary/30 bg-primary/5">
                  <h4 className="text-sm font-medium text-foreground">
                    Custom Theme Color
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) =>
                          handleCustomColorChange(e.target.value)
                        }
                        className="w-16 h-16 rounded-xl cursor-pointer border-2 border-border/50"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customColor}
                          onChange={(e) =>
                            handleCustomColorChange(e.target.value)
                          }
                          placeholder="#3b82f6"
                          className="flex-1 px-3 py-2 text-sm bg-secondary border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pick any color or enter a hex value
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Accent Color */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">
                  Accent Color
                </h4>
                <div className="flex items-center gap-3 flex-wrap">
                  {accentColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handleAccentChange(index)}
                      title={color.name}
                      className={cn(
                        "w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 relative",
                        getAccentColorClass(index),
                        selectedAccent === index &&
                          "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110"
                      )}
                    >
                      {selectedAccent === index && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: {accentColors[selectedAccent].name}
                </p>
              </div>

              {/* Font Size */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">
                    Font Size
                  </h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="12"
                      max="24"
                      value={fontSize}
                      onChange={handleFontSizeInput}
                      className="w-16 px-2 py-1 text-sm text-center bg-secondary border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <span className="text-xs text-muted-foreground">px</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-6">12</span>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    step="1"
                    value={fontSize}
                    onChange={handleSliderChange}
                    className="flex-1 h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground w-6">24</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Adjust the base font size for chat messages (12-24px)
                </p>
              </div>

              {/* Animations Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20">
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    Enable Animations
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Show smooth transitions and micro-interactions
                  </p>
                </div>
                <Toggle
                  enabled={animationsEnabled}
                  onToggle={handleAnimationsToggle}
                />
              </div>

              {/* Compact Mode Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20">
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    Compact Mode
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reduce spacing and padding for a denser layout
                  </p>
                </div>
                <Toggle
                  enabled={compactMode}
                  onToggle={() => {
                    setCompactMode(!compactMode);
                    toast.success(
                      compactMode
                        ? "Compact mode disabled"
                        : "Compact mode enabled"
                    );
                  }}
                />
              </div>

              {/* Reset Button */}
              <button
                onClick={handleResetSettings}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm">Reset to defaults</span>
              </button>
            </div>
          )}

          {/* AI Settings Tab */}
          {activeTab === "ai" && (
            <div className="space-y-8 animate-fade-in-up">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  AI Settings
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configure how CODEXA responds and generates content.
                </p>
              </div>

              {/* Model Selection */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">
                  AI Model
                </h4>
                <div className="space-y-2">
                  {[
                    {
                      name: "CODEXA Pro",
                      desc: "Most capable, best for complex tasks",
                      badge: "Recommended",
                      tokens: "8K context",
                    },
                    {
                      name: "CODEXA Fast",
                      desc: "Optimized for speed",
                      badge: null,
                      tokens: "4K context",
                    },
                    {
                      name: "CODEXA Light",
                      desc: "Lightweight, cost-effective",
                      badge: null,
                      tokens: "2K context",
                    },
                  ].map((model, index) => (
                    <button
                      key={index}
                      onClick={() => handleModelChange(index)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                        selectedModel === index
                          ? "border-primary bg-primary/10"
                          : "border-border/50 hover:border-border hover:bg-secondary/30"
                      )}
                    >
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {model.name}
                          </span>
                          {model.badge && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                              {model.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {model.desc}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {model.tokens}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 transition-all duration-200",
                          selectedModel === index
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        )}
                      >
                        {selectedModel === index && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Style */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">
                  Response Style
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: "Concise", desc: "Brief, to the point" },
                    { name: "Balanced", desc: "Default style" },
                    { name: "Detailed", desc: "Thorough explanations" },
                  ].map((style, index) => (
                    <button
                      key={style.name}
                      onClick={() => handleResponseStyleChange(index)}
                      className={cn(
                        "px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200 flex flex-col items-center gap-1",
                        responseStyle === index
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                      )}
                    >
                      <span>{style.name}</span>
                      <span className="text-xs opacity-60">{style.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional AI Settings */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">
                  Additional Options
                </h4>
                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Code Formatting
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Automatically format code in responses
                    </p>
                  </div>
                  <Toggle
                    enabled={codeFormatting}
                    onToggle={() => {
                      setCodeFormatting(!codeFormatting);
                      toast.success(
                        codeFormatting
                          ? "Code formatting disabled"
                          : "Code formatting enabled"
                      );
                    }}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Streaming Responses
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Show responses as they are generated
                    </p>
                  </div>
                  <Toggle
                    enabled={streamingEnabled}
                    onToggle={() => {
                      setStreamingEnabled(!streamingEnabled);
                      toast.success(
                        streamingEnabled
                          ? "Streaming disabled"
                          : "Streaming enabled"
                      );
                    }}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Auto-save Conversations
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Automatically save chat history
                    </p>
                  </div>
                  <Toggle
                    enabled={autoSave}
                    onToggle={() => {
                      setAutoSave(!autoSave);
                      toast.success(
                        autoSave ? "Auto-save disabled" : "Auto-save enabled"
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-8 animate-fade-in-up">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Notifications
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage your notification preferences.
                </p>
              </div>

              {/* Notifications Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20">
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    Push Notifications
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Receive notifications for important updates
                  </p>
                </div>
                <Toggle
                  enabled={notificationsEnabled}
                  onToggle={() => {
                    setNotificationsEnabled(!notificationsEnabled);
                    toast.success(
                      notificationsEnabled
                        ? "Notifications disabled"
                        : "Notifications enabled"
                    );
                  }}
                />
              </div>

              {/* Sound Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20">
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    Sound Effects
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Play sounds for notifications and actions
                  </p>
                </div>
                <Toggle
                  enabled={soundEnabled}
                  onToggle={() => {
                    setSoundEnabled(!soundEnabled);
                    toast.success(
                      soundEnabled
                        ? "Sound effects disabled"
                        : "Sound effects enabled"
                    );
                  }}
                />
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20">
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    Email Notifications
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Receive important updates via email
                  </p>
                </div>
                <Toggle
                  enabled={emailNotifications}
                  onToggle={() => {
                    setEmailNotifications(!emailNotifications);
                    toast.success(
                      emailNotifications
                        ? "Email notifications disabled"
                        : "Email notifications enabled"
                    );
                  }}
                />
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-8 animate-fade-in-up">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Privacy & Security
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage your privacy settings and security options.
                </p>
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">
                      Two-Factor Authentication
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <Toggle
                  enabled={twoFactorEnabled}
                  onToggle={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    toast.success(
                      twoFactorEnabled ? "2FA disabled" : "2FA enabled"
                    );
                  }}
                />
              </div>

              {/* Data Collection */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <History className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">
                      Data Collection
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Allow anonymous usage data to improve the service
                    </p>
                  </div>
                </div>
                <Toggle
                  enabled={dataCollection}
                  onToggle={() => {
                    setDataCollection(!dataCollection);
                    toast.success(
                      dataCollection
                        ? "Data collection disabled"
                        : "Data collection enabled"
                    );
                  }}
                />
              </div>

              {/* Session Management */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">
                  Active Sessions
                </h4>
                <div className="p-4 rounded-xl border border-border/50 bg-secondary/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                        <Monitor className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          MacBook Pro - Chrome
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Current session
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-500">Active</span>
                  </div>
                  <button
                    onClick={() =>
                      toast.success("All other sessions have been logged out")
                    }
                    className="w-full px-4 py-2 rounded-lg border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
                  >
                    Log out of all other sessions
                  </button>
                </div>
              </div>

              {/* Download Data */}
              <div className="p-4 rounded-xl border border-border/50 bg-secondary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Download className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        Download Your Data
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Get a copy of all your data
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      toast.success(
                        "Data export started. You'll receive an email when ready."
                      )
                    }
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Export
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Shortcuts Tab */}
          {activeTab === "shortcuts" && (
            <div className="space-y-8 animate-fade-in-up">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Keyboard Shortcuts
                </h3>
                <p className="text-sm text-muted-foreground">
                  Quick keyboard shortcuts to navigate the app efficiently.
                </p>
              </div>

              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {shortcut.action}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 rounded-lg bg-background border border-border/50 text-xs font-mono text-muted-foreground"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Language Tab */}
          {activeTab === "language" && (
            <div className="space-y-8 animate-fade-in-up">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Language
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred language for the interface.
                </p>
              </div>

              <div className="space-y-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.code);
                      toast.success(`Language changed to ${lang.name}`);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                      selectedLanguage === lang.code
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-border hover:bg-secondary/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{lang.flag}</span>
                      <span className="text-sm font-medium text-foreground">
                        {lang.name}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 transition-all duration-200",
                        selectedLanguage === lang.code
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      )}
                    >
                      {selectedLanguage === lang.code && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
