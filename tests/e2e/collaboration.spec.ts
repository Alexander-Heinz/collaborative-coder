import { test, expect, Page, BrowserContext } from '@playwright/test';

// Helper to wait for socket connection
async function waitForConnection(page: Page) {
  await page.waitForSelector('text=Connected', { timeout: 10000 });
}

// Helper to get user count from the page
async function getUserCount(page: Page): Promise<number> {
  const countText = await page.locator('[data-testid="user-count"]').textContent();
  return parseInt(countText || '0', 10);
}

// Helper to type in Monaco editor
async function typeInEditor(page: Page, text: string) {
  const editor = page.locator('.monaco-editor textarea');
  await editor.focus();
  await editor.fill('');
  await page.keyboard.type(text, { delay: 50 });
}

// Helper to get editor content
async function getEditorContent(page: Page): Promise<string> {
  return await page.evaluate(() => {
    const monaco = (window as any).monaco;
    if (monaco) {
      const editors = monaco.editor.getEditors();
      if (editors.length > 0) {
        return editors[0].getValue();
      }
    }
    return '';
  });
}

test.describe('CodeSync Collaboration E2E Tests', () => {
  let context1: BrowserContext;
  let context2: BrowserContext;
  let page1: Page;
  let page2: Page;

  test.beforeEach(async ({ browser }) => {
    // Create two separate browser contexts (like two different users)
    context1 = await browser.newContext();
    context2 = await browser.newContext();
    page1 = await context1.newPage();
    page2 = await context2.newPage();
  });

  test.afterEach(async () => {
    await context1.close();
    await context2.close();
  });

  test('1. Two users can join same room and see each other', async () => {
    // User 1 creates a room
    await page1.goto('/');
    await waitForConnection(page1);
    
    // Click share to get room link
    await page1.click('[data-testid="share-button"]');
    
    // Get the room URL from clipboard or URL
    const roomUrl = page1.url();
    
    // User 2 joins the same room
    await page2.goto(roomUrl);
    await waitForConnection(page2);
    
    // Wait for user count to update
    await page1.waitForTimeout(1000);
    
    // Both should see 2 users connected
    const count1 = await page1.locator('text=/\\d+ online/').textContent();
    const count2 = await page2.locator('text=/\\d+ online/').textContent();
    
    expect(count1).toContain('2');
    expect(count2).toContain('2');
  });

  test('2. Code changes sync in real-time', async () => {
    const testCode = "console.log('hello from user 1');";
    
    // Both users join the same room
    await page1.goto('/');
    await waitForConnection(page1);
    const roomUrl = page1.url();
    
    await page2.goto(roomUrl);
    await waitForConnection(page2);
    
    // Wait for both to be connected
    await page1.waitForTimeout(500);
    
    // User 1 types code
    await typeInEditor(page1, testCode);
    
    // Wait for sync (should be < 500ms)
    await page2.waitForTimeout(500);
    
    // User 2's editor should show the same code
    const editorContent2 = await getEditorContent(page2);
    
    expect(editorContent2).toContain("console.log('hello from user 1')");
  });

  test('3. Multiple rooms are isolated', async () => {
    const codeRoomA = "// Room A code";
    const codeRoomB = "// Room B code";
    
    // User 1 in Room A
    await page1.goto('/?room=test-room-a');
    await waitForConnection(page1);
    await typeInEditor(page1, codeRoomA);
    
    // User 2 in Room B
    await page2.goto('/?room=test-room-b');
    await waitForConnection(page2);
    await typeInEditor(page2, codeRoomB);
    
    // Wait for potential sync
    await page1.waitForTimeout(1000);
    
    // Each room should have its own code
    const contentA = await getEditorContent(page1);
    const contentB = await getEditorContent(page2);
    
    expect(contentA).toContain('Room A');
    expect(contentA).not.toContain('Room B');
    expect(contentB).toContain('Room B');
    expect(contentB).not.toContain('Room A');
  });

  test('4. User leaves, count updates', async () => {
    // Both users join the same room
    await page1.goto('/');
    await waitForConnection(page1);
    const roomUrl = page1.url();
    
    await page2.goto(roomUrl);
    await waitForConnection(page2);
    
    // Wait for both to be connected
    await page1.waitForTimeout(1000);
    
    // Verify 2 users
    const initialCount = await page1.locator('text=/\\d+ online/').textContent();
    expect(initialCount).toContain('2');
    
    // User 2 leaves (close the page)
    await page2.close();
    
    // Wait for disconnect to be detected
    await page1.waitForTimeout(2000);
    
    // User 1 should see 1 user connected
    const finalCount = await page1.locator('text=/\\d+ online/').textContent();
    expect(finalCount).toContain('1');
  });

  test('5. Code execution works', async () => {
    const jsCode = "console.log('test output');";
    
    await page1.goto('/');
    await waitForConnection(page1);
    
    // Select JavaScript
    await page1.click('[data-testid="language-selector"]');
    await page1.click('text=JavaScript');
    
    // Type code
    await typeInEditor(page1, jsCode);
    
    // Click Run
    await page1.click('[data-testid="run-button"]');
    
    // Wait for output
    await page1.waitForTimeout(1000);
    
    // Check output panel contains result
    const output = await page1.locator('[data-testid="output-panel"]').textContent();
    expect(output).toContain('test output');
  });

  test('6. Room persistence during reconnection', async () => {
    const testCode = "// Persistent code test";
    
    // User joins and types code
    await page1.goto('/');
    await waitForConnection(page1);
    const roomUrl = page1.url();
    
    await typeInEditor(page1, testCode);
    await page1.waitForTimeout(500);
    
    // Simulate disconnect by navigating away and back
    await page1.goto('about:blank');
    await page1.waitForTimeout(1000);
    
    // Reconnect to the same room
    await page1.goto(roomUrl);
    await waitForConnection(page1);
    
    // Code should be preserved
    const content = await getEditorContent(page1);
    expect(content).toContain('Persistent code test');
  });
});
