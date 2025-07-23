// Add any custom Jest setup here
// For example, if you need to mock certain browser APIs or set up testing libraries
import '@testing-library/jest-dom';

// Load test environment variables
import { config } from 'dotenv';
config({ path: '.env.test' });
