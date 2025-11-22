# MyAINote Technical Solution (2025 Edition)

[English Version](#english-version) | [中文版 (Chinese Version)](#中文版-chinese-version)

---

<a id="english-version"></a>

## 1. Architecture Overview: Tauri + Rust + Browser Extension

### Cross-Platform Feasibility (Tauri v2)
**Conclusion:** **Highly Feasible.**
As of late 2025, Tauri v2 is stable and production-ready for mobile (iOS & Android). It allows sharing the core Rust backend and Frontend (Next.js) across Desktop and Mobile.

*   **Core**: Rust (Tauri main process). Handles system tray, file system, window management, and high-performance logic.
*   **Frontend**: Next.js + React + TailwindCSS (Shared UI).
*   **Mobile**: Tauri v2 compiles to native iOS/Android libs, wrapping the webview.
*   **Browser Extension**:
    *   **Role**: Replaces the Node.js sidecar for scraping. The user installs a Chrome Extension that connects to the local Tauri app.
    *   **Benefit**: Uses the user's **existing Chrome profile** (cookies, sessions). No need to re-login to sites like Xiaohongshu.
    *   **Privacy**: All data stays local. The extension sends content *only* to the local Tauri server (localhost).

### Architecture Diagram
```mermaid
graph TD
    UI[Frontend (Next.js/React)] <-->|IPC| Rust[Rust Core (Tauri)]
    Rust <-->|FS| LocalDB[(LanceDB / SQLite)]
    Rust <-->|Localhost API| Ext[Browser Extension]
    Rust <-->|FFI/Binding| AI[Local AI Engine]
    
    subgraph "User Browser"
    Ext -->|Read DOM| Page[Active Web Page]
    end

    subgraph "AI Engine"
    AI -->|Inference| Model[Gemma / Llama]
    end
```

## 2. Feature Implementation Strategy

### URL Scraping & Content Extraction
*   **Primary (Browser Extension)**: The extension injects a content script to extract the main article content (using `readability.js` inside the browser).
*   **Workflow**:
    1. User browses to a page (e.g., Xiaohongshu post).
    2. Clicks "Save to MyAINote" extension button.
    3. Extension extracts HTML/Images and POSTs to `http://localhost:port/save`.
    4. Rust backend receives data, converts to Markdown, and saves locally.
*   **Markdown Generation**: Performed by the Rust backend (`html2md`) after receiving the raw HTML.

### Image Preservation & Recognition (OCR)
*   **Storage**: Save images locally in a hashed assets directory (`assets/images/{hash}.jpg`) to avoid duplicates.
*   **OCR/Recognition**:
    *   **Desktop**: Use `tesseract-rs` (Rust bindings) or platform native APIs (Apple Vision on macOS).
    *   **Mobile**: Use native plugins (Tauri plugin system) to access iOS/Android native OCR APIs (Live Text on iOS, ML Kit on Android) for zero-overhead offline OCR.

### Keyword Extraction & Auto-Tagging
*   **Approach**: Use a small, fast local model (e.g., **BERT** or quantized **Gemma 2B**) running in Rust via `candle` or `ort` (ONNX Runtime).
*   **Workflow**:
    1.  Content extracted.
    2.  Passed to local embedding model.
    3.  Extract key phrases or classify into categories.
    4.  Append YAML frontmatter to the Markdown file.

## 3. Personal Knowledge Base (PKB) & RAG

### Storage & Indexing
For a *personal* knowledge base in 2025, we need a solution that is **local-first**, **fast**, and **embedded** (no heavy Docker containers).

*   **Vector Database**: **LanceDB**.
    *   *Why?* It's written in Rust, embedded (runs in-process), extremely fast, and handles vector search + raw data storage. Perfect for Tauri.
    *   *Alternative*: **SurrealDB** (embedded mode) if graph relationships are needed later.
*   **Indexing Pipeline**:
    *   Watch file changes (Rust `notify` crate).
    *   Chunk Markdown files (Rust `text-splitter`).
    *   Generate embeddings (Rust `candle` with `all-MiniLM-L6-v2` or similar small model).
    *   Store in LanceDB.

### RAG (Retrieval-Augmented Generation)
*   **Query**: User asks a question.
*   **Retrieval**: Search LanceDB for top-k relevant chunks.
*   **Generation**: Feed chunks + query to the Local LLM (Gemma).

## 4. AI Model Strategy (2025 Context)

### Model Selection
*   **Text Generation**: **Google Gemma 3 (or latest 2/3 variant)**.
    *   *Size*: 2B or 4B quantized (Int4/Int8).
    *   *Why?* Optimized for consumer hardware, open weights, high quality/size ratio.
*   **Vision**: **Llava** or **Gemma Vision** variants for "Chat with Image".

### Inference Engine
*   **Desktop (Mac/Windows/Linux)**:
    *   **Rust Native**: Use **`candle`** (Hugging Face) or **`burn`**. These provide pure Rust inference, easy to bundle with Tauri.
    *   **GPU Acceleration**: Metal (Mac), CUDA (Windows/Linux) supported by `candle`.
*   **Mobile (iOS/Android)**:
    *   **Google MediaPipe LLM Inference**: The official, highly optimized path for Gemma on mobile. Access via Tauri Plugin (write a small Swift/Kotlin wrapper to expose it to Rust/JS).
    *   *Alternative*: **MLC-LLM** if more control is needed.

## 5. Summary of Tech Stack

| Component | Technology | Notes |
| :--- | :--- | :--- |
| **App Framework** | **Tauri v2** | Stable mobile support. |
| **Frontend** | **Next.js + React** | Existing stack. |
| **Backend Logic** | **Rust** | Performance, System integration. |
| **Complex Scraping** | **Node.js (Sidecar)** | Puppeteer for dynamic sites. |
| **Vector DB** | **LanceDB** | Embedded, Rust-native, zero-config. |
| **AI Inference** | **Candle (Desktop) / MediaPipe (Mobile)** | Best performance per platform. |
| **LLM** | **Gemma 2/3 (2B/4B)** | State-of-the-art small model. |

## 6. Privacy & Security (Local Only)
*   **Zero Data Leakage**: All data (notes, images, vector indices) is stored on the local filesystem.
*   **No Cloud Sync (Default)**: Syncing is optional and managed by the user (e.g., via iCloud Drive folder or Syncthing), not by our servers.
*   **Local AI**: All inference runs on the device. No API keys sent to OpenAI/Google unless explicitly configured by the user.

## 7. Performance Evaluation (Gemma Model)

| Hardware Tier | Recommended Model | Expected Performance | Notes |
| :--- | :--- | :--- | :--- |
| **High-End** (Mac M1/M2/M3, RTX 3060+) | **Gemma 2 9B (Q4/Q8)** | > 50 tokens/s | Full capability, complex reasoning. |
| **Mid-Range** (Intel i7, older GPU) | **Gemma 2 2B (Q8)** | 20-40 tokens/s | Fast, good for summarization. |
| **Low-End / Mobile** (Older Phones) | **Gemma 2 2B (Q4)** | 10-20 tokens/s | Usable for basic tasks. |

*   **Self-Check Tool**: The app will include a built-in benchmark on startup to recommend the best model size for the current device.

---

<a id="中文版-chinese-version"></a>

# MyAINote 技术方案 (2025版)

## 1. 架构概览: Tauri + Rust + 浏览器插件 (Browser Extension)

### 跨平台可行性 (Tauri v2)
**结论:** **完全可行 (Highly Feasible)。**
截至 2025 年底，Tauri v2 已经稳定并可用于移动端生产环境 (iOS & Android)。它允许在桌面和移动端之间共享核心 Rust 后端和前端 (Next.js) 代码。

*   **核心层 (Core)**: Rust (Tauri 主进程)。处理系统托盘、文件系统、窗口管理和高性能逻辑。
*   **前端 (Frontend)**: Next.js + React + TailwindCSS (共享 UI)。
*   **移动端 (Mobile)**: Tauri v2 编译为原生 iOS/Android 库，封装 WebView。
*   **浏览器插件 (Browser Extension)**:
    *   **角色**: 替代 Node.js Sidecar 进行抓取。用户安装 Chrome 插件，连接到本地 Tauri 应用。
    *   **优势**: 使用用户 **现有的 Chrome 配置文件** (Cookie, 会话)。无需重新登录小红书等网站。
    *   **隐私**: 所有数据保留在本地。插件仅将内容发送到本地 Tauri 服务器 (localhost)。

### 架构图
```mermaid
graph TD
    UI[前端 (Next.js/React)] <-->|IPC| Rust[Rust 核心 (Tauri)]
    Rust <-->|FS| LocalDB[(LanceDB / SQLite)]
    Rust <-->|Localhost API| Ext[浏览器插件]
    Rust <-->|FFI/Binding| AI[本地 AI 引擎]
    
    subgraph "用户浏览器"
    Ext -->|读取 DOM| Page[当前网页]
    end

    subgraph "AI 引擎"
    AI -->|推理| Model[Gemma / Llama]
    end
```

## 2. 功能实现策略

### URL 抓取与内容提取
*   **主要方案 (浏览器插件)**: 插件注入内容脚本以提取主要文章内容 (在浏览器内部使用 `readability.js`)。
*   **工作流**:
    1. 用户浏览网页 (例如：小红书帖子)。
    2. 点击 "Save to MyAINote" 插件按钮。
    3. 插件提取 HTML/图片 并 POST 到 `http://localhost:port/save`。
    4. Rust 后端接收数据，转换为 Markdown，并本地保存。
*   **Markdown 生成**: 由 Rust 后端在接收到原始 HTML 后执行 (`html2md`)。

### 图片保存与识别 (OCR)
*   **存储**: 将图片本地保存到哈希资产目录 (`assets/images/{hash}.jpg`) 以避免重复。
*   **OCR/识别**:
    *   **桌面端**: 使用 `tesseract-rs` (Rust 绑定) 或平台原生 API (macOS 上的 Apple Vision)。
    *   **移动端**: 使用原生插件 (Tauri 插件系统) 访问 iOS/Android 原生 OCR API (iOS 的 Live Text, Android 的 ML Kit)，实现零开销的离线 OCR。

### 关键词提取与自动标签
*   **方法**: 使用运行在 Rust 中的小型、快速本地模型 (例如 **BERT** 或量化的 **Gemma 2B**)，通过 `candle` 或 `ort` (ONNX Runtime) 调用。
*   **工作流**:
    1.  内容被提取。
    2.  传递给本地嵌入模型 (Embedding Model)。
    3.  提取关键短语或分类到类别。
    4.  将 YAML frontmatter (元数据) 追加到 Markdown 文件头部。

## 3. 个人知识库 (PKB) & RAG

### 存储与索引
对于 2025 年的 *个人* 知识库，我们需要一个 **本地优先 (local-first)**、**快速** 且 **嵌入式 (embedded)** 的解决方案 (无需繁重的 Docker 容器)。

*   **向量数据库**: **LanceDB**。
    *   *原因*: 它是用 Rust 编写的，嵌入式的 (进程内运行)，速度极快，并且可以处理向量搜索 + 原始数据存储。非常适合 Tauri。
    *   *替代方案*: **SurrealDB** (嵌入模式)，如果后续需要图关系功能。
*   **索引流程**:
    *   监听文件变更 (Rust `notify` crate)。
    *   对 Markdown 文件进行分块 (Rust `text-splitter`)。
    *   生成嵌入向量 (Rust `candle` 配合 `all-MiniLM-L6-v2` 或类似小模型)。
    *   存储到 LanceDB。

### RAG (检索增强生成)
*   **查询**: 用户提出问题。
*   **检索**: 在 LanceDB 中搜索前 k 个相关块 (Chunks)。
*   **生成**: 将相关块 + 查询输入给本地 LLM (Gemma)。

## 4. AI 模型策略 (2025 背景)

### 模型选择
*   **文本生成**: **Google Gemma 3 (或最新的 2/3 变体)**。
    *   *大小*: 2B 或 4B 量化版 (Int4/Int8)。
    *   *原因*: 针对消费级硬件优化，权重开源，高质量/体积比。
*   **视觉**: **Llava** 或 **Gemma Vision** 变体，用于 "与图片对话"。

### 推理引擎
*   **桌面端 (Mac/Windows/Linux)**:
    *   **Rust 原生**: 使用 **`candle`** (Hugging Face) 或 **`burn`**。这些提供纯 Rust 推理，易于与 Tauri 打包。
    *   **GPU 加速**: `candle` 支持 Metal (Mac) 和 CUDA (Windows/Linux)。
*   **移动端 (iOS/Android)**:
    *   **Google MediaPipe LLM Inference**: 移动端运行 Gemma 的官方、高度优化路径。通过 Tauri 插件访问 (编写少量 Swift/Kotlin 包装器将其暴露给 Rust/JS)。
    *   *替代方案*: **MLC-LLM**，如果需要更多控制权。

## 5. 技术栈总结

| 组件 | 技术 | 备注 |
| :--- | :--- | :--- |
| **应用框架** | **Tauri v2** | 稳定的移动端支持。 |
| **前端** | **Next.js + React** | 现有技术栈。 |
| **后端逻辑** | **Rust** | 高性能，系统集成。 |
| **复杂抓取** | **浏览器插件 (Browser Extension)** | 使用用户会话，隐私安全。 |
| **向量数据库** | **LanceDB** | 嵌入式，Rust 原生，零配置。 |
| **AI 推理** | **Candle (桌面) / MediaPipe (移动)** | 各平台最佳性能。 |
| **LLM** | **Gemma 2/3 (2B/4B)** | 最先进的小型模型。 |

## 6. 隐私与安全 (仅限本地)
*   **零数据泄露**: 所有数据 (笔记、图片、向量索引) 均存储在本地文件系统中。
*   **无云端同步 (默认)**: 同步是可选的，由用户管理 (例如：通过 iCloud Drive 文件夹或 Syncthing)，而不是通过我们的服务器。
*   **本地 AI**: 所有推理都在设备上运行。除非用户明确配置，否则不会将 API 密钥发送到 OpenAI/Google。

## 7. 性能评估 (Gemma 模型)

| 硬件层级 | 推荐模型 | 预期性能 | 备注 |
| :--- | :--- | :--- | :--- |
| **高端** (Mac M1/M2/M3, RTX 3060+) | **Gemma 2 9B (Q4/Q8)** | > 50 tokens/s | 全功能，复杂推理。 |
| **中端** (Intel i7, 旧款 GPU) | **Gemma 2 2B (Q8)** | 20-40 tokens/s | 快速，适合摘要。 |
| **低端 / 移动端** (旧手机) | **Gemma 2 2B (Q4)** | 10-20 tokens/s | 基本任务可用。 |

*   **自检工具**: 应用将在启动时包含内置基准测试，以推荐适合当前设备的最佳模型大小。




