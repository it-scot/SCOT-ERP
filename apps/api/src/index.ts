// ============================================================
// SCoT ERP — API Server Entry Point
// ============================================================
import { app } from './app.js';
import { config } from './config.js';
import { initializeDataStore } from './repositories/index.js';

async function main() {
  console.log('🎓 SCoT ERP API Server starting...');
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Auth mode: ${config.auth.mode}`);
  console.log(`   Data provider: ${config.data.provider}`);
  console.log(`   File storage: ${config.files.storage}`);
  console.log(`   Mailer: ${config.mailer.provider}`);
  console.log(`   Calendar: ${config.calendar.provider}`);

  // Initialize data store (loads mock data from disk)
  await initializeDataStore();

  app.listen(config.port, () => {
    console.log(`\n🚀 API server running on http://localhost:${config.port}`);
    console.log(`   Health check: http://localhost:${config.port}/api/health`);
    if (config.auth.mode === 'dev') {
      console.log('\n   📋 DEV MODE: No password required. Use any seeded email to login.');
    }
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
