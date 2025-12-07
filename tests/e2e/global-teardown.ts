import { test as teardown } from '@playwright/test';

// Global teardown that runs after all tests
teardown('cleanup', async () => {
  console.log('✓ Test cleanup complete');
});
