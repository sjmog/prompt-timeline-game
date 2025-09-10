### The Prompt Time Machine

Watch AI evolve before your eyes. Enter any creative prompt and this app generates responses as if written by models from different years (e.g., GPT‑2 → GPT‑5). Then play a drag‑and‑drop game to order the outputs chronologically, see your score, and share your results.

### Features
- Generate model outputs for a given prompt across multiple years in parallel
- Drag‑and‑drop timeline game with keyboard support
- Animated UI and extra-special celebratory confetti on high accuracy
- One‑click share of results to X

### Tech
- **Next.js (App Router)**: `https://github.com/vercel/next.js`
- **React**: `https://github.com/facebook/react`
- **Tailwind CSS v4**: `https://github.com/tailwindlabs/tailwindcss`
- **Framer Motion**: `https://github.com/framer/motion`
- **dnd-kit**: `https://github.com/clauderic/dnd-kit`
- **HuggingFace Inference**: `https://github.com/huggingface/huggingface.js`
- **OpenRouter** (multi‑model gateway): `https://github.com/openrouter-ai/openrouter-js` (API: `https://openrouter.ai/docs`)

### How it works
- The page at `app/page.tsx` coordinates three sequenced views: `PromptInput` where users enter a prompt, `TimelineGame` where they have to rearrange them in order of the AI that responded to their prompt, and `ResultsShare` where they can see their results, score, and share the mini-app.
- The API route at `app/api/generate/route.ts` iterates over `MODEL_CONFIGS` (`data/index.ts`) and calls either HuggingFace or OpenRouter via `lib/huggingface.ts` and `lib/openrouter.ts` to generate the LLM responses. You can use a wide variety of LLMs in parallel here.

### Prerequisites
- Node.js 18+ and npm
- API keys:
  - `HUGGINGFACE_API_KEY` (required for HuggingFace)
  - `OPENROUTER_API_KEY` (required for OpenRouter)

### Environment
Create a `.env.local` in the project root:
```bash
HUGGINGFACE_API_KEY=your_hf_key
OPENROUTER_API_KEY=your_openrouter_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_TWEET_URL=https://prompt-time-machine.example
```

- `HUGGINGFACE_API_KEY` allows you to run older models (such as GPT-2).
- `OPENROUTER_API_KEY` allows you to run newer models (such as GPT-5).
- `NEXT_PUBLIC_APP_URL` is used in the share URL and sent to OpenRouter for telemetry.
- `NEXT_PUBLIC_TWEET_URL` overrides the `NEXT_PUBLIC_APP_URL` in the share URL in case you want to redirect people who see the tweet somewhere else (such as the homepage of the Future of AI course).

### Install & run
```bash
npm install
npm run dev
# visit http://localhost:3000
```

### Project structure (selected)
- `app/page.tsx`: app flow and state
- `app/api/generate/route.ts`: serverless generation endpoint
- `components/PromptInput.tsx`: prompt entry UI
- `components/TimelineGame.tsx`: drag‑and‑drop ordering game
- `components/ResultsShare.tsx`: score, timeline, and share
- `lib/huggingface.ts`: HuggingFace calls
- `lib/openrouter.ts`: OpenRouter calls
- `data/index.ts`: model/year configuration

### Notes
- The app sanitizes model outputs and provides fallbacks if providers error or rate‑limit.
- HuggingFace can target a hosted endpoint via `url` in `MODEL_CONFIGS`.

### License
MIT
