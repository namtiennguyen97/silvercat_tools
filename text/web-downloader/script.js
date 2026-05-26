// ==========================================================================
// WEB DOWNLOADER - Fetch & download HTML/CSS/JS from any URL
// ==========================================================================

// ─── i18n ─────────────────────────────────────────────────────────────────
const localDict = {
    vi: {
        'webdl-title-tag': 'Tải Mã Nguồn Web - Silver Cat Tools',
        'webdl-head': 'Tải Mã Nguồn',
        'webdl-head-sub': 'Website',
        'webdl-desc': 'Nhập URL để tải mã nguồn HTML, CSS, JavaScript của trang web. Trích xuất và tải về từng file riêng lẻ hoặc toàn bộ.',
        'webdl-input-title': 'Nhập URL',
        'webdl-url-placeholder': 'https://example.com',
        'webdl-btn-fetch': 'Tải Về',
        'webdl-loading': 'Đang tải...',
        'webdl-error': 'Không thể tải trang. Vui lòng kiểm tra URL hoặc thử lại sau.',
        'webdl-error-cors': 'Trang web này không cho phép lấy mã nguồn (CORS). Thử với trang khác.',
        'webdl-page-title': 'Tiêu đề:',
        'webdl-page-url': 'URL:',
        'webdl-page-size': 'Dung lượng:',
        'webdl-resources-title': 'Tài nguyên tìm thấy',
        'webdl-resource-html': 'HTML chính',
        'webdl-resource-inline': 'inline',
        'webdl-download-all': 'Tải Tất Cả (ZIP)',
        'webdl-download-html': 'HTML',
        'webdl-preview-title': 'Mã Nguồn',
        'webdl-empty': 'Nhập URL và nhấn "Tải Về" để xem mã nguồn',
        'webdl-no-css': 'Không tìm thấy CSS',
        'webdl-no-js': 'Không tìm thấy JS',
        'webdl-exporting': 'Đang tạo ZIP...',
        'webdl-copied': 'Đã sao chép!',
        'webdl-files': 'files',
    },
    en: {
        'webdl-title-tag': 'Web Source Downloader - Silver Cat Tools',
        'webdl-head': 'Download',
        'webdl-head-sub': 'Source Code',
        'webdl-desc': 'Enter a URL to download HTML, CSS, JavaScript source code. Extract and download individual files or everything at once.',
        'webdl-input-title': 'Enter URL',
        'webdl-url-placeholder': 'https://example.com',
        'webdl-btn-fetch': 'Fetch',
        'webdl-loading': 'Loading...',
        'webdl-error': 'Cannot load page. Please check the URL or try again later.',
        'webdl-error-cors': 'This website does not allow fetching source code (CORS). Try another site.',
        'webdl-page-title': 'Title:',
        'webdl-page-url': 'URL:',
        'webdl-page-size': 'Size:',
        'webdl-resources-title': 'Resources found',
        'webdl-resource-html': 'Main HTML',
        'webdl-resource-inline': 'inline',
        'webdl-download-all': 'Download All (ZIP)',
        'webdl-download-html': 'HTML',
        'webdl-preview-title': 'Source Code',
        'webdl-empty': 'Enter a URL and click "Fetch" to view source code',
        'webdl-no-css': 'No CSS found',
        'webdl-no-js': 'No JS found',
        'webdl-exporting': 'Creating ZIP...',
        'webdl-copied': 'Copied!',
        'webdl-files': 'files',
    }
};

function getCurrentLang() { return localStorage.getItem('preferred-lang') || 'vi'; }

function applyLocalTranslation(lang) {
    const dict = localDict[lang] || localDict['vi'];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = dict[key];
        if (translation !== undefined) {
            if (translation.includes('<') && translation.includes('>')) {
                el.innerHTML = translation;
            } else {
                el.textContent = translation;
            }
        }
    });
    const titleEl = document.querySelector('title[data-i18n]');
    if (titleEl && dict[titleEl.getAttribute('data-i18n')]) {
        document.title = dict[titleEl.getAttribute('data-i18n')];
    }
}

// ==========================================================================
// MAIN APP
// ==========================================================================
(function () {
    'use strict';

    const btnFetch = document.getElementById('btn-fetch');
    const urlInput = document.getElementById('url-input');
    const statusArea = document.getElementById('status-area');
    const statusText = document.getElementById('status-text');
    const emptyState = document.getElementById('empty-state');
    const codeWrapper = document.getElementById('code-wrapper');
    const codeContent = document.getElementById('code-content');
    const lineCount = document.getElementById('line-count');
    const fileInfo = document.getElementById('file-info');
    const pageTitle = document.getElementById('page-title');
    const pageUrl = document.getElementById('page-url');
    const pageSize = document.getElementById('page-size');
    const resourceGroup = document.getElementById('resource-group');
    const resourceList = document.getElementById('resource-list');
    const actionBtns = document.getElementById('action-buttons');
    const btnDownloadAll = document.getElementById('btn-download-all');
    const codeTabs = document.querySelectorAll('.code-tab');
    const cssCount = document.getElementById('css-count');
    const jsCount = document.getElementById('js-count');

    // State
    let pageData = { html: '', css: [], js: [], title: '', url: '', resources: [] };
    let currentTab = 'html';

    // ======================================================================
    // UTILITY
    // ======================================================================
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Extract resources from HTML
    function extractResources(html, baseUrl) {
        const resources = [];

        // Extract CSS from <link>
        const linkRegex = /<link[^>]+href=["']([^"']+\.css[^"']*)["'][^>]*>/gi;
        let m;
        while ((m = linkRegex.exec(html)) !== null) resources.push({ url: m[1], type: 'css' });

        // Extract JS from <script src>
        const scriptRegex = /<script[^>]+src=["']([^"']+)["'][^>]*>/gi;
        while ((m = scriptRegex.exec(html)) !== null) resources.push({ url: m[1], type: 'js' });

        return resources;
    }

    // Resolve relative URL to absolute
    function resolveUrl(url, base) {
        if (!url || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('javascript:')) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        try {
            const baseUrl = new URL(base);
            return new URL(url, baseUrl.origin + baseUrl.pathname.replace(/\/[^/]*$/, '/')).href;
        } catch { return null; }
    }

    // ======================================================================
    // FETCH PAGE
    // ======================================================================
    async function fetchPage(url) {
        if (!url || url === 'https://') {
            showStatus(localDict[getCurrentLang()]['webdl-error'], true);
            return;
        }

        // Normalize URL
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        showStatus(localDict[getCurrentLang()]['webdl-loading'], false);
        btnFetch.disabled = true;

        try {
            // Use CORS proxy
            const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                showStatus(localDict[getCurrentLang()]['webdl-error'], true);
                btnFetch.disabled = false;
                return;
            }

            const html = await response.text();
            const size = new TextEncoder().encode(html).length;

            // Extract title
            const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim() : url;

            // Extract resources
            const resources = extractResources(html, url);
            const cssUrls = resources.filter(r => r.type === 'css').map(r => r.url);
            const jsUrls = resources.filter(r => r.type === 'js').map(r => r.url);

            // Store data
            pageData = {
                html: html,
                css: [],
                js: [],
                title: title,
                url: url,
                resources: resources
            };

            // Show info
            pageTitle.textContent = title;
            pageUrl.textContent = url;
            pageSize.textContent = formatFileSize(size);
            fileInfo.style.display = 'flex';

            // Show resources
            renderResources(resources, url);

            // Show HTML preview
            showCode('html', html);

            // Update CSS/JS counts
            cssCount.textContent = cssUrls.length;
            jsCount.textContent = jsUrls.length;

            // Fetch CSS files
            let cssContents = [];
            for (const cssUrl of cssUrls) {
                const absUrl = resolveUrl(cssUrl, url);
                if (absUrl) {
                    try {
                        const cssResp = await fetch(proxyUrl.replace(url, absUrl));
                        if (cssResp.ok) cssContents.push({ url: absUrl, content: await cssResp.text() });
                    } catch {}
                }
            }
            pageData.css = cssContents;

            // Fetch JS files
            let jsContents = [];
            for (const jsUrl of jsUrls) {
                const absUrl = resolveUrl(jsUrl, url);
                if (absUrl) {
                    try {
                        const jsResp = await fetch(proxyUrl.replace(url, absUrl));
                        if (jsResp.ok) jsContents.push({ url: absUrl, content: await jsResp.text() });
                    } catch {}
                }
            }
            pageData.js = jsContents;

            // Update CSS/JS counts
            cssCount.textContent = cssContents.length;
            jsCount.textContent = jsContents.length;

            // Show actions
            actionBtns.style.display = 'flex';
            btnFetch.disabled = false;
            statusArea.style.display = 'none';

        } catch (err) {
            showStatus(localDict[getCurrentLang()]['webdl-error-cors'], true);
            btnFetch.disabled = false;
        }
    }

    // ======================================================================
    // SHOW CODE
    // ======================================================================
    function showCode(type, content) {
        emptyState.style.display = 'none';
        codeWrapper.style.display = 'block';

        if (type === 'html') {
            codeContent.textContent = content || pageData.html;
        } else if (type === 'css') {
            const cssText = pageData.css.map((c, i) => 
                `/* === CSS File ${i+1}: ${c.url} === */\n${c.content}`
            ).join('\n\n');
            codeContent.textContent = cssText || localDict[getCurrentLang()]['webdl-no-css'];
        } else if (type === 'js') {
            const jsText = pageData.js.map((j, i) => 
                `/* === JS File ${i+1}: ${j.url} === */\n${j.content}`
            ).join('\n\n');
            codeContent.textContent = jsText || localDict[getCurrentLang()]['webdl-no-js'];
        }

        // Update line count
        const lines = codeContent.textContent.split('\n').length;
        lineCount.textContent = lines + ' dòng';

        // Update tabs
        codeTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === type);
        });
        currentTab = type;
    }

    // ======================================================================
    // RENDER RESOURCES
    // ======================================================================
    function renderResources(resources, baseUrl) {
        resourceGroup.style.display = 'block';
        let html = '';

        // Main HTML
        html += `<div class="resource-item">
            <svg class="resource-icon html" viewBox="0 0 24 24" fill="currentColor"><path d="M12 18.178l4.62-1.256.623-6.978H9.026L8.822 7.89h8.36l.212-2.356H6.606l.63 7.066h6.764l-.288 3.056-2.712.816-2.712-.816-.162-1.808H7.172l.352 3.952L12 18.178z"/></svg>
            <span class="resource-url">${localDict[getCurrentLang()]['webdl-resource-html']}</span>
            <span class="resource-size">${formatFileSize(new TextEncoder().encode(pageData.html).length)}</span>
        </div>`;

        resources.forEach(r => {
            const absUrl = resolveUrl(r.url, baseUrl);
            html += `<div class="resource-item">
                <svg class="resource-icon ${r.type}" viewBox="0 0 24 24" fill="currentColor">${
                    r.type === 'css' 
                        ? '<path d="M12 18.178l4.62-1.256.623-6.978H9.026L8.822 7.89h8.36l.212-2.356H6.606l.63 7.066h6.764l-.288 3.056-2.712.816-2.712-.816-.162-1.808H7.172l.352 3.952L12 18.178z"/>'
                        : '<path d="M12 14.452c-1.2 0-2.184-.984-2.184-2.184 0-1.2.984-2.184 2.184-2.184 1.2 0 2.184.984 2.184 2.184 0 1.2-.984 2.184-2.184 2.184zM20.4 12c0 .336-.032.668-.08.996l2.144 1.676c.196.152.248.444.12.668l-2.032 3.516c-.124.224-.4.316-.636.236l-2.528-1.02c-.532.404-1.116.736-1.748.98l-.384 2.688c-.048.256-.268.44-.536.44h-4.064c-.268 0-.488-.184-.536-.44l-.384-2.688c-.632-.244-1.216-.576-1.748-.98l-2.528 1.02c-.236.08-.512-.012-.636-.236l-2.032-3.516c-.128-.224-.076-.516.12-.668l2.144-1.676c-.048-.328-.08-.66-.08-.996s.032-.668.08-.996L2.336 9.328c-.196-.152-.248-.444-.12-.668l2.032-3.516c.124-.224.4-.316.636-.236l2.528 1.02c.532-.404 1.116-.736 1.748-.98l.384-2.688c.048-.256.268-.44.536-.44h4.064c.268 0 .488.184.536.44l.384 2.688c.632.244 1.216.576 1.748.98l2.528-1.02c.236-.08.512.012.636.236l2.032 3.516c.128.224.076.516-.12.668l-2.144 1.676c.048.328.08.66.08.996z"/>'
                }</svg>
                <span class="resource-url" title="${escapeHtml(absUrl || r.url)}">${escapeHtml(r.url)}</span>
                <span class="resource-size">${r.type.toUpperCase()}</span>
            </div>`;
        });

        resourceList.innerHTML = html;
    }

    // ======================================================================
    // STATUS
    // ======================================================================
    function showStatus(msg, isError) {
        statusArea.style.display = 'block';
        statusText.textContent = msg;
        statusArea.querySelector('.status-bar').classList.toggle('error', isError);
    }

    // ======================================================================
    // DOWNLOAD ALL AS ZIP
    // ======================================================================
    async function downloadAll() {
        if (typeof JSZip === 'undefined') {
            alert('JSZip library not loaded. Please check your internet connection.');
            return;
        }
        
        const zip = new JSZip();
        const domain = new URL(pageData.url).hostname;
        const folder = zip.folder(domain);

        // Add HTML
        folder.file('index.html', pageData.html);

        // Add CSS
        pageData.css.forEach((c, i) => {
            const name = 'style_' + (i + 1) + '.css';
            folder.file(name, c.content);
        });

        // Add JS
        pageData.js.forEach((j, i) => {
            const name = 'script_' + (i + 1) + '.js';
            folder.file(name, j.content);
        });

        const oldText = btnDownloadAll.innerHTML;
        btnDownloadAll.innerHTML = '<span>' + localDict[getCurrentLang()]['webdl-exporting'] + '</span>';
        btnDownloadAll.disabled = true;

        try {
            const blob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = domain + '_source.zip';
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        }

        btnDownloadAll.innerHTML = oldText;
        btnDownloadAll.disabled = false;
    }

    // ======================================================================
    // EVENTS
    // ======================================================================
    btnFetch.addEventListener('click', () => fetchPage(urlInput.value));

    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') fetchPage(urlInput.value);
    });

    // Code tab switching
    codeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const type = tab.dataset.type;
            if (type === 'html') showCode('html');
            else if (type === 'css') showCode('css');
            else if (type === 'js') showCode('js');
        });
    });

    // Download all
    btnDownloadAll.addEventListener('click', downloadAll);

    // ======================================================================
    // INIT
    // ======================================================================
    applyLocalTranslation(getCurrentLang());
    window.addEventListener('languageChanged', e => {
        applyLocalTranslation(e.detail?.lang || getCurrentLang());
    });
})();