import { config } from 'dotenv';
import { resolve } from 'node:path';
import { defineConfig } from 'prisma/config';

config({ path: resolve(__dirname, '.env') });
config({ path: resolve(__dirname, '../../.env') });
process.env.PRISMA_HIDE_UPDATE_MESSAGE ||= '1';
process.env.DIRECT_URL ||= process.env.DATABASE_URL?.replace('-pooler.', '.');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
});
