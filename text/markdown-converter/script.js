// Page-specific local dictionary
const localDictionary = {
    vi: {
        "md-h1": "Trình Biên Soạn Markdown & <span class=\"text-gradient-indigo\">Live Preview</span>",
        "md-subtitle": "Soạn thảo Markdown trực quan thời gian thực. Xem trước kết quả định dạng và copy mã nguồn HTML hoặc in ấn tài liệu dễ dàng chỉ trong nháy mắt.",
        "input-placeholder": "Bắt đầu nhập nội dung định dạng Markdown tại đây...\n\nVí dụ:\n# Tiêu đề 1\n## Tiêu đề 2\n\nĐây là **chữ in đậm** và đây là *chữ in nghiêng*.\n\n- Danh sách mục 1\n- Danh sách mục 2\n\n> Đây là một trích dẫn đẹp mắt.\n\n`Mã nguồn inline` hoặc code block:\n```javascript\nconsole.log(\"Hello Silver Cat Tools!\");\n```\n\n[Nhấn vào đây để xem Silver Cat Tools](index.html)",
        "btn-load-sample": "Tải Mẫu MD",
        "lbl-preview-tab": "Xem Trước",
        "lbl-html-code-tab": "Mã HTML",
        "panel-editor-title": "Mã Nguồn Markdown",
        "lbl-assess": "Bắt đầu nhập nội dung Markdown để xem trước kết quả...",
        "lbl-copy-md": "Sao Chép MD",
        "lbl-copy-html": "Sao Chép HTML",
        "lbl-download-html": "Tải HTML (.html)",
        "sample-text": "# Báo Cáo Công Việc Tuần\n## Dự án Silver Cat Tools - Cổng Tiện Ích Trực Tuyến\n\nChào mừng bạn đến với **Trình Biên Soạn Markdown chuyên nghiệp**! Dưới đây là các tính năng cơ bản được hỗ trợ:\n\n### 1. Định Dạng Văn Bản Cơ Bản\n- Chữ **in đậm** (bold) hoặc *in nghiêng* (italic)\n- Tạo liên kết động: [Silver Cat Tools Homepage](index.html)\n- Đoạn mã ngắn inline `const logo = \"logo.jpg\"` vô cùng nổi bật.\n\n### 2. Khối Trích Dẫn Nghệ Thuật\n> \"Tốc độ xử lý nhanh chóng, bảo mật tuyệt đối dữ liệu người dùng tại local, và thiết kế giao diện mang phong cách tương lai chính là kim chỉ nam của chúng tôi.\"\n\n### 3. Code Block Tiêu Chuẩn\n```javascript\n// Khởi chạy hệ thống\nfunction startApp() {\n    console.log(\"Silver Cat Tools running beautifully!\");\n}\nstartApp();\n```\n\n*Hãy chỉnh sửa cột bên trái và xem kết quả hiển thị tự động thay đổi bên cột phải!*"
    },
    en: {
        "md-h1": "Markdown Editor & <span class=\"text-gradient-indigo\">Live Preview</span>",
        "md-subtitle": "Live side-by-side Markdown editor. Preview beautifully formatted prose and copy structured compiled HTML instantly in one click.",
        "input-placeholder": "Start typing Markdown code here...\n\nExample:\n# Heading 1\n## Heading 2\n\nThis is **bold text** and this is *italic text*.\n\n- List item 1\n- List item 2\n\n> This is a beautiful blockquote.\n\n`Inline code` or code blocks:\n```javascript\nconsole.log(\"Hello Silver Cat Tools!\");\n```\n\n[Link to Silver Cat Tools](index.html)",
        "btn-load-sample": "Load Template",
        "lbl-preview-tab": "Visual Preview",
        "lbl-html-code-tab": "HTML Code",
        "panel-editor-title": "Markdown Editor Source",
        "lbl-assess": "Start typing Markdown to preview formatting...",
        "lbl-copy-md": "Copy MD",
        "lbl-copy-html": "Copy HTML",
        "lbl-download-html": "Download HTML",
        "sample-text": "# Weekly Work Report\n## Silver Cat Tools Portal Project\n\nWelcome to our **professional side-by-side Markdown workspace**! Here are the core features supported natively:\n\n### 1. Basic Prose Formatting\n- Make text **bold** or *italic*\n- Embed active hyperlinks: [Silver Cat Tools Homepage](index.html)\n- Inline highlighting like `const theme = \"glassmorphic\"` renders instantly.\n\n### 2. Artistic Blockquotes\n> \"Local privacy, blistering processing speeds, and gorgeous futuristic visual aesthetics form the pillars of Silver Cat Tools.\"\n\n### 3. Clean Code Blocks\n```javascript\n// Startup routine\nfunction startApp() {\n    console.log(\"Silver Cat Tools running beautifully!\");\n}\nstartApp();\n```\n\n*Edit the left editor pane and see the beautifully compiled formatting update in real-time!*"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('input-text');
    const previewWindow = document.getElementById('preview-window');
    const htmlWindow = document.getElementById('html-code-window');
    
    const btnLoadSample = document.getElementById('btn-load-sample');
    const btnClearAll = document.getElementById('btn-clear-all');
    
    const btnCopyMd = document.getElementById('btn-copy-md');
    const btnCopyHtml = document.getElementById('btn-copy-html');
    const btnDownloadHtml = document.getElementById('btn-download-html');
    
    const tabPreview = document.getElementById('tab-preview');
    const tabHtmlCode = document.getElementById('tab-html-code');

    // Tab navigation elements
    const tabBtnInput = document.getElementById('tab-btn-input');
    const tabBtnOutput = document.getElementById('tab-btn-output');
    const panels = document.querySelectorAll('.tool-panel');

    // 1. Language Swapping Support
    function getLang() {
        return window.getCurrentLang ? window.getCurrentLang() : 'vi';
    }

    function applyLocalTranslation() {
        const lang = getLang();
        const dict = localDictionary[lang];
        
        document.getElementById('local-title').innerHTML = dict["md-h1"];
        document.getElementById('local-subtitle').textContent = dict["md-subtitle"];
        inputArea.placeholder = dict["input-placeholder"];
        btnLoadSample.textContent = dict["btn-load-sample"];
        
        tabPreview.textContent = dict["lbl-preview-tab"];
        tabHtmlCode.textContent = dict["lbl-html-code-tab"];
        
        document.getElementById('panel-editor-title').innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
            </svg> ${dict["panel-editor-title"]}`;

        document.getElementById('lbl-copy-md').textContent = dict["lbl-copy-md"];
        document.getElementById('lbl-copy-html').textContent = dict["lbl-copy-html"];
        document.getElementById('lbl-download-html').textContent = dict["lbl-download-html"];

        if (inputArea.value.trim() === '') {
            previewWindow.innerHTML = `<p style="color: var(--text-muted); text-align: center; margin-top: 50px;" id="lbl-assess">${dict["lbl-assess"]}</p>`;
        }
    }

    window.addEventListener('languageChanged', () => {
        applyLocalTranslation();
        processMarkdown();
    });

    // 2. Action triggers
    btnLoadSample.addEventListener('click', () => {
        const lang = getLang();
        inputArea.value = localDictionary[lang]["sample-text"];
        processMarkdown();
    });

    btnClearAll.addEventListener('click', () => {
        inputArea.value = '';
        processMarkdown();
    });

    // 3. Document Operations
    btnCopyMd.addEventListener('click', () => {
        const text = inputArea.value;
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            btnCopyMd.classList.add('success');
            const originalText = document.getElementById('lbl-copy-md').textContent;
            document.getElementById('lbl-copy-md').textContent = getLang() === 'vi' ? 'Đã Sao Chép MD!' : 'Copied MD!';
            setTimeout(() => {
                btnCopyMd.classList.remove('success');
                document.getElementById('lbl-copy-md').textContent = originalText;
            }, 2000);
        });
    });

    btnCopyHtml.addEventListener('click', () => {
        const html = htmlWindow.textContent;
        if (!html) return;
        navigator.clipboard.writeText(html).then(() => {
            btnCopyHtml.classList.add('success');
            const originalText = document.getElementById('lbl-copy-html').textContent;
            document.getElementById('lbl-copy-html').textContent = getLang() === 'vi' ? 'Đã Sao Chép HTML!' : 'Copied HTML!';
            setTimeout(() => {
                btnCopyHtml.classList.remove('success');
                document.getElementById('lbl-copy-html').textContent = originalText;
            }, 2000);
        });
    });

    btnDownloadHtml.addEventListener('click', () => {
        const htmlContent = htmlWindow.textContent;
        if (!htmlContent) return;

        const fullPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Markdown Document</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 0 20px; }
        h1, h2, h3 { border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 24px; }
        code { background: #f4f4f5; color: #eb5757; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
        pre { background: #f4f4f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
        pre code { background: transparent; color: inherit; padding: 0; }
        blockquote { border-left: 4px solid #6366f1; padding-left: 16px; margin-left: 0; color: #666; font-style: italic; }
        a { color: #6366f1; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

        const blob = new Blob([fullPage], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'silver-cat-markdown.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // 4. Panel Tab Switches (Preview vs Code View)
    tabPreview.addEventListener('click', () => {
        tabPreview.classList.add('active');
        tabHtmlCode.classList.remove('active');
        previewWindow.style.display = 'block';
        htmlWindow.style.display = 'none';
    });

    tabHtmlCode.addEventListener('click', () => {
        tabHtmlCode.classList.add('active');
        tabPreview.classList.remove('active');
        previewWindow.style.display = 'none';
        htmlWindow.style.display = 'block';
    });

    // 5. Mobile Tab Toggling
    [tabBtnInput, tabBtnOutput].forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            [tabBtnInput, tabBtnOutput].forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            panels.forEach(p => {
                if (p.id === target) p.classList.add('active-panel');
                else p.classList.remove('active-panel');
            });
        });
    });

    // 6. Core Markdown Parser Engine (Regex Based)
    function parseMarkdown(md) {
        if (md.trim() === '') {
            return '';
        }

        // Protect HTML entities
        let html = md
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        
        // Code blocks
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Inline code highlights
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Headings
        html = html.replace(/^\s*###\s+(.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^\s*##\s+(.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^\s*#\s+(.+)$/gm, '<h1>$1</h1>');
        
        // Bold text
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Italic text
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Blockquotes
        html = html.replace(/^\s*&gt;\s+(.+)$/gm, '<blockquote>$1</blockquote>');
        
        // List items
        html = html.replace(/^\s*[\-\*]\s+(.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
        html = html.replace(/<\/ul>\s*<ul>/g, ''); // deduplicate contiguous lists
        
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Paragraph wrapper
        html = html.split(/\n\n+/).map(p => {
            const trimmed = p.trim();
            if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('<ul') || trimmed.startsWith('<block')) {
                return p;
            }
            return `<p>${p.replace(/\n/g, '<br>')}</p>`;
        }).join('\n');

        return html;
    }

    function processMarkdown() {
        const text = inputArea.value;
        const htmlOutput = parseMarkdown(text);
        
        if (text.trim() === '') {
            const lang = getLang();
            previewWindow.innerHTML = `<p style="color: var(--text-muted); text-align: center; margin-top: 50px;" id="lbl-assess">${localDictionary[lang]["lbl-assess"]}</p>`;
            htmlWindow.textContent = '';
        } else {
            previewWindow.innerHTML = htmlOutput;
            htmlWindow.textContent = htmlOutput;
        }
    }

    // Bind input listener
    inputArea.addEventListener('input', () => {
        processMarkdown();
    });

    // Initialize Page Translations
    setTimeout(() => {
        applyLocalTranslation();
    }, 100);
});
