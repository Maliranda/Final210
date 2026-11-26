import { createApp } from './app.js';
import { migrate, pool } from './db.js';

const port = Number(process.env.PORT || 8080);

await migrate();

const app = createApp(pool);
const server = app.listen(port, '0.0.0.0', () => {
  console.log(JSON.stringify({
    level: 'info',
    message: 'listening',
    port,
    version: process.env.APP_VERSION || 'dev',
  }));
});

function shutdown(signal) {
  console.log(JSON.stringify({ level: 'info', message: 'shutting down', signal }));
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
