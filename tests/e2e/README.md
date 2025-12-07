# CodeSync E2E Tests

End-to-end tests for the collaborative code editor using Playwright.

## Prerequisites

```bash
# Install Playwright and browsers
npx playwright install
```

## Running Tests

```bash
# Run all tests headless
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run specific test file
npx playwright test collaboration.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

## Test Structure

```
tests/e2e/
├── collaboration.spec.ts  # Multi-user collaboration tests
├── ui.spec.ts             # Single-user UI tests
├── global-setup.ts        # Verify servers before tests
└── global-teardown.ts     # Cleanup after tests
```

## Test Scenarios

### Collaboration Tests
1. Two users join same room and see each other
2. Code changes sync in real-time (<500ms)
3. Multiple rooms are isolated
4. User leaves, count updates
5. Code execution works
6. Room persistence during reconnection

### UI Tests
- Homepage loads correctly
- Language selector works
- Run button executes code
- Share button copies link
- Output panel can be cleared
- Responsive layout on mobile
- Status bar shows connection
- User count displays correctly

## Required Data Attributes

Add these to your components for tests to work:

```tsx
// Toolbar.tsx
<button data-testid="run-button">Run</button>
<button data-testid="share-button">Share</button>
<div data-testid="language-selector">...</div>
<span data-testid="user-count">{count}</span>

// OutputPanel.tsx
<div data-testid="output-panel">...</div>
<button data-testid="clear-output">Clear</button>
```

## CI Configuration

For GitHub Actions, add to `.github/workflows/test.yml`:

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: cd server && npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```
