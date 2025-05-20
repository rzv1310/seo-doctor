// Import env loader first to ensure environment variables are loaded
import '../utils/env';
import { spawn } from 'child_process';

console.log('🌱 Starting comprehensive data seeding process...');

// Run the data seeding script that handles everything
const seedProcess = spawn('tsx', ['scripts/seed-data.ts'], { stdio: 'inherit' });

seedProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Seeding process exited with code ${code}`);
    process.exit(code ?? 1);
  }

  console.log('✅ All data seeded successfully!');
  process.exit(0);
});