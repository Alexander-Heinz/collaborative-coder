import { useState, useCallback, useRef } from 'react';
import { loadPyodide, PyodideInterface } from 'pyodide';

export interface OutputLine {
  type: 'log' | 'error' | 'warn' | 'info' | 'result';
  content: string;
  timestamp: Date;
}

export interface ExecutionResult {
  outputs: OutputLine[];
  success: boolean;
}

export const useCodeExecution = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store Pyodide instance (lazy-loaded on first Python execution)
  const pyodideRef = useRef<PyodideInterface | null>(null);
  const pyodideLoadingRef = useRef<Promise<PyodideInterface> | null>(null);
  
  // Store JS worker instance
  const jsWorkerRef = useRef<Worker | null>(null);

  // Initialize Pyodide (lazy loading)
  const initPyodide = async (): Promise<PyodideInterface> => {
    // If already loaded, return it
    if (pyodideRef.current) {
      return pyodideRef.current;
    }
    
    // If currently loading, wait for it
    if (pyodideLoadingRef.current) {
      return pyodideLoadingRef.current;
    }
    
    // Start loading
    pyodideLoadingRef.current = loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
    });
    
    pyodideRef.current = await pyodideLoadingRef.current;
    return pyodideRef.current;
  };

  // Execute JavaScript code
  const executeJavaScript = (code: string): Promise<ExecutionResult> => {
    return new Promise((resolve) => {
      // Create worker if it doesn't exist
      if (!jsWorkerRef.current) {
        jsWorkerRef.current = new Worker(
          new URL('../workers/jsExecutor.worker.ts', import.meta.url),
          { type: 'module' }
        );
      }

      const worker = jsWorkerRef.current;

      // Set up response handler
      const handleMessage = (e: MessageEvent) => {
        const { success, logs, result, error: execError } = e.data;
        
        const outputs: OutputLine[] = logs.map((log: any) => ({
          type: log.type,
          content: log.content,
          timestamp: new Date(log.timestamp),
        }));

        if (success) {
          if (result !== undefined) {
            outputs.push({
              type: 'result',
              content: `→ ${result}`,
              timestamp: new Date(),
            });
          }
          resolve({ outputs, success: true });
        } else {
          outputs.push({
            type: 'error',
            content: execError.message,
            timestamp: new Date(),
          });
          if (execError.stack) {
            outputs.push({
              type: 'error',
              content: execError.stack,
              timestamp: new Date(),
            });
          }
          resolve({ outputs, success: false });
        }

        worker.removeEventListener('message', handleMessage);
      };

      worker.addEventListener('message', handleMessage);
      worker.postMessage({ code });
    });
  };

  // Execute Python code
  const executePython = async (code: string): Promise<ExecutionResult> => {
    const outputs: OutputLine[] = [];
    
    try {
      // Initialize Pyodide if not already loaded
      const pyodide = await initPyodide();
      
      // Redirect stdout/stderr
      await pyodide.runPythonAsync(`
import sys
from io import StringIO

# Capture stdout
sys.stdout = StringIO()
sys.stderr = StringIO()
`);

      // Execute the user's code
      const result = await pyodide.runPythonAsync(code);

      // Get captured output
      const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()');
      const stderr = await pyodide.runPythonAsync('sys.stderr.getvalue()');

      // Add stdout as log outputs
      if (stdout) {
        const lines = String(stdout).split('\n').filter(line => line.trim());
        lines.forEach(line => {
          outputs.push({
            type: 'log',
            content: line,
            timestamp: new Date(),
          });
        });
      }

      // Add stderr as error outputs
      if (stderr) {
        const lines = String(stderr).split('\n').filter(line => line.trim());
        lines.forEach(line => {
          outputs.push({
            type: 'error',
            content: line,
            timestamp: new Date(),
          });
        });
      }

      // Add result if exists and is not None
      if (result !== undefined && result !== null) {
        outputs.push({
          type: 'result',
          content: `→ ${result}`,
          timestamp: new Date(),
        });
      }

      return { outputs, success: true };
    } catch (error: any) {
      outputs.push({
        type: 'error',
        content: error.message || String(error),
        timestamp: new Date(),
      });
      return { outputs, success: false };
    }
  };

  // Main execution function
  const executeCode = useCallback(async (
    code: string,
    language: string
  ): Promise<ExecutionResult> => {
    setIsLoading(true);
    setError(null);

    try {
      let result: ExecutionResult;

      if (language === 'javascript') {
        result = await executeJavaScript(code);
      } else if (language === 'python') {
        result = await executePython(code);
      } else {
        // Unsupported language
        result = {
          outputs: [{
            type: 'error',
            content: `Execution not supported for ${language}`,
            timestamp: new Date(),
          }],
          success: false,
        };
      }

      setIsLoading(false);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || String(err);
      setError(errorMessage);
      setIsLoading(false);
      
      return {
        outputs: [{
          type: 'error',
          content: errorMessage,
          timestamp: new Date(),
        }],
        success: false,
      };
    }
  }, []);

  return {
    executeCode,
    isLoading,
    error,
  };
};
