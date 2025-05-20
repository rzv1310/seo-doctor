// Load environment variables only in Node.js environment (not Edge Runtime)
import { config } from 'dotenv';

// Only load environment variables if we're in a Node.js environment
// This check helps distinguish Node.js from Edge Runtime
if (typeof window === 'undefined' && typeof process !== 'undefined' && process.versions && process.versions.node) {
  config();
}