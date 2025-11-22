# MyAINote Development Roadmap

This roadmap follows a **Capability-Driven** progression, ensuring we build a solid core before adding complexity. Each phase corresponds to a dedicated git branch.

**Core Rules:**
*   **One Branch Per Feature**: Do not merge until verified.
*   **Stability First**: Ensure the previous phase is stable before moving to the next.
*   **Tech Stack**: Tauri v2, Rust, Next.js, pnpm, viem, foundry.
*   **Privacy**: No API keys in code. Use `.env`.

---

## Phase 1: Foundation (The Skeleton)
**Branch**: `feat/tauri-foundation`

**Goal**: Establish the "Skeleton" — A running Tauri v2 app with Rust/Frontend communication and basic Local AI.

**Objectives**:
1.  Initialize Tauri v2 project (Next.js + Rust).
2.  Establish IPC (Inter-Process Communication).
3.  **Hello World AI**: Call a local model (Candle) from UI.

**Tasks**:
- [ ] `pnpm create tauri-app` (Tauri v2, Next.js, TS).
- [ ] Configure Monorepo: `apps/app`, `apps/extension`.
- [ ] Implement `greet_with_ai(name: &str)` command in Rust.
- [ ] Frontend UI to invoke Rust command and display AI response.

**DoD**: App launches on macOS. Frontend sends text -> Rust runs Model -> Returns text.

---

## Phase 2: The Text Loop (Capture & Store)
**Branch**: `feat/extension-capture`

**Goal**: The "Text Loop" — Capture content from Chrome and store it locally.

**Objectives**:
1.  Chrome Extension (Manifest V3) with `readability.js`.
2.  Rust Localhost Server (`axum`/`actix`) to receive payloads.
3.  **HTML -> Markdown** conversion.
4.  File System Storage (`notes/`).

**Tasks**:
- [ ] Build Extension: Inject script, extract content, POST to localhost.
- [ ] Build Rust Server: Listen on `localhost:xxxx`, receive JSON.
- [ ] Implement `html2md`: Convert HTML to clean Markdown.
- [ ] Save `.md` files to `~/MyAINote/notes/`.

**DoD**: Click "Save" on a webpage -> Markdown file appears in `notes/` folder.

---

## Phase 3: The Text Brain (Index & Retrieval)
**Branch**: `feat/text-brain`

**Goal**: The "Text Brain" — Make text notes searchable and "chat-able".

**Objectives**:
1.  **LanceDB** Integration (Embedded Vector DB).
2.  **Embedding Pipeline**: Auto-vectorize new notes.
3.  **RAG**: Semantic Search + LLM Answer.

**Tasks**:
- [ ] Integrate `lancedb` & `candle` (Embedding model).
- [ ] File Watcher (`notify`): Watch `notes/` -> Update Index.
- [ ] Implement `search(query)` and `chat(query)` commands.

**DoD**: Ask "What did I save about Rust?" -> App retrieves notes and generates an answer.

---

## Phase 4: The Visual Brain (OCR & VLM)
**Branch**: `feat/visual-brain`

**Goal**: The "Visual Brain" — Understand and index images.

**Objectives**:
1.  **Image Pipeline**: Download, Hash, Deduplicate (`assets/`).
2.  **OCR**: Extract text from images (Tesseract/Apple Vision).
3.  **VLM**: Generate captions for images (e.g., "A diagram of Rust memory").

**Tasks**:
- [ ] Image Downloader & SHA256 Deduplication.
- [ ] Integrate OCR engine.
- [ ] Update Indexer: Add Image OCR + Captions to LanceDB.

**DoD**: Search for text that appears *inside* an image -> App finds the image.

---

## Phase 5: Omni-Capture & Automation (The Limbs)
**Branch**: `feat/omni-capture`

**Goal**: "Omni-Capture" — Collect from anywhere, automate interactions.

**Objectives**:
1.  **Share Sheet**: iOS/Android/macOS System Share Target.
2.  **Batch Crawler**: App-directed automated scraping via Extension.
3.  **Global Shortcuts**: Clipboard capture.

**Tasks**:
- [ ] Register Tauri Mobile Intent Filters (Share).
- [ ] Implement "Task Queue" in App & "Worker" in Extension.
- [ ] Global Hotkey listener.

**DoD**: Share a link from Twitter App (iOS) -> Saved to MyAINote.

---

## Phase 6: Hybrid Intelligence (The Cortex)
**Branch**: `feat/hybrid-intelligence`

**Goal**: "Expert Mode" — Deep reasoning using Cloud APIs or Local Large Models.

**Objectives**:
1.  **Hybrid Router**: Route simple tasks to Local, complex to Expert.
2.  **Cloud Integration**: DeepSeek / Claude API.
3.  **Local Expert**: Support for Llama 3 70B (if hardware allows).

**Tasks**:
- [ ] Implement Router Logic.
- [ ] Add API Key Management (Encrypted).
- [ ] Implement "Deep Chat" UI.

**DoD**: Ask a complex reasoning question -> App uses Expert Model to answer.

---

## Phase 7: Product Experience (The Face)
**Branch**: `feat/product-ui`

**Objectives**:
1.  **UI Polish**: Beautiful, responsive design (Tailwind).
2.  **Settings**: Model management, Paths, I18n.
3.  **Knowledge Graph**: (Optional) Visualizer.

**Tasks**:
- [ ] Refine Note List & Reader View.
- [ ] Implement Settings Page.
- [ ] Add Chinese/English localization.

**DoD**: App looks professional and is user-friendly.

---

## Phase 8: Integration & Stability (The Seal)
**Branch**: `feat/integration-stability`

**Objectives**:
1.  **End-to-End Testing**: Automated flows.
2.  **Performance**: Memory leak checks, Indexing speed.
3.  **Release**: CI/CD pipelines (GitHub Actions).

**Tasks**:
- [ ] Playwright / Tauri Driver tests.
- [ ] Optimize Rust memory usage.
- [ ] Build signed binaries (DMG, APK).

**DoD**: Production Release v1.0.
