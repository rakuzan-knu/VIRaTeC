import { config } from 'dotenv';
import { resolve } from 'node:path';
import { defineConfig } from 'prisma/config';

// Match Nest's local environment lookup; deployed environment variables win.
config({ path: resolve(__dirname, '.env') });
config({ path: resolve(__dirname, '../../.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
});
