import { fileURLToPath } from 'node:url';
import { openRepository } from './database.js';
import { createApp } from './app.js';
const repo = openRepository(
  process.env.DATABASE_PATH ??
    fileURLToPath(new URL('../data/client-register.sqlite', import.meta.url)),
);
const server = createApp(repo);
server.listen(Number(process.env.PORT ?? 3000), '127.0.0.1', () =>
  console.log('API local disponible en http://127.0.0.1:3000'),
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () =>
    server.close(() => {
      repo.close();
      process.exit(0);
    }),
  );
