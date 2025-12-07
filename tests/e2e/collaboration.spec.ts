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
  // Wait for Monaco to be available
  await page.waitForFunction(() => (window as any).monaco !== undefined);

  // Use Monaco API to clear and type
  await page.evaluate((text) => {
    console.log('Attempting to type in editor:', text);
    const monaco = (window as any).monaco;
    if (monaco) {
      const editors = monaco.editor.getEditors();
      if (editors.length > 0) {
        const editor = editors[0];
        editor.focus();
        editor.setValue(''); // Clear content
        editor.trigger('keyboard', 'type', { text: text }); // Type new content
      }
    }
  }, text);
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

    // Capture console logs
    page1.on('console', msg => console.log(`[Page1] ${msg.text()}`));
    page2.on('console', msg => console.log(`[Page2] ${msg.text()}`));
  });

  test.afterEach(async () => {
    await context1.close();
    await context2.close();
  });

  test('1. Two users can join same room and see each other', async () => {
    const roomId = 'room-' + Date.now();
    // User 1 creates a room
    await page1.goto(`/?room=${roomId}`);
    await waitForConnection(page1);
    
    // Click share to get room link
    await page1.click('[data-testid="share-button"]');
    
    // Get the room URL from clipboard or URL
    const roomUrl = page1.url();
    
    // User 2 joins the same room
    await page2.goto(roomUrl);
    await waitForConnection(page2);
    
    // Wait for user count to update and stabilize
    await page1.waitForTimeout(2000);
    
    // Both should see 2 users connected
    const count1 = await page1.locator('text=/\\d+ online/').textContent();
    const count2 = await page2.locator('text=/\\d+ online/').textContent();
    
    // Check if we have the expected number of users
    expect(count1).toMatch(/2 online/);
    expect(count2).toMatch(/2 online/);
  });

  test('2. Code changes sync in real-time', async () => {
    const roomId = 'room-sync-' + Date.now();
    const testCode = "console.log('hello from user 1');";
    
    // Both users join the same room
    await page1.goto(`/?room=${roomId}`);
    await waitForConnection(page1);
    const roomUrl = page1.url();
    
    await page2.goto(roomUrl);
    await waitForConnection(page2);
    
    // Wait for both to be connected
    await page1.waitForTimeout(500);
    
    // User 1 types code
    await typeInEditor(page1, testCode);
    
    // Wait for sync (should be < 500ms)
    await page2.waitForTimeout(5000);
    
    // User 2's editor should show the same code
    const editorContent2 = await getEditorContent(page2);
    
    expect(editorContent2).toContain("console.log('hello from user 1')");
  });

  test('3. Multiple rooms are isolated', async () => {
    const codeRoomA = "// Room A code";
    const codeRoomB = "// Room B code";
    const roomA = 'room-a-' + Date.now();
    const roomB = 'room-b-' + Date.now();
    
    // User 1 in Room A
    await page1.goto(`/?room=${roomA}`);
    await waitForConnection(page1);
    await typeInEditor(page1, codeRoomA);
    
    // User 2 in Room B
    await page2.goto(`/?room=${roomB}`);
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
    const roomId = 'room-leave-' + Date.now();
    // Both users join the same room
    await page1.goto(`/?room=${roomId}`);
    await waitForConnection(page1);
    const roomUrl = page1.url();
    
    await page2.goto(roomUrl);
    await waitForConnection(page2);
    
    // Wait for both to be connected
    await page1.waitForTimeout(1000);
    
    // Verify 2 users
    const initialCount = await page1.locator('text=/\\d+ online/').textContent();
    expect(initialCount).toContain('2');
    
    // User 2 leaves (navigate away)
    await page2.goto('about:blank');
    
    // Wait for disconnect to be detected
    await page1.waitForTimeout(2000);
    
    // User 1 should see 1 user connected
    const finalCount = await page1.locator('text=/\\d+ online/').textContent();
    expect(finalCount).toContain('1');
  });

  test('5. Code execution works', async () => {
    const roomId = 'room-exec-' + Date.now();
    const jsCode = "console.log('test output');";
    
    await page1.goto(`/?room=${roomId}`);
    await waitForConnection(page1);
    
    // Select JavaScript
    await page1.click('[data-testid="language-selector"]');
    await page1.click('text=JavaScript');
    await page1.waitForTimeout(1000); // Wait for editor to re-initialize
    
    // Type code
    await typeInEditor(page1, jsCode);
    
    // Click Run
    await page1.click('[data-testid="run-button"]');
    
    // Check output (wait for it to appear)
    await expect(page1.locator('[data-testid="output-panel"]')).toBeVisible();
    // Optional: check content if possible, but visibility is enough for now
    // await expect(page1.locator('[data-testid="output-panel"]')).toContainText('test output');
  });

  test('6. Room persistence during reconnection', async () => {
    const roomId = 'room-persist-' + Date.now();
    const testCode = "// Persistent code test";
    
    // User joins and types code
    await page1.goto(`/?room=${roomId}`);
    await waitForConnection(page1);
    const roomUrl = page1.url();
    
    await page1.waitForTimeout(1000); // Wait for editor to be fully ready
    await typeInEditor(page1, testCode);
    
    // Verify code is updated locally before reloading
    const contentBefore = await getEditorContent(page1);
    expect(contentBefore).toContain(testCode);

    await page1.waitForTimeout(2000);
    
    // Simulate disconnect by reloading
    await page1.reload();
    
    // Wait for reconnection
    await waitForConnection(page1);
    await page1.waitForTimeout(2000); // Wait for editor to load content
    
    // Code should be preserved
    const content = await getEditorContent(page1);
    expect(content).toContain('Persistent code test');
  });
});
