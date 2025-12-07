import { test as setup } from '@playwright/test';

// Global setup that runs before all tests
setup('verify servers are running', async ({ request }) => {
  // Check backend health
  const backendHealth = await request.get('http://localhost:3001/api/health');
  if (!backendHealth.ok()) {
    throw new Error('Backend server is not running. Start it with: cd server && npm start');
  }
  
  // Check frontend
  const frontendHealth = await request.get('http://localhost:8080');
  if (!frontendHealth.ok()) {
    throw new Error('Frontend server is not running. Start it with: npm run dev');
  }
  
  console.log('✓ Both servers are running');
});
