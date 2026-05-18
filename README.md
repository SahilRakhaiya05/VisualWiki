# VisualWiki

VisualWiki is an infinite AI-generated visual Wikipedia MVP built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, Zustand, an in-memory page store, HydraDB recall hooks, and a backend image API wrapper.

## Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Environment

`.env.local` contains the required keys. HydraDB credentials may be left blank for local demos; the app will continue with empty recall context.

```bash
CHAT_API_BASE_URL=
IMAGE_API_BASE_URL=
IMAGE_API_TIMEOUT_MS=240000
HYDRADB_API_KEY=
HYDRADB_BASE_URL=https://api.hydradb.com
HYDRADB_TENANT_ID=
HYDRADB_TIMEOUT_MS=10000
```

## Notes

The backend calls the chat planner endpoint first, then sends the final prompt to the external image endpoint. If the provider fails or returns an invalid payload, VisualWiki shows a retryable error instead of generating local diagrams.
