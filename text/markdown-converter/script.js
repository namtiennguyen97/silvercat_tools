const SAMPLE_TEXT = "# Weekly Work Report\n## Silver Cat Tools Portal Project\n\nWelcome to our **professional side-by-side Markdown workspace**! Here are the core features supported natively:\n\n### 1. Basic Prose Formatting\n- Make text **bold** or *italic*\n- Embed active hyperlinks: [Silver Cat Tools Homepage](index.html)\n- Inline highlighting like `const theme = \"glassmorphic\"` renders instantly.\n\n### 2. Artistic Blockquotes\n> \"Local privacy, blistering processing speeds, and gorgeous futuristic visual aesthetics form the pillars of Silver Cat Tools.\"\n\n### 3. Clean Code Blocks\n```javascript\n// Startup routine\nfunction startApp() {\n    console.log(\"Silver Cat Tools running beautifully!\");\n}\nstartApp();\n```\n\n*Edit the left editor pane and see the beautifully compiled formatting update in real-time!*";

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

    const tabBtnInput = document.getElementById('tab-btn-input');
    const tabBtnOutput = document.getElementById('tab-btn-output');
    const panels = document.querySelectorAll('.tool-panel');

    // Action triggers
    btnLoadSample.addEventListener('click', () => {
        inputArea.value = SAMPLE_TEXT;
        processMarkdown();
    });

    btnClearAll.addEventListener('click', () => {
        inputArea.value = '';
        processMarkdown();
    });

    // Copy MD
    btnCopyMd.addEventListener('click', () => {
        const text = inputArea.value;
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            btnCopyMd.classList.add('success');
            document.getElementById('lbl-copy-md').textContent = 'Copied MD!';
            setTimeout(() => {
                btnCopyMd.classList.remove('success');
                document.getElementById('lbl-copy-md').textContent = 'Copy MD';
            }, 2000);
        });
    });

    // Copy HTML
    btnCopyHtml.addEventListener('click', () => {
        const html = htmlWindow.textContent;
        if (!html) return;
        navigator.clipboard.writeText(html).then(() => {
            btnCopyHtml.classList.add('success');
            document.getElementById('lbl-copy-html').textContent = 'Copied HTML!';
            setTimeout(() => {
                btnCopyHtml.classList.remove('success');
                document.getElementById('lbl-copy-html').textContent = 'Copy HTML';
            }, 2000);
        });
    });

    // Download HTML
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

    // Panel Tab Switches
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

    // Mobile Tab Toggling
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

    // Core Markdown Parser
    function parseMarkdown(md) {
        if (md.trim() === '') return '';

        let html = md
            .replace(/&/g, "&")
            .replace(/</g, "<")
            .replace(/>/g, ">");

        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        html = html.replace(/^\s*###\s+(.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^\s*##\s+(.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^\s*#\s+(.+)$/gm, '<h1>$1</h1>');
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        html = html.replace(/^\s*>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
        html = html.replace(/^\s*[\-\*]\s+(.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
        html = html.replace(/<\/ul>\s*<ul>/g, '');
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

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
            previewWindow.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin-top: 50px;">Start typing Markdown to preview formatting...</p>';
            htmlWindow.textContent = '';
        } else {
            previewWindow.innerHTML = htmlOutput;
            htmlWindow.textContent = htmlOutput;
        }
    }

    inputArea.addEventListener('input', () => processMarkdown());
});