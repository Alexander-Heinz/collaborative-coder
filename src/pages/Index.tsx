import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CodeEditor from "@/components/CodeEditor";
import OutputPanel, { OutputLine } from "@/components/OutputPanel";
import Toolbar from "@/components/Toolbar";
import { toast } from "@/hooks/use-toast";
import { useSocket } from "@/hooks/useSocket";
import { useCodeExecution } from "@/hooks/useCodeExecution";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const roomId = searchParams.get("room") || "default-room";
  
  const { 
    isConnected, 
    code, 
    language, 
    userCount, 
    updateCode 
  } = useSocket(roomId);

  const { executeCode, isLoading: isExecuting } = useCodeExecution();

  const [output, setOutput] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Update URL with room ID if not present
  useEffect(() => {
    if (!searchParams.get("room")) {
      setSearchParams({ room: "default-room" });
    }
  }, [searchParams, setSearchParams]);

  const handleLanguageChange = useCallback((lang: string) => {
    // For now, we just update the code with a comment about the language change
    // In a real app, we might want to preserve code or switch templates
    updateCode(code, lang);
  }, [code, updateCode]);

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      updateCode(value);
    }
  }, [updateCode]);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setOutput([
      { type: "info", content: `Running ${language}...`, timestamp: new Date() },
    ]);

    try {
      const result = await executeCode(code, language);
      
      // Add initial info message plus execution outputs
      const finalOutput: OutputLine[] = [
        { type: "info", content: `Running ${language}...`, timestamp: new Date() },
        ...result.outputs,
      ];
      
      setOutput(finalOutput);
    } catch (error) {
      setOutput([
        { type: "info", content: `Running ${language}...`, timestamp: new Date() },
        { type: "error", content: String(error), timestamp: new Date() },
      ]);
    } finally {
      setIsRunning(false);
    }
  }, [language, code, executeCode]);

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
        connectedUsers={userCount}
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
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse-glow' : 'bg-destructive'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Index;
