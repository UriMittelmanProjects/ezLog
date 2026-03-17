# ezLog

A mobile-first gym logging app with AI-powered lift parsing.

## Stack

- **React + Vite** — frontend
- **Supabase** — auth & database
- **Gemini 2.0 Flash** — natural language lift parsing

## Local dev

```bash
cp .env.example .env.local
# fill in .env.local with your keys
npm install
npm run dev
```

## Env vars

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_GEMINI_API_KEY` | Google Gemini API key |

## Database setup

Run `supabase/schema.sql` in your Supabase project's SQL editor.
