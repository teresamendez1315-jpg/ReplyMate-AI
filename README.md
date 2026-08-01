# ReplyMate AI — Setup Guide (Real AI Version)

This version connects ReplyMate AI to real Claude AI, safely. Your API key
never touches the browser — it lives only on Netlify's servers, inside a
small backend function that the app talks to.

## What's in this folder, and why

```
replymate-ai/
├── index.html                          ← the app itself (frontend)
├── netlify/
│   └── functions/
│       └── generate-replies.js         ← the SECURE backend — this is what
│                                          calls the AI, using your key
├── netlify.toml                        ← tells Netlify where to find the function
├── package.json                        ← marks this as a Node project
├── .env.example                        ← template for your local API key
└── .gitignore                          ← makes sure your real key never gets uploaded
```

**The key idea:** `index.html` never contains your API key. When someone
clicks "Generate Replies," the browser sends the pasted message to
`generate-replies.js` — a function running on Netlify's servers — and *that*
function is the only place your key ever exists. This is the standard,
safe way to use an AI API from a website.

---

## Step 1 — Get an Anthropic API key

1. Go to **console.anthropic.com** and sign up or log in.
2. Go to **API Keys** and click **Create Key**.
3. Copy the key somewhere safe (you'll only see it once). It starts with `sk-ant-...`.
4. Add billing details in the console — the API is pay-as-you-go (separate from a claude.ai subscription).

---

## Step 2 — Install the tools you need (one-time)

You need **Node.js** (which includes `npm`) and the **Netlify CLI**.

1. Install Node.js from **nodejs.org** (choose the LTS version). This also installs `npm`.
2. Open a terminal (Terminal on Mac, Command Prompt or PowerShell on Windows) and run:
   ```
   npm install -g netlify-cli
   ```
3. Check it worked:
   ```
   netlify --version
   ```

---

## Step 3 — Set up the project folder

1. Download all the files from this conversation into one folder called `replymate-ai` (keep the folder structure exactly as shown above — the `netlify/functions/generate-replies.js` path matters).
2. Open a terminal, navigate into that folder:
   ```
   cd path/to/replymate-ai
   ```

---

## Step 4 — Add your API key for local testing

1. In the `replymate-ai` folder, make a copy of `.env.example` and rename the copy to `.env`.
2. Open `.env` in any text editor and replace the placeholder with your real key:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-real-key-here
   ```
3. Save the file. **Never share this file or upload it to GitHub** — the included `.gitignore` already protects you from doing this by accident.

---

## Step 5 — Test it on your own computer

1. In the terminal, from inside the `replymate-ai` folder, run:
   ```
   netlify dev
   ```
2. This starts a local server (usually at `http://localhost:8888`) that runs both the website *and* the backend function together, exactly like it will work online.
3. Open that address in your browser.
4. Click **Launch Dashboard** → **Reply Generator**, paste a real comment, pick a message type and tone, and click **Generate Replies**.
5. You should see a loading message, then 3 real AI-written replies that actually respond to what you pasted.

**If something goes wrong:** check the terminal window — it will print an error message. The most common issue is a missing or incorrect key in `.env`.

---

## Step 6 — Publish it online

The simplest path is connecting the folder to Netlify through GitHub:

1. Create a free account at **github.com** if you don't have one.
2. Create a new repository (e.g. `replymate-ai`) and upload your project folder to it — you can drag and drop files on GitHub's website, or use `git` if you're comfortable with it. (Your `.env` file will **not** upload, because `.gitignore` excludes it — that's intentional.)
3. Go to **app.netlify.com** and log in (or sign up free).
4. Click **Add new site → Import an existing project**.
5. Choose **GitHub** and select your `replymate-ai` repository.
6. Leave the build settings as-is (there's no build step — this is a static site with functions) and click **Deploy**.
7. Once it deploys, go to **Site configuration → Environment variables** in the Netlify dashboard.
8. Click **Add a variable**, set:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your real key (the same one from Step 4)
9. Go to **Deploys** and click **Trigger deploy → Deploy site** so the new environment variable takes effect.
10. Netlify gives you a live URL (like `yourname-replymate.netlify.app`) — open it and test the same way you did locally.

Your API key now lives safely inside Netlify's servers — it's never downloaded to anyone's browser, never visible in your site's source code, and never in your GitHub repository.

---

## What this version does and doesn't include

**Included and fully working:**
- Real AI-generated replies tailored to the exact pasted message, tone, and message type
- All 5 tones and all 8 message types
- Loading state while the AI is thinking
- Clear error messages if the request fails (bad key, network issue, AI service hiccup)
- Generate button disables itself while processing
- Copy and Save buttons, dashboard stats, dark/light mode — all unchanged

**Not included yet (by design, per your instructions):**
- Stripe / real payments — the Pro and Business buttons still show a placeholder message
- A real free-tier limit enforced on the server (the "5 free replies" counter is still tracked in the browser, so a user could reset it by refreshing — server-side enforcement is a next-version upgrade once you're ready to add real accounts)

---

## Quick troubleshooting

| Problem | Likely cause |
|---|---|
| "The server is missing its AI API key" | `.env` (local) or the Netlify environment variable (online) isn't set correctly |
| Replies never load, error appears | Check your Anthropic account has billing enabled and the key is correct |
| Works locally but not after publishing | You likely forgot Step 6.7–6.9 (adding the key in Netlify and redeploying) |
| "Method not allowed" error | Usually means the function file isn't in the exact path `netlify/functions/generate-replies.js` |
