# CodeSync - Collaborative Code Editor

**CodeSync** is a modern, real-time collaborative code editor designed for instant peer programming without the hassle of environment setup. Built for speed and simplicity, it allows developers to write, execute, and debug code together in the browser.

## Management Summary

CodeSync solves the friction of remote technical interviews and ad-hoc pair programming sessions.

- **Instant Collaboration**: Real-time synchronization of code edits and cursor positions using WebSocket technology.
- **Zero-Setup Environment**: Run JavaScript and Python code directly in the browser. No local IDE or complex toolchain required.
- **Secure Execution**: Code execution happens in isolated environments (WebWorkers for JS, Pyodide for Python), ensuring security without backend overhead.
- **Professional UX**: A sleek, VS Code-like interface with syntax highlighting, line numbers, and error reporting.

## Technical Overview

This project is a modern full-stack application built with performance and developer experience in mind.

### Tech Stack
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **Editor**: Monaco Editor (the core of VS Code)
- **Real-time**: Socket.io for bi-directional event-based communication
- **Execution**:
    - **JavaScript**: Web Workers
    - **Python**: Pyodide (WASM)
- **Deployment**: Dockerized application (Node:20-alpine) ready for platforms like Render

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd collaborative-coder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

4. **Start the backend server (for collaboration)**
   ```bash
   npm run server
   ```
   The backend runs on port 3001.

### Docker Deployment

To build and run the application using Docker:

```bash
docker build -t codesync .
docker run -p 3001:3001 codesync
```
