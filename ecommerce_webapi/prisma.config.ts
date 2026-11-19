import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const dbUser = process.env.DB_WRITE_USER || 'ecommerce_admin';
const dbPassword = process.env.DB_WRITE_PASSWORD || 'GeheimesSchreibPasswort123!';
const dbHost = process.env.DB_WRITE_HOST || 'localhost';
const dbPort = process.env.DB_WRITE_PORT || '5433';
const dbName = process.env.DB_WRITE_NAME || 'ecommerce_commands';

const computedPostgresUrl = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=public`;

export default defineConfig({
  datasource: {
    url: computedPostgresUrl,
  },
  migrations: {
    seed: 'npx ts-node src/shared/database/postgres/seed.ts',
  },
});

