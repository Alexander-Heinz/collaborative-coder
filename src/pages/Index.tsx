import { useState, useCallback } from "react";
import CodeEditor from "@/components/CodeEditor";
import OutputPanel, { OutputLine } from "@/components/OutputPanel";
import Toolbar from "@/components/Toolbar";
import { toast } from "@/hooks/use-toast";

const defaultCode: Record<string, string> = {
  javascript: `// Welcome to CodeSync! 🚀
// Start coding and see the magic happen

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}

// Try editing this code!
console.log("\\nHello from CodeSync! 👋");`,
  python: `# Welcome to CodeSync! 🚀
# Python syntax highlighting demo

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print("Fibonacci sequence:")
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")

# Try editing this code!
print("\\nHello from CodeSync! 👋")`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CodeSync Demo</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      color: #e8e8e8;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: rgba(255,255,255,0.1);
      padding: 2rem;
      border-radius: 1rem;
      backdrop-filter: blur(10px);
    }
    h1 {
      color: #00d9ff;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello, CodeSync! 🚀</h1>
    <p>Edit this HTML and see changes</p>
  </div>
</body>
</html>`,
};

const Index = () => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(defaultCode.javascript);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [connectedUsers] = useState(3); // Mock value

  const handleLanguageChange = useCallback((lang: string) => {
    setLanguage(lang);
    setCode(defaultCode[lang] || "");
    setOutput([]);
  }, []);

  const handleCodeChange = useCallback((value: string | undefined) => {
    setCode(value || "");
  }, []);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setOutput([
      { type: "info", content: `Running ${language}...`, timestamp: new Date() },
    ]);

    // Simulate execution with mock output
    setTimeout(() => {
      const mockOutputs: OutputLine[] = [
        { type: "info", content: `Running ${language}...`, timestamp: new Date() },
      ];

      if (language === "javascript") {
        mockOutputs.push(
          { type: "log", content: "Fibonacci sequence:", timestamp: new Date() },
          { type: "log", content: "F(0) = 0", timestamp: new Date() },
          { type: "log", content: "F(1) = 1", timestamp: new Date() },
          { type: "log", content: "F(2) = 1", timestamp: new Date() },
          { type: "log", content: "F(3) = 2", timestamp: new Date() },
          { type: "log", content: "F(4) = 3", timestamp: new Date() },
          { type: "log", content: "F(5) = 5", timestamp: new Date() },
          { type: "log", content: "F(6) = 8", timestamp: new Date() },
          { type: "log", content: "F(7) = 13", timestamp: new Date() },
          { type: "log", content: "F(8) = 21", timestamp: new Date() },
          { type: "log", content: "F(9) = 34", timestamp: new Date() },
          { type: "log", content: "", timestamp: new Date() },
          { type: "log", content: "Hello from CodeSync! 👋", timestamp: new Date() },
          { type: "result", content: "Execution completed in 12ms", timestamp: new Date() }
        );
      } else if (language === "python") {
        mockOutputs.push(
          { type: "log", content: "Fibonacci sequence:", timestamp: new Date() },
          { type: "log", content: "F(0) = 0", timestamp: new Date() },
          { type: "log", content: "F(1) = 1", timestamp: new Date() },
          { type: "log", content: "F(2) = 1", timestamp: new Date() },
          { type: "log", content: "...", timestamp: new Date() },
          { type: "log", content: "Hello from CodeSync! 👋", timestamp: new Date() },
          { type: "result", content: "Execution completed in 45ms", timestamp: new Date() }
        );
      } else {
        mockOutputs.push(
          { type: "info", content: "HTML rendered successfully", timestamp: new Date() },
          { type: "result", content: "Preview ready", timestamp: new Date() }
        );
      }

      setOutput(mockOutputs);
      setIsRunning(false);
    }, 800);
  }, [language]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Share this link with others to collaborate",
    });
  }, []);

  const handleClearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Toolbar */}
      <Toolbar
        language={language}
        onLanguageChange={handleLanguageChange}
        onRun={handleRun}
        onShare={handleShare}
        connectedUsers={connectedUsers}
        isRunning={isRunning}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* Code Editor - 60% on desktop */}
        <div className="flex-1 lg:w-[60%] p-4 pb-2 lg:pb-4 lg:pr-2 overflow-hidden">
          <CodeEditor
            language={language}
            code={code}
            onChange={handleCodeChange}
          />
        </div>

        {/* Output Panel - 40% on desktop */}
        <div className="h-[40vh] lg:h-auto lg:w-[40%] p-4 pt-2 lg:pt-4 lg:pl-2 overflow-hidden">
          <OutputPanel output={output} onClear={handleClearOutput} />
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-toolbar-bg border-t border-toolbar-border text-xs">
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>Ln 1, Col 1</span>
          <span>{language.charAt(0).toUpperCase() + language.slice(1)}</span>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>UTF-8</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse-glow" />
            Connected
          </span>
        </div>
      </div>
    </div>
  );
};

export default Index;
