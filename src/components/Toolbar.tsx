import { Play, Share2, Users, ChevronDown, Code2 } from "lucide-react";

interface ToolbarProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  onRun: () => void;
  onShare: () => void;
  connectedUsers: number;
  isRunning: boolean;
}

const languages = [
  { id: "javascript", label: "JavaScript", icon: "JS" },
  { id: "python", label: "Python", icon: "PY" },
  { id: "html", label: "HTML", icon: "HTML" },
];

const Toolbar = ({
  language,
  onLanguageChange,
  onRun,
  onShare,
  connectedUsers,
  isRunning,
}: ToolbarProps) => {
  const currentLanguage = languages.find((l) => l.id === language) || languages[0];

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-toolbar-bg border-b border-toolbar-border">
      {/* Left Section - Logo & Language */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary" />
          </div>
          <span className="font-semibold text-foreground hidden sm:block">CodeSync</span>
        </div>

        <div className="h-6 w-px bg-border/50 hidden sm:block" />

        {/* Language Selector */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-smooth">
            <span className="text-xs font-bold text-primary px-1.5 py-0.5 bg-primary/20 rounded">
              {currentLanguage.icon}
            </span>
            <span className="text-sm font-medium text-foreground hidden sm:block">
              {currentLanguage.label}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-40 py-1 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => onLanguageChange(lang.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-smooth ${
                  lang.id === language ? "text-primary bg-secondary/50" : "text-foreground"
                }`}
              >
                <span className="text-xs font-bold text-primary/80 px-1.5 py-0.5 bg-primary/10 rounded">
                  {lang.icon}
                </span>
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center Section - Run Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth shadow-lg shadow-primary/20"
        >
          <Play className={`w-4 h-4 ${isRunning ? "animate-pulse" : ""}`} />
          <span className="hidden sm:inline">{isRunning ? "Running..." : "Run"}</span>
        </button>
      </div>

      {/* Right Section - Share & Users */}
      <div className="flex items-center gap-3">
        {/* Connected Users */}
        <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
          <div className="relative">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full animate-pulse-glow" />
          </div>
          <span className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">{connectedUsers}</span>
            <span className="hidden sm:inline"> online</span>
          </span>
        </div>

        {/* Share Button */}
        <button
          onClick={onShare}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-secondary hover:border-primary/50 transition-smooth"
        >
          <Share2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
