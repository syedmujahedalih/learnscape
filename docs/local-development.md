# Run Learnscape locally

## Quick start

```bash
git clone https://github.com/syedmujahedalih/learnscape.git
cd learnscape
npm install
cp .env.example .env.local
npm run dev
```

Open the local URL printed by the terminal. The default development server is normally available on a localhost address.

For a production-like local run:

```bash
npm run build
npm run start
```

## Local llama.cpp

Start an OpenAI-compatible llama.cpp server, then configure the local address and model name in `.env.local`:

```dotenv
LLAMA_BASE_URL=http://127.0.0.1:8080/v1
LLAMA_MODEL=Qwen3-14B-Q4_K_M.gguf
```

Open Learnscape at its local URL and choose **Local** in Connections or the source mapper.

`127.0.0.1` works only when Learnscape and llama.cpp are reachable from the same local environment. The deployed Learnscape site cannot access a server running only on your Mac. For a remote demo, use GPT, the deterministic replay, or expose the model through an authenticated HTTPS tunnel that you control.

## GPT source analysis

Set these only on your local server environment:

```dotenv
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-terra
```

Do not commit `.env.local` or publish an API key in client-side code. Page-image analysis uses GPT vision; pasted text can use either GPT or llama.cpp.
