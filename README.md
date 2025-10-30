# Art Vista Studio

High-touch atelier experience built with Vite + React, Supabase, and TanStack Query. This document consolidates the core project workflows so the team can develop, test, and ship confidently.

## Project Links

- **Lovable project**: https://lovable.dev/projects/5179fc2c-48d3-4a68-b929-8203d8db7572

## Local Development

Ensure you have a recent LTS build of Node.js (>= 20) and npm installed. We recommend [installing via nvm](https://github.com/nvm-sh/nvm#installing-and-updating) to match the CI/runtime quickly.

```bash
git clone <YOUR_GIT_URL>
cd art-vista-studio

# Install dependencies. Some corporate environments may require
# configuring a private npm proxy for the Testing Library packages.
npm install

# Start the Vite dev server with hot module reloading.
npm run dev
```

If your network blocks direct access to the npm registry, set the appropriate proxy/registry before installation (for example `npm config set registry <YOUR_PROXY_REGISTRY>`). Once dependencies are resolved the generated `package-lock.json` should be committed so subsequent installs are reproducible.

## Environment Configuration

The booking system relies on Supabase. Create a project in Supabase and run the SQL migrations in [`supabase/migrations`](./supabase/migrations) to provision tables, views, and seed data. Supply the public credentials through a `.env` file (Vite loads them at build time):

```bash
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
```

Restart the dev server whenever environment variables change. Regenerate the generated types after altering the schema using the Supabase CLI:

```bash
supabase gen types typescript --project-id <project-ref> --schema public > src/integrations/supabase/types.ts
```

## Testing & Quality

The project uses Vitest and Testing Library. Run the full unit/integration suite locally once the dependencies are installed:

```bash
npm run test
```

Vitest uses a JSDOM test environment with Jest-DOM assertions (`src/setupTests.ts`). Component tests mock Supabase RPC calls to exercise the full booking funnel. For focused iterations you can launch the watcher:

```bash
npm run test:watch
```

Static analysis runs through ESLint + TypeScript:

```bash
npm run lint
```

The production bundle is generated via Vite:

```bash
npm run build
```

## Deployment

You can publish the latest build directly from [Lovable](https://lovable.dev/projects/5179fc2c-48d3-4a68-b929-8203d8db7572) by navigating to **Share → Publish**. For custom domain configuration follow [Lovable's documentation](https://docs.lovable.dev/features/custom-domain#custom-domain).
