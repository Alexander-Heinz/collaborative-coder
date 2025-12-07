import { Terminal, Trash2 } from "lucide-react";

interface OutputLine {
  type: "log" | "error" | "info" | "result";
  content: string;
  timestamp: Date;
}

interface OutputPanelProps {
  output: OutputLine[];
  onClear: () => void;
}

const OutputPanel = ({ output, onClear }: OutputPanelProps) => {
  const getLineStyle = (type: OutputLine["type"]) => {
    switch (type) {
      case "error":
        return "text-destructive";
      case "info":
        return "text-primary";
      case "result":
        return "text-success";
      default:
        return "text-foreground";
    }
  };

  const getPrefix = (type: OutputLine["type"]) => {
    switch (type) {
      case "error":
        return "✕";
      case "info":
        return "ℹ";
      case "result":
        return "→";
      default:
        return "›";
    }
  };

  return (
    <div className="h-full flex flex-col bg-output-bg rounded-lg border border-border/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-toolbar-bg">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Console</span>
        </div>
        <button
          onClick={onClear}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-smooth"
          title="Clear console"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Output Area */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {output.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-center">
              Run your code to see output here
              <br />
              <span className="text-xs opacity-70">Press Ctrl+Enter or click Run</span>
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {output.map((line, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 animate-slide-in ${getLineStyle(line.type)}`}
              >
                <span className="opacity-50 select-none">{getPrefix(line.type)}</span>
                <span className="whitespace-pre-wrap break-all">{line.content}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
export type { OutputLine };
