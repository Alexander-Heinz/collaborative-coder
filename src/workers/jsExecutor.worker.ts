/**
 * JavaScript Execution Web Worker
 * Executes JavaScript code in an isolated worker context
 */

// Override console methods to capture output
const logs: Array<{ type: string; content: string; timestamp: Date }> = [];

const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
};

console.log = (...args: any[]) => {
  logs.push({
    type: 'log',
    content: args.map(arg => String(arg)).join(' '),
    timestamp: new Date(),
  });
  originalConsole.log(...args);
};

console.error = (...args: any[]) => {
  logs.push({
    type: 'error',
    content: args.map(arg => String(arg)).join(' '),
    timestamp: new Date(),
  });
  originalConsole.error(...args);
};

console.warn = (...args: any[]) => {
  logs.push({
    type: 'warn',
    content: args.map(arg => String(arg)).join(' '),
    timestamp: new Date(),
  });
  originalConsole.warn(...args);
};

console.info = (...args: any[]) => {
  logs.push({
    type: 'info',
    content: args.map(arg => String(arg)).join(' '),
    timestamp: new Date(),
  });
  originalConsole.info(...args);
};

self.onmessage = (e: MessageEvent) => {
  const { code } = e.data;
  
  // Clear previous logs
  logs.length = 0;
  
  try {
    // Execute the code
    // Wrap code in IIFE and return to capture last expression value
    // This mimics eval behavior where the last expression is returned
    const wrappedCode = `
      return (function() {
        ${code}
      })();
    `;
    const fn = new Function(wrappedCode);
    const result = fn();
    
    // Send back logs and result
    self.postMessage({
      success: true,
      logs,
      result: result !== undefined ? String(result) : undefined,
    });
  } catch (error: any) {
    // Send back error
    self.postMessage({
      success: false,
      logs,
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
  }
};
