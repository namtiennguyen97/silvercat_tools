// ==========================================================================
// WEB DOWNLOADER - Fetch & download HTML/CSS/JS from any URL
// ==========================================================================

// ─── i18n ─────────────────────────────────────────────────────────────────
const localDict = {
    vi: {
        'webdl-title-tag': 'Tải Mã Nguồn Web - Silver Cat Tools',
        'webdl-head': 'Tải Mã Nguồn',
        'webdl-head-sub': 'Website',
        'webdl-desc': 'Nhập URL để tải mã nguồn HTML, CSS, JavaScript, hình ảnh của trang web. Giữ nguyên cấu trúc thư mục, mở được HTML ngay tại local.',
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
        'webdl-preview-title': 'Mã Nguồn',
        'webdl-empty': 'Nhập URL và nhấn "Tải Về" để xem mã nguồn',
        'webdl-no-css': 'Không tìm thấy CSS',
        'webdl-no-js': 'Không tìm thấy JS',
        'webdl-exporting': 'Đang tạo ZIP...',
        'webdl-files': 'tệp',
        'webdl-updating-html': 'Đang cập nhật đường dẫn...',
    },
    en: {
        'webdl-title-tag': 'Web Source Downloader - Silver Cat Tools',
        'webdl-head': 'Download',
        'webdl-head-sub': 'Source Code',
        'webdl-desc': 'Enter a URL to download HTML, CSS, JavaScript, images from any website. Preserves folder structure, open HTML locally with all assets.',
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
        'webdl-preview-title': 'Source Code',
        'webdl-empty': 'Enter a URL and click "Fetch" to view source code',
        'webdl-no-css': 'No CSS found',
        'webdl-no-js': 'No JS found',
        'webdl-exporting': 'Creating ZIP...',
        'webdl-files': 'files',
        'webdl-updating-html': 'Updating paths...',
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
    let pageData = { html: '', css: [], js: [], img: [], font: [], other: [], title: '', url: '', resources: [] };
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

    // Extract filename from URL path
    function getFilenameFromUrl(url) {
        const clean = url.split('?')[0].split('#')[0];
        const parts = clean.split('/');
        let name = parts[parts.length - 1];
        if (!name || name.indexOf('.') === -1) {
            const extMap = {
                'css': 'style.css', 'js': 'script.js',
                'png': 'image.png', 'jpg': 'image.jpg', 'jpeg': 'image.jpeg',
                'gif': 'image.gif', 'svg': 'image.svg', 'webp': 'image.webp',
                'woff': 'font.woff', 'woff2': 'font.woff2', 'ttf': 'font.ttf',
                'eot': 'font.eot'
            };
            name = extMap[clean.split('.').pop()] || 'file';
        }
        return name;
    }

    // Extract relative path from absolute URL (preserve directory structure)
    function getRelativePath(absUrl, baseUrl) {
        try {
            const base = new URL(baseUrl);
            const target = new URL(absUrl);
            const basePath = base.pathname.replace(/\/[^/]*$/, '/');
            const targetPath = target.pathname;

            // If same origin, compute relative path
            if (target.origin === base.origin) {
                let rel = targetPath;
                if (rel.startsWith('/')) rel = rel.substring(1);
                return rel;
            }

            // Different origin: create folder with domain name
            const domain = target.hostname.replace(/^www\./, '');
            let path = targetPath;
            if (path.startsWith('/')) path = path.substring(1);
            return '_external/' + domain + '/' + path;
        } catch {
            return getFilenameFromUrl(absUrl);
        }
    }

    function resolveUrl(url, base) {
        if (!url || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('javascript:')) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        try {
            const baseUrl = new URL(base);
            return new URL(url, baseUrl.origin + baseUrl.pathname.replace(/\/[^/]*$/, '/')).href;
        } catch { return null; }
    }

    // Detect resource type by URL
    function getResourceType(url) {
        const ext = url.split('?')[0].split('#')[0].split('.').pop().toLowerCase();
        if (['css'].includes(ext)) return 'css';
        if (['js', 'mjs'].includes(ext)) return 'js';
        if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp', 'avif'].includes(ext)) return 'img';
        if (['woff', 'woff2', 'ttf', 'eot', 'otf'].includes(ext)) return 'font';
        return 'other';
    }

    // Extract all external resources from HTML
    function extractResources(html, baseUrl) {
        const resources = [];

        // <link href="...">
        const linkRegex = /<link[^>]+href=["']([^"']+)["'][^>]*>/gi;
        let m;
        while ((m = linkRegex.exec(html)) !== null) {
            const url = m[1];
            if (url.startsWith('data:') || url.startsWith('#') || url.startsWith('javascript:')) continue;
            resources.push({ url, type: getResourceType(url) });
        }

        // <script src="...">
        const scriptRegex = /<script[^>]+src=["']([^"']+)["'][^>]*>/gi;
        while ((m = scriptRegex.exec(html)) !== null) {
            const url = m[1];
            if (url.startsWith('data:') || url.startsWith('#') || url.startsWith('javascript:')) continue;
            resources.push({ url, type: 'js' });
        }

        // <img src="...">
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        while ((m = imgRegex.exec(html)) !== null) {
            const url = m[1];
            if (url.startsWith('data:') || url.startsWith('#')) continue;
            resources.push({ url, type: 'img' });
        }

        // <source src="...">
        const sourceRegex = /<source[^>]+src=["']([^"']+)["'][^>]*>/gi;
        while ((m = sourceRegex.exec(html)) !== null) {
            const url = m[1];
            if (url.startsWith('data:')) continue;
            resources.push({ url, type: 'img' });
        }

        return resources;
    }

    // Rewrite HTML to use local relative paths
    function rewriteHtmlPaths(html, assetMap) {
        let result = html;
        for (const [originalUrl, localPath] of Object.entries(assetMap)) {
            // Escape special regex chars in URL
            const escaped = originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Replace in href, src attributes
            result = result.replace(
                new RegExp(`(href=["'])${escaped}(["'])`, 'gi'),
                `$1${localPath}$2`
            );
            result = result.replace(
                new RegExp(`(src=["'])${escaped}(["'])`, 'gi'),
                `$1${localPath}$2`
            );
        }
        return result;
    }

    // ======================================================================
    // FETCH PAGE
    // ======================================================================
    async function fetchPage(url) {
        if (!url || url === 'https://') {
            showStatus(localDict[getCurrentLang()]['webdl-error'], true);
            return;
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        showStatus(localDict[getCurrentLang()]['webdl-loading'], false);
        btnFetch.disabled = true;

        try {
            const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
            const response = await fetch(proxyUrl);
            if (!response.ok) {
                showStatus(localDict[getCurrentLang()]['webdl-error'], true);
                btnFetch.disabled = false;
                return;
            }

            const html = await response.text();
            const size = new TextEncoder().encode(html).length;

            const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim() : url;

            // Extract all resources
            const resources = extractResources(html, url);
            const uniqueResources = [];
            const seen = new Set();
            for (const r of resources) {
                const absUrl = resolveUrl(r.url, url);
                if (absUrl && !seen.has(absUrl)) {
                    seen.add(absUrl);
                    uniqueResources.push({ ...r, absUrl });
                }
            }

            pageData = {
                html: html,
                css: [], js: [], img: [], font: [], other: [],
                title: title,
                url: url,
                resources: uniqueResources
            };

            // Show info
            pageTitle.textContent = title;
            pageUrl.textContent = url;
            pageSize.textContent = formatFileSize(size);
            fileInfo.style.display = 'flex';

            // Show resources
            renderResources(uniqueResources, url);

            // Show HTML preview
            showCode('html', html);

            // Show counts
            const cssCountNum = uniqueResources.filter(r => r.type === 'css').length;
            const jsCountNum = uniqueResources.filter(r => r.type === 'js').length;
            cssCount.textContent = cssCountNum;
            jsCount.textContent = jsCountNum;

            // Fetch external resources in parallel
            showStatus(localDict[getCurrentLang()]['webdl-updating-html'], false);

            const fetchResults = [];
            const batchSize = 15;
            for (let i = 0; i < uniqueResources.length; i += batchSize) {
                const batch = uniqueResources.slice(i, i + batchSize);
                const promises = batch.map(async (r) => {
                    try {
                        const resp = await fetch(proxyUrl.replace(url, r.absUrl));
                        if (resp.ok) {
                            const content = await resp.blob();
                            return { resource: r, content };
                        }
                    } catch {}
                    return null;
                });
                const results = await Promise.all(promises);
                fetchResults.push(...results.filter(r => r !== null));
            }

            // Categorize fetched content
            for (const { resource, content } of fetchResults) {
                const relPath = getRelativePath(resource.absUrl, url);
                const item = { url: resource.absUrl, relPath, content };
                if (resource.type === 'css') pageData.css.push(item);
                else if (resource.type === 'js') pageData.js.push(item);
                else if (resource.type === 'img') pageData.img.push(item);
                else if (resource.type === 'font') pageData.font.push(item);
                else pageData.other.push(item);
            }

            // Update counts
            cssCount.textContent = pageData.css.length;
            jsCount.textContent = pageData.js.length;

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
                `/* === ${c.relPath} === */\n${c.content}`
            ).join('\n\n');
            codeContent.textContent = cssText || localDict[getCurrentLang()]['webdl-no-css'];
        } else if (type === 'js') {
            const jsText = pageData.js.map((j, i) =>
                `/* === ${j.relPath} === */\n${j.content}`
            ).join('\n\n');
            codeContent.textContent = jsText || localDict[getCurrentLang()]['webdl-no-js'];
        }

        const lines = codeContent.textContent.split('\n').length;
        lineCount.textContent = lines + ' dòng';

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

        html += `<div class="resource-item">
            <svg class="resource-icon html" viewBox="0 0 24 24" fill="currentColor"><path d="M12 18.178l4.62-1.256.623-6.978H9.026L8.822 7.89h8.36l.212-2.356H6.606l.63 7.066h6.764l-.288 3.056-2.712.816-2.712-.816-.162-1.808H7.172l.352 3.952L12 18.178z"/></svg>
            <span class="resource-url">${localDict[getCurrentLang()]['webdl-resource-html']}</span>
            <span class="resource-size">${formatFileSize(new TextEncoder().encode(pageData.html).length)}</span>
        </div>`;

        resources.forEach(r => {
            const absUrl = resolveUrl(r.url, baseUrl);
            const relPath = absUrl ? getRelativePath(absUrl, baseUrl) : r.url;
            const iconColor = { css: '#264de4', js: '#f7df1e', img: '#22c55e', font: '#a855f7', other: '#94a3b8' };
            const color = iconColor[r.type] || '#94a3b8';
            html += `<div class="resource-item">
                <span class="resource-icon" style="color:${color};font-size:10px;">●</span>
                <span class="resource-url" title="${escapeHtml(relPath)}">${escapeHtml(relPath)}</span>
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

        // Build asset map for rewriting HTML paths
        const assetMap = {};

        // Helper: add file to ZIP preserving directory structure
        function addFileToZip(zipFolder, relPath, content) {
            const parts = relPath.split('/');
            if (parts.length === 1) {
                zipFolder.file(parts[0], content);
            } else {
                const fileName = parts.pop();
                let current = zipFolder;
                for (const part of parts) {
                    current = current.folder(part);
                }
                current.file(fileName, content);
            }
        }

        // Add CSS files
        for (const css of pageData.css) {
            assetMap[css.url] = css.relPath;
            addFileToZip(folder, css.relPath, css.content);
        }

        // Add JS files
        for (const js of pageData.js) {
            assetMap[js.url] = js.relPath;
            addFileToZip(folder, js.relPath, js.content);
        }

        // Add images
        for (const img of pageData.img) {
            assetMap[img.url] = img.relPath;
            addFileToZip(folder, img.relPath, img.content);
        }

        // Add fonts
        for (const font of pageData.font) {
            assetMap[font.url] = font.relPath;
            addFileToZip(folder, font.relPath, font.content);
        }

        // Add other assets
        for (const other of pageData.other) {
            assetMap[other.url] = other.relPath;
            addFileToZip(folder, other.relPath, other.content);
        }

        // Rewrite HTML with local paths and add it
        const rewrittenHtml = rewriteHtmlPaths(pageData.html, assetMap);
        folder.file('index.html', rewrittenHtml);

        // ZIP
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

    codeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const type = tab.dataset.type;
            if (type === 'html') showCode('html');
            else if (type === 'css') showCode('css');
            else if (type === 'js') showCode('js');
        });
    });

    btnDownloadAll.addEventListener('click', downloadAll);

    // ======================================================================
    // INIT
    // ======================================================================
    applyLocalTranslation(getCurrentLang());
    window.addEventListener('languageChanged', e => {
        applyLocalTranslation(e.detail?.lang || getCurrentLang());
    });
})();