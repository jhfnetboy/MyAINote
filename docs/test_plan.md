# MyAINote Test Plan

This document outlines the step-by-step verification procedures for each major feature branch. Use this to validate features before merging to `main`.

## 🌿 Branch: `feat/text-brain` (Phase 3)
**Focus**: Vector Indexing, Semantic Search, RAG Chat.

### Automated Tests
- [ ] Run Unit Tests: `cargo test --package tauri-nextjs-template --lib`
    - Verifies: `simple_embed`, `VectorStore` serialization.

### Manual Verification
1.  **Clean State**: Stop the app. Delete `~/MyAINote/vectors.json`.
2.  **Indexing**:
    - Start App: `pnpm tauri dev`.
    - Create Note: Create `test_note.md` in `~/MyAINote/notes/` with content: "The capital of France is Paris."
    - Verify Log: Check terminal for "Indexed 1 notes".
3.  **Search**:
    - UI: Go to "Brain" section -> "Search" tab.
    - Query: Type "capital city".
    - Expectation: `test_note.md` appears in results with a high score.
4.  **Chat (RAG)**:
    - UI: Switch to "Chat" tab.
    - Query: "What is the capital of France?"
    - Expectation: Response includes "Paris" and cites `test_note.md`.

---

## 👁️ Branch: `feat/visual-brain` (Phase 4)
**Focus**: OCR, Image Indexing.

### Automated Tests
- [ ] Run Unit Tests: `cargo test`
    - Verifies: `OcrEngine` mock/logic.

### Manual Verification
1.  **Setup**: Ensure you have an image with text (e.g., `screenshot.png` saying "Hello World").
2.  **Image Note**:
    - Create `image_note.md` in `~/MyAINote/notes/`.
    - Content: `![My Screenshot](/absolute/path/to/screenshot.png)`
3.  **Indexing**:
    - Save file.
    - Verify Log: Check terminal for "OCR processed...".
4.  **Search**:
    - UI: Go to "Brain" -> "Search".
    - Query: "Hello World".
    - Expectation: `image_note.md` appears in results (even though the text "Hello World" is NOT in the markdown file itself).

---

## 👂 Branch: `feat/audio-brain` (Phase 5)
**Focus**: Voice Recording, Transcription.

### Automated Tests
- [ ] Run Unit Tests: `cargo test`
    - Verifies: `AudioRecorder` thread safety.

### Manual Verification
1.  **Recording**:
    - UI: Click "Start Recording".
    - Action: Speak "This is a test of the emergency broadcast system."
    - UI: Click "Stop Recording".
2.  **File Check**:
    - Verify `~/MyAINote/audio/recording_YYYYMMDD_....wav` exists.
    - Verify `~/MyAINote/notes/voice_note_....md` exists.
3.  **Transcription Check**:
    - Open the generated `.md` file.
    - Expectation: Content contains the transcribed text (or mock text if using mock model).
4.  **Search**:
    - UI: Search for "emergency broadcast".
    - Expectation: The voice note appears in results.

---

## 🚀 Branch: `main` (Regression / Release)
**Focus**: End-to-End Stability.

### Full Regression Suite
1.  **Build**: Run `pnpm build` and `cargo build --release`.
2.  **Clean Install**: Clear `~/MyAINote/` (backup if needed).
3.  **"Hello World" Flow**:
    - Open App.
    - Enter Name -> Click Greet -> Verify AI response.
4.  **The "Loop"**:
    - Save a text note via Extension (if installed) or manually.
    - Save an image note.
    - Record a voice note.
5.  **The "Brain"**:
    - Search for a term common to all three.
    - Verify all three note types appear.
