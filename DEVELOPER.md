# 🛠️ Silver Cat Tools - Developer Guidelines

This document contains the development rules, folder structure, and technical mechanisms of the **Silver Cat Tools** project. Please read carefully before creating a new tool or modifying existing source code.

---

## 📌 IMPORTANT DEVELOPMENT GUIDELINES

> [!IMPORTANT]
> **1. Preview Rule**
> *   **DO NOT** run a localhost server (Node.js, Live Server, Vite, etc.).
> *   **REQUIRED** use the static file protocol to preview and test the website:
>     `file:///D:/free-utility-tools/index.html` or `file:///D:/free-utility-tools/[tool_folder]/index.html`
>
> **2. Shared Resource Structure**
> *   All sub-tools located in level-2 folders (e.g., `/text/replace-text/`) must link back to shared resources at the root using relative paths `../../`:
>     *   Logo: `../../logo.jpg`
>     *   Shared CSS: `../../style.css`
>     *   Shared Script: `../../app.js` (for the home page only)
>
> **3. English-Only (No i18n)**
> *   The project is **100% English-only** for SEO optimization. All UI text must be hardcoded directly in HTML tags.
> *   The old `i18n.js` file is a **no-op stub** — do NOT rely on it for translations. Do NOT use `data-i18n` attributes.
> *   Do NOT add any Vietnamese or other language text. Google Bot indexes static HTML content only.

---

## 📂 PROJECT DIRECTORY STRUCTURE

```
d:\free-utility-tools\
├── logo.jpg                     # Shared brand logo
├── style.css                    # Shared platform CSS (Navbar, layout, CSS variables)
├── app.js                       # Home page interaction logic (search, filter, PWA install)
├── i18n.js                      # No-op stub (legacy compatibility only — do NOT use for translations)
├── index.html                   # Home page displaying all tool categories
├── DEVELOPER.md                 # This document (Development Guidelines)
├── README.md                    # Project overview & documentation
│
├── images/                      # Image processing tools
│   ├── batch-resizer/           # Batch image resizer
│   ├── collage-maker/           # Photo collage maker
│   ├── color-palette/           # Extract color palettes from images
│   ├── image-compressor/        # High-quality image compressor
│   ├── image-converter/         # Batch image format converter
│   ├── image-cropper/           # Crop & rotate images
│   ├── image-filter/            # Image filters & effects
│   ├── image-pixelator/         # Pixel art & ASCII generator
│   ├── image-splitter/          # Split image into grid tiles
│   ├── image-to-pdf/            # Convert images to PDF
│   └── image-watermarker/       # Batch image watermarker
│
├── text/                        # Text & document tools
│   ├── compare-diff/            # Text & code diff checker
│   ├── cron-generator/          # Cron expression generator & humanizer
│   ├── excel-reader/            # Excel/CSV file reader
│   ├── json-yaml-converter/     # JSON ↔ YAML converter
│   ├── jwt-decoder/             # JWT token decoder & debugger
│   ├── markdown-converter/      # Markdown editor & live HTML preview
│   ├── replace-text/            # Find & replace text with RegEx
│   ├── text-encoder/            # Text encoder & decoder (Base64, Hex, ROT13, etc.)
│   ├── url-parser/              # URL parser & query builder
│   ├── uuid-generator/          # UUID/ULID generator
│   ├── web-downloader/          # Web source code downloader
│   └── word-counter/            # Word counter & text analyzer
│
└── videos/                      # Video tools
    ├── video-converter/         # Video format converter & audio extractor
    ├── video-downloader/        # Social media video downloader (TikTok, Facebook, Instagram)
    └── video-subtitle/          # Video subtitle editor (SRT/VTT)
```

---

## 🏗️ TOOL TEMPLATE STRUCTURE

Each tool follows a consistent 3-file pattern:

```
[tool-folder]/
├── index.html    # Main HTML with hardcoded English text + SEO meta tags
├── script.js     # Core algorithm logic (no i18n, no language switching)
└── style.css     # Tool-specific styles
```

### HTML Template Requirements

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Google Analytics -->
    <!-- Standard meta tags (charset, viewport, description, keywords, robots, canonical) -->
    <!-- Open Graph meta tags (og:title, og:description, og:image, og:locale=en_US) -->
    <!-- Twitter Cards -->
    <!-- Google Fonts -->
    <!-- CSS: ../../style.css + local style.css -->
</head>
<body>
    <!-- Navbar with ../../ links -->
    <!-- Main tool content with HARDCODED English text -->
    <!-- Footer -->
    <!-- Scripts: ../../i18n.js (no-op) + local script.js -->
</body>
</html>
```

### SEO Meta Tag Rules

- `<title>`: Start with "Free Online..." + tool name + "| Silver Cat Tools"
- `<meta name="description">`: 150-160 character English description
- `<meta name="keywords">`: English-only keywords separated by commas
- `og:locale`: Always `en_US`
- No `og:locale:alternate` tags
- All OG and Twitter titles/descriptions in English

---

## 🚫 WHAT NOT TO DO

- ❌ Do NOT add `data-i18n` attributes to HTML elements
- ❌ Do NOT use JavaScript to dynamically render text based on language
- ❌ Do NOT add Vietnamese or any non-English text
- ❌ Do NOT run localhost servers for preview
- ❌ Do NOT rely on `i18n.js` for any functionality — it is a no-op stub