<div align="center">
  <img src="favicon.png" alt="Silver Cat Tools Logo" width="120" style="border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.25);"/>
  <h1>Silver Cat Tools</h1>
  <p><i>A Premium Offline-First Suite of Client-Side Web Utilities</i></p>

  <!-- Badges -->
  <p>
    <a href="https://github.com/namtiennguyen97/silvercat_tools/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge&logo=opensourceinitiative&logoColor=white" alt="MIT License"/></a>
    <img src="https://img.shields.io/badge/Platform-Static%20HTML-orange?style=for-the-badge&logo=html5&logoColor=white" alt="Static HTML"/>
    <img src="https://img.shields.io/badge/Privacy-100%25%20Local-success?style=for-the-badge&logo=shield&logoColor=white" alt="Absolute Privacy"/>
    <img src="https://img.shields.io/badge/Language-English-blueviolet?style=for-the-badge&logo=translate&logoColor=white" alt="English"/>
  </p>

  <h3>🌐 Official Live Demo: <a href="https://silvercat-utils.com">silvercat-utils.com</a></h3>
</div>

---

**Silver Cat Tools** is a collection of high-performance, single-purpose web utilities (Micro-SaaS) designed to run entirely client-side. Fast, secure, and requiring no installation, it offers image processing, text analysis, and video utilities at your fingertips.

### 🔑 Core Philosophy
*   🔒 **Zero Tracking & Full Privacy**: All calculations, image compression, format conversions, and text analyses are executed locally within your browser. **Your files or text data are never uploaded to any server.**
*   ⚡ **Instant Performance**: Powered by native HTML5 APIs, canvas manipulation, and client-side JavaScript. No server latency, no bandwidth throttling.
*   🎨 **Premium Glassmorphic UI**: Features a beautiful modern dark mode dashboard, ambient glowing backdrops, fluid hover effects, and fully responsive layouts.
*   🆓 **100% Free & No Ads**: Enjoy a clean and distraction-free interface without annoying pop-ups, subscription walls, or ad-tracker scripts.

---

### 🛠️ Available Tools

#### 📸 Image Processing Suite
1.  **High-Quality Image Compressor** (`/images/image-compressor/`)
    *   Reduce file sizes of JPG/PNG/WebP images intelligently while preserving visual sharpness.
2.  **Image Format Converter** (`/images/image-converter/`)
    *   Batch convert images offline between PNG, JPG, WebP, BMP, and GIF formats, and export them as a single ZIP.
3.  **Batch Image Watermarker** (`/images/image-watermarker/`)
    *   Apply custom text or logo watermarks to multiple images simultaneously with custom positions and opacities.
4.  **Color Palette Generator** (`/images/color-palette/`)
    *   Extract dominant color themes and pick color codes (HEX/RGB/HSL) instantly from any uploaded picture.
5.  **Image to PDF Converter** (`/images/image-to-pdf/`)
    *   Merge and bundle multiple images into a single premium PDF file with custom page sizing.
6.  **Quick Image Cropper & Resizer** (`/images/image-cropper/`)
    *   Crop, rotate, flip, and adjust dimensions of images easily using local browser canvas.
7.  **Retro Pixelator & ASCII Generator** (`/images/image-pixelator/`)
    *   Turn your photos into retro pixel art or artistic text-based ASCII art representations.
8.  **Image Filter & Effects** (`/images/image-filter/`)
    *   Apply Grayscale, Sepia, Blur, Vintage, Pixelate, Emboss, Cool, Warm, and many other powerful effects on your photos.
9.  **Batch Image Resizer** (`/images/batch-resizer/`)
    *   Resize multiple images at once with preset sizes or custom dimensions. Keep aspect ratio, choose output format.
10. **Image Grid Splitter** (`/images/image-splitter/`)
    *   Split a large image into equal grid tiles — perfect for Instagram grids and creative banners.
11. **Photo Collage Maker** (`/images/collage-maker/`)
    *   Combine multiple photos into a beautiful collage with customizable layout, size, and spacing.

#### 📄 Text & Document Suite
12. **Find & Replace Text** (`/text/replace-text/`)
    *   Search, filter, and batch replace words. Supports Regular Expressions (RegEx), deleting empty lines, clean whitespaces, and stripping accents.
13. **Word Counter & Text Analyzer** (`/text/word-counter/`)
    *   Analyze character/word count, sentences, paragraphs, estimate reading/speaking time, measure keyword density, and compute readability scores.
14. **Markdown Editor & Live Preview** (`/text/markdown-converter/`)
    *   Write standard Markdown syntax with side-by-side syntax-highlighted editor and real-time HTML preview.
15. **Text Encoder & Decoder** (`/text/text-encoder/`)
    *   Encode/decode strings using Base64, URL percent-encoding, HTML Entities, Hex, Binary, and ROT13.
16. **Text & Code Diff Checker** (`/text/compare-diff/`)
    *   Compare two text or code files visually GitHub-style. Side-by-side and unified views with ignore whitespace/case options.
17. **Excel/CSV Reader** (`/text/excel-reader/`)
    *   Read and view Excel (.xlsx, .xls), CSV, TSV, ODS files online. Supports multiple sheets, filtering, search, and CSV/JSON export.
18. **JSON ↔ YAML Converter** (`/text/json-yaml-converter/`)
    *   Convert between JSON and YAML instantly. Format, validate, and minify JSON with real-time syntax error checking.
19. **JWT Decoder & Debugger** (`/text/jwt-decoder/`)
    *   Decode JWT tokens visually, check expiry, compare 2 tokens. Base64 URL-safe decoding with JSON tree display.
20. **URL Parser & Query Builder** (`/text/url-parser/`)
    *   Parse URLs into protocol, host, query params. Edit query strings visually and copy the built URL instantly.
21. **UUID/ULID Generator** (`/text/uuid-generator/`)
    *   Generate UUID v4, v7 and ULID. Bulk generate, 1-click copy. Decode timestamps from UUID v7 and ULID.
22. **Cron Generator & Humanizer** (`/text/cron-generator/`)
    *   Visually build cron expressions, humanize cron strings into plain English, and browse the cron syntax cheat sheet.
23. **Web Source Downloader** (`/text/web-downloader/`)
    *   Download HTML, CSS, JavaScript source code from any website. View online and download as ZIP.

#### 🎬 Video & Utilities
24. **Video Downloader** (`/videos/video-downloader/`)
    *   Download videos from TikTok, Facebook, and Instagram without watermarks. High speed, no software installation required.
25. **Video Format Converter** (`/videos/video-converter/`)
    *   Convert video files to MP4, WebM, AVI, MOV, FLV, MKV, extract audio to MP3/WAV/AAC, or create animated GIFs — all offline.
26. **Video Subtitle Editor** (`/videos/video-subtitle/`)
    *   Upload video and SRT/VTT subtitle files, edit visually with real-time sync preview. Download video with burned-in subtitles or subtitle file only.

---

### 🚀 Getting Started & Local Usage
Since the codebase is serverless and static, you can run it directly:
1.  Clone the repository:
    ```bash
    git clone https://github.com/namtiennguyen97/silvercat_tools.git
    ```
2.  Double-click `index.html` to open it in your browser.
3.  Navigate through the tools locally!

---

### 🛠️ For Developers
Are you looking to add tools, improve styles, or contribute? Check out the [Developer Guidelines](DEVELOPER.md) for folder conventions, local test protocol rules, and the English-only SEO policy.