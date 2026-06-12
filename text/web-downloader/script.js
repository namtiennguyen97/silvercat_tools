// ==========================================================================
// WEB SOURCE DOWNLOADER - HTML/CSS/JS/static asset collector
// ==========================================================================

(function (root, factory) {
    const helpers = factory();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = helpers;
    }
    if (typeof window !== 'undefined') {
        window.WebDownloaderHelpers = helpers;
        window.addEventListener('DOMContentLoaded', () => helpers.initWebDownloader());
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const SKIP_URL_RE = /^(data:|blob:|javascript:|mailto:|tel:|#)/i;
    const TEXT_TYPES = new Set(['html', 'css', 'js', 'svg', 'json', 'otherText']);
    const MAX_ASSETS = 150;
    const BATCH_SIZE = 8;

    function normalizePageUrl(value) {
        const raw = String(value || '').trim();
        if (!raw || raw === 'https://' || raw === 'http://') return '';
        return /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
    }

    function shouldSkipUrl(value) {
        return !value || SKIP_URL_RE.test(String(value).trim());
    }

    function stripWrappingQuotes(value) {
        return String(value || '').trim().replace(/^['"]|['"]$/g, '');
    }

    function resolveAssetUrl(value, baseUrl) {
        const raw = stripWrappingQuotes(value);
        if (shouldSkipUrl(raw)) return null;
        try {
            return new URL(raw, baseUrl).href;
        } catch {
            return null;
        }
    }

    function getExtension(url) {
        try {
            const pathname = new URL(url).pathname.toLowerCase();
            const match = pathname.match(/\.([a-z0-9]+)$/i);
            return match ? match[1] : '';
        } catch {
            return '';
        }
    }

    function inferType(url, hint) {
        const ext = getExtension(url);
        if (hint === 'css' || ext === 'css') return 'css';
        if (hint === 'js' || ext === 'js' || ext === 'mjs') return 'js';
        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'ico', 'svg'].includes(ext)) {
            return ext === 'svg' ? 'svg' : 'img';
        }
        if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(ext)) return 'font';
        if (['json', 'webmanifest'].includes(ext)) return 'json';
        if (hint) return hint;
        return 'other';
    }

    function sanitizePathSegment(segment) {
        return decodeURIComponent(segment || '')
            .replace(/[<>:"\\|?*\x00-\x1F]/g, '_')
            .replace(/^\.+$/, '_')
            .trim() || 'file';
    }

    function buildLocalPath(assetUrl, pageUrl) {
        const asset = new URL(assetUrl);
        const page = new URL(pageUrl);
        const prefix = asset.origin === page.origin ? '' : '_external/' + asset.hostname.replace(/^www\./, '') + '/';
        let pathname = asset.pathname.replace(/^\/+/, '');

        if (!pathname || pathname.endsWith('/')) {
            pathname += 'index.html';
        }

        const parts = pathname.split('/').filter(Boolean).map(sanitizePathSegment);
        return prefix + parts.join('/');
    }

    function uniquifyPath(path, usedPaths) {
        if (!usedPaths.has(path)) {
            usedPaths.add(path);
            return path;
        }

        const slash = path.lastIndexOf('/');
        const dir = slash >= 0 ? path.slice(0, slash + 1) : '';
        const file = slash >= 0 ? path.slice(slash + 1) : path;
        const dot = file.lastIndexOf('.');
        const stem = dot > 0 ? file.slice(0, dot) : file;
        const ext = dot > 0 ? file.slice(dot) : '';

        let i = 2;
        let candidate = dir + stem + '-' + i + ext;
        while (usedPaths.has(candidate)) {
            i++;
            candidate = dir + stem + '-' + i + ext;
        }
        usedPaths.add(candidate);
        return candidate;
    }

    function parseSrcset(value, baseUrl, hint) {
        return String(value || '')
            .split(',')
            .map(part => part.trim())
            .filter(Boolean)
            .map(part => {
                const pieces = part.split(/\s+/);
                const url = resolveAssetUrl(pieces[0], baseUrl);
                return url ? { url, type: inferType(url, hint || 'img'), source: 'srcset' } : null;
            })
            .filter(Boolean);
    }

    function pushAsset(list, rawUrl, baseUrl, hint, source) {
        const url = resolveAssetUrl(rawUrl, baseUrl);
        if (!url) return;
        list.push({ url, type: inferType(url, hint), source: source || 'html' });
    }

    function getLinkAssetHint(rel, asType, href) {
        const relValue = String(rel || '').toLowerCase();
        const asValue = String(asType || '').toLowerCase();
        if (relValue.includes('stylesheet')) return 'css';
        if (relValue.includes('modulepreload')) return 'js';
        if (relValue.includes('manifest')) return 'json';
        if (relValue.includes('icon') || relValue.includes('apple-touch-icon')) return 'img';
        if (relValue.includes('preload') && asValue) return asValue === 'script' ? 'js' : asValue === 'style' ? 'css' : asValue;
        if (/\.(css|js|mjs|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|eot|json|webmanifest)(?:[?#].*)?$/i.test(href)) {
            return undefined;
        }
        return null;
    }

    function collectHtmlAssets(html, baseUrl) {
        const assets = [];
        let match;

        const tagRe = /<([a-z0-9:-]+)\b[^>]*>/gi;
        while ((match = tagRe.exec(html)) !== null) {
            const tag = match[0];
            const tagName = match[1].toLowerCase();

            const attrRe = /\s([a-z0-9:-]+)\s*=\s*(["'])(.*?)\2/gi;
            let attr;
            while ((attr = attrRe.exec(tag)) !== null) {
                const name = attr[1].toLowerCase();
                const value = attr[3];
                if (name === 'srcset' || name === 'imagesrcset') {
                    assets.push(...parseSrcset(value, baseUrl));
                    continue;
                }
                if (name === 'href' && tagName === 'link') {
                    const rel = (tag.match(/\srel\s*=\s*(["'])(.*?)\1/i) || [])[2] || '';
                    const asType = (tag.match(/\sas\s*=\s*(["'])(.*?)\1/i) || [])[2] || '';
                    const hint = getLinkAssetHint(rel, asType, value);
                    if (hint === null) continue;
                    pushAsset(assets, value, baseUrl, hint, 'link');
                    continue;
                }
                if (name === 'src') {
                    const hint = tagName === 'script' ? 'js' : tagName === 'iframe' ? 'html' : undefined;
                    pushAsset(assets, value, baseUrl, hint, tagName);
                    continue;
                }
                if (name === 'poster') {
                    pushAsset(assets, value, baseUrl, 'img', 'poster');
                    continue;
                }
                if (name === 'content' && tagName === 'meta' && /(?:og:image|twitter:image|image_src|msapplication-tileimage)/i.test(tag)) {
                    pushAsset(assets, value, baseUrl, 'img', 'meta');
                }
            }
        }

        return dedupeAssets(assets);
    }

    function collectCssAssets(cssText, cssUrl) {
        const assets = [];
        let match;

        const importRe = /@import\s+(?:url\(\s*)?(['"]?)([^'")\s;]+)\1\s*\)?/gi;
        while ((match = importRe.exec(cssText)) !== null) {
            pushAsset(assets, match[2], cssUrl, 'css', 'css-import');
        }

        const urlRe = /url\(\s*(['"]?)([^'")]+)\1\s*\)/gi;
        while ((match = urlRe.exec(cssText)) !== null) {
            pushAsset(assets, match[2], cssUrl, undefined, 'css-url');
        }

        return dedupeAssets(assets);
    }

    function dedupeAssets(assets) {
        const seen = new Set();
        const result = [];
        for (const asset of assets) {
            if (!asset.url || seen.has(asset.url)) continue;
            seen.add(asset.url);
            result.push(asset);
        }
        return result;
    }

    function dirname(path) {
        const slash = path.lastIndexOf('/');
        return slash >= 0 ? path.slice(0, slash) : '';
    }

    function relativePath(fromFile, toFile) {
        const fromParts = dirname(fromFile).split('/').filter(Boolean);
        const toParts = toFile.split('/').filter(Boolean);
        while (fromParts.length && toParts.length && fromParts[0] === toParts[0]) {
            fromParts.shift();
            toParts.shift();
        }
        return fromParts.map(() => '..').concat(toParts).join('/') || './';
    }

    function rewriteSrcset(value, baseUrl, assetMap) {
        return String(value || '').split(',').map(part => {
            const trimmed = part.trim();
            if (!trimmed) return trimmed;
            const pieces = trimmed.split(/\s+/);
            const url = resolveAssetUrl(pieces[0], baseUrl);
            const local = url ? assetMap.get(url) : null;
            if (!local) return trimmed;
            pieces[0] = local;
            return pieces.join(' ');
        }).join(', ');
    }

    function rewriteHtmlAssets(html, baseUrl, assetMap) {
        let result = String(html || '');
        result = result.replace(/(\s(?:href|src|poster|content)\s*=\s*)(["'])(.*?)\2/gi, (full, prefix, quote, value) => {
            const url = resolveAssetUrl(value, baseUrl);
            const local = url ? assetMap.get(url) : null;
            return local ? prefix + quote + local + quote : full;
        });
        result = result.replace(/(\s(?:srcset|imagesrcset)\s*=\s*)(["'])(.*?)\2/gi, (full, prefix, quote, value) => {
            const rewritten = rewriteSrcset(value, baseUrl, assetMap);
            return prefix + quote + rewritten + quote;
        });
        return result;
    }

    function rewriteCssAssets(cssText, cssUrl, cssLocalPath, assetMap) {
        let result = String(cssText || '');
        result = result.replace(/@import\s+(url\(\s*)?(['"]?)([^'")\s;]+)\2(\s*\)?)\s*;?/gi, (full, urlPrefix, quote, value, close) => {
            const url = resolveAssetUrl(value, cssUrl);
            const local = url ? assetMap.get(url) : null;
            if (!local) return full;
            const rel = relativePath(cssLocalPath, local);
            if (urlPrefix) return '@import url("' + rel + '")';
            return '@import "' + rel + '"';
        });
        result = result.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (full, quote, value) => {
            const url = resolveAssetUrl(value, cssUrl);
            const local = url ? assetMap.get(url) : null;
            if (!local) return full;
            return "url('" + relativePath(cssLocalPath, local) + "')";
        });
        return result;
    }

    function buildProxyUrl(url) {
        return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
    }

    function formatFileSize(bytes) {
        if (!Number.isFinite(bytes)) return '-';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function titleFromHtml(html, fallbackUrl) {
        const match = String(html || '').match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        return match ? match[1].replace(/\s+/g, ' ').trim() : fallbackUrl;
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }

    async function fetchThroughProxy(url, responseType) {
        const response = await fetch(buildProxyUrl(url), { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        if (responseType === 'text') return response.text();
        return response.blob();
    }

    function addFileToZip(folder, relPath, content) {
        const parts = relPath.split('/').filter(Boolean);
        const fileName = parts.pop() || 'file';
        let current = folder;
        for (const part of parts) {
            current = current.folder(part);
        }
        current.file(fileName, content);
    }

    function initWebDownloader() {
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

        if (!btnFetch || !urlInput) return;

        const state = {
            html: '',
            rewrittenHtml: '',
            url: '',
            title: '',
            files: [],
            failed: [],
            queued: new Map(),
            localByUrl: new Map(),
            downloadedMap: new Map(),
            usedPaths: new Set(),
            currentTab: 'html'
        };

        function resetState() {
            state.html = '';
            state.rewrittenHtml = '';
            state.url = '';
            state.title = '';
            state.files = [];
            state.failed = [];
            state.queued = new Map();
            state.localByUrl = new Map();
            state.downloadedMap = new Map();
            state.usedPaths = new Set();
            state.currentTab = 'html';
        }

        function showStatus(message, isError) {
            statusArea.style.display = 'block';
            statusText.textContent = message;
            statusArea.querySelector('.status-bar').classList.toggle('error', Boolean(isError));
        }

        function hideStatus() {
            statusArea.style.display = 'none';
        }

        function addAsset(asset) {
            if (!asset || !asset.url || state.queued.has(asset.url)) return false;
            if (state.queued.size >= MAX_ASSETS) return false;
            const localPath = uniquifyPath(buildLocalPath(asset.url, state.url), state.usedPaths);
            const enriched = { ...asset, localPath, status: 'queued', size: 0, content: null };
            state.queued.set(asset.url, enriched);
            state.localByUrl.set(asset.url, localPath);
            return true;
        }

        function addAssets(assets) {
            let count = 0;
            for (const asset of assets) {
                if (addAsset(asset)) count++;
            }
            return count;
        }

        function renderResources() {
            const htmlSize = new TextEncoder().encode(state.rewrittenHtml || state.html).length;
            const rows = [];
            rows.push({
                path: 'index.html',
                type: 'HTML',
                status: 'fetched',
                size: htmlSize
            });
            for (const file of state.files) {
                rows.push({
                    path: file.localPath,
                    type: file.type.toUpperCase(),
                    status: 'fetched',
                    size: file.size
                });
            }
            for (const file of state.failed) {
                rows.push({
                    path: file.localPath || file.url,
                    type: file.type.toUpperCase(),
                    status: 'failed',
                    size: 0
                });
            }

            resourceGroup.style.display = 'block';
            resourceList.innerHTML = rows.map(row => `
                <div class="resource-item resource-${row.status}">
                    <span class="resource-icon-dot ${row.type.toLowerCase()}"></span>
                    <span class="resource-url" title="${escapeHtml(row.path)}">${escapeHtml(row.path)}</span>
                    <span class="resource-status">${row.status}</span>
                    <span class="resource-size">${row.size ? formatFileSize(row.size) : row.type}</span>
                </div>
            `).join('');
        }

        function updateCounts() {
            cssCount.textContent = state.files.filter(file => file.type === 'css').length;
            jsCount.textContent = state.files.filter(file => file.type === 'js').length;
        }

        function showCode(type) {
            emptyState.style.display = 'none';
            codeWrapper.style.display = 'block';
            state.currentTab = type;

            if (type === 'html') {
                codeContent.textContent = state.rewrittenHtml || state.html;
            } else if (type === 'css') {
                const cssText = state.files
                    .filter(file => file.type === 'css')
                    .map(file => '/* === ' + file.localPath + ' === */\n' + file.text)
                    .join('\n\n');
                codeContent.textContent = cssText || 'No CSS files were downloaded.';
            } else if (type === 'js') {
                const jsText = state.files
                    .filter(file => file.type === 'js')
                    .map(file => '/* === ' + file.localPath + ' === */\n' + file.text)
                    .join('\n\n');
                codeContent.textContent = jsText || 'No JavaScript files were downloaded.';
            }

            lineCount.textContent = codeContent.textContent.split('\n').length + ' lines';
            codeTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.type === type));
        }

        async function fetchAsset(asset) {
            const textType = TEXT_TYPES.has(asset.type);
            try {
                const content = await fetchThroughProxy(asset.url, textType ? 'text' : 'blob');
                const size = textType ? new TextEncoder().encode(content).length : content.size;
                const file = {
                    ...asset,
                    status: 'fetched',
                    content,
                    text: textType ? content : '',
                    size
                };
                state.files.push(file);
                state.downloadedMap.set(asset.url, asset.localPath);

                if (asset.type === 'css') {
                    const nested = collectCssAssets(content, asset.url);
                    addAssets(nested);
                }
            } catch (error) {
                state.failed.push({ ...asset, status: 'failed', error: error.message });
            }
        }

        async function processQueue() {
            let cursor = 0;
            while (cursor < state.queued.size) {
                const all = Array.from(state.queued.values());
                const batch = all.slice(cursor, cursor + BATCH_SIZE);
                cursor += batch.length;
                showStatus('Fetching assets ' + Math.min(cursor, state.queued.size) + ' / ' + state.queued.size + '...', false);
                await Promise.all(batch.map(fetchAsset));
                renderResources();
                updateCounts();
            }
        }

        function finalizeRewrites() {
            for (const file of state.files) {
                if (file.type === 'css') {
                    file.text = rewriteCssAssets(file.text, file.url, file.localPath, state.downloadedMap);
                    file.content = file.text;
                    file.size = new TextEncoder().encode(file.text).length;
                }
            }
            state.rewrittenHtml = rewriteHtmlAssets(state.html, state.url, state.downloadedMap);
        }

        async function fetchPage() {
            const normalizedUrl = normalizePageUrl(urlInput.value);
            if (!normalizedUrl) {
                showStatus('Please enter a valid URL.', true);
                return;
            }

            resetState();
            state.url = normalizedUrl;
            btnFetch.disabled = true;
            actionBtns.style.display = 'none';
            fileInfo.style.display = 'none';
            resourceGroup.style.display = 'none';
            emptyState.style.display = 'none';
            codeWrapper.style.display = 'none';
            showStatus('Fetching HTML page...', false);

            try {
                state.html = await fetchThroughProxy(normalizedUrl, 'text');
                state.title = titleFromHtml(state.html, normalizedUrl);
                state.rewrittenHtml = state.html;

                pageTitle.textContent = state.title;
                pageUrl.textContent = normalizedUrl;
                pageSize.textContent = formatFileSize(new TextEncoder().encode(state.html).length);
                fileInfo.style.display = 'flex';

                addAssets(collectHtmlAssets(state.html, normalizedUrl));
                renderResources();
                updateCounts();

                if (state.queued.size > 0) {
                    await processQueue();
                }

                finalizeRewrites();
                renderResources();
                updateCounts();
                showCode('html');
                actionBtns.style.display = 'flex';
                hideStatus();
            } catch (error) {
                console.error(error);
                showStatus('Unable to fetch this page. It may block public proxies, require login, or be unavailable.', true);
            } finally {
                btnFetch.disabled = false;
            }
        }

        async function downloadAll() {
            if (typeof JSZip === 'undefined') {
                alert('JSZip library is not loaded. Please check your connection and reload this page.');
                return;
            }
            if (!state.url || !state.html) return;

            const domain = new URL(state.url).hostname.replace(/^www\./, '');
            const zip = new JSZip();
            const rootFolder = zip.folder(domain + '_source');

            rootFolder.file('index.html', state.rewrittenHtml || state.html);
            for (const file of state.files) {
                addFileToZip(rootFolder, file.localPath, file.content);
            }

            const manifest = {
                sourceUrl: state.url,
                title: state.title,
                generatedAt: new Date().toISOString(),
                files: state.files.map(file => ({ url: file.url, path: file.localPath, type: file.type, size: file.size })),
                failed: state.failed.map(file => ({ url: file.url, path: file.localPath, type: file.type, error: file.error }))
            };
            rootFolder.file('download-manifest.json', JSON.stringify(manifest, null, 2));

            const oldHtml = btnDownloadAll.innerHTML;
            btnDownloadAll.disabled = true;
            btnDownloadAll.innerHTML = '<span>Creating ZIP...</span>';
            try {
                const blob = await zip.generateAsync({ type: 'blob' });
                downloadBlob(blob, domain + '_source.zip');
            } catch (error) {
                console.error(error);
                alert('ZIP export failed. Please try a smaller page.');
            } finally {
                btnDownloadAll.disabled = false;
                btnDownloadAll.innerHTML = oldHtml;
            }
        }

        btnFetch.addEventListener('click', fetchPage);
        urlInput.addEventListener('keydown', event => {
            if (event.key === 'Enter') fetchPage();
        });
        btnDownloadAll.addEventListener('click', downloadAll);
        codeTabs.forEach(tab => {
            tab.addEventListener('click', () => showCode(tab.dataset.type));
        });
    }

    return {
        normalizePageUrl,
        shouldSkipUrl,
        resolveAssetUrl,
        inferType,
        buildLocalPath,
        parseSrcset,
        collectHtmlAssets,
        collectCssAssets,
        rewriteHtmlAssets,
        rewriteCssAssets,
        relativePath,
        buildProxyUrl,
        initWebDownloader
    };
});
