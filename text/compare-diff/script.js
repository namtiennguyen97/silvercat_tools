(function () {
    'use strict';

    const localDict = {
        vi: {
            'back-link': 'Back to tools collection',
            'badge-category-docs': 'Documents & Text',
            'compare-h1-prefix': 'So Sánh',
            'compare-h1-suffix': 'Văn Bản & Code',
            'compare-subtitle': 'So sánh 2 file văn bản hoặc code và xem khác biệt trực quan kiểu GitHub diff. Hỗ trợ side-by-side và unified view, bỏ qua khoảng trắng / phân biệt hoa thường.',
            'lbl-original': 'Văn Bản Gốc (A)',
            'lbl-modified': 'Văn Bản Mới (B)',
            'btn-upload': 'Tải file',
            'btn-clear': 'Xóa',
            'btn-swap': 'Hoán đổi',
            'btn-sample': 'Văn Bản Mẫu',
            'btn-compare': 'So Sánh',
            'lbl-view-mode': 'Chế độ:',
            'mode-split': 'Side-by-side',
            'mode-unified': 'Unified',
            'opt-ignore-ws': 'Bỏ qua khoảng trắng',
            'opt-ignore-case': 'Bỏ qua hoa/thường',
            'lbl-result': 'Kết Quả So Sánh',
            'stat-added': 'thêm',
            'stat-removed': 'xóa',
            'stat-unchanged': 'giữ nguyên',
            'msg-identical': 'Hai văn bản hoàn toàn giống nhau.',
            'msg-empty-inputs': 'Vui lòng nhập hoặc tải nội dung cho cả 2 ô.',
            'msg-too-large': 'Văn bản quá lớn (>2500 dòng/bên). Hãy chia nhỏ để so sánh.',
            'meta-lines-single': '{n} dòng',
            'ph-input-a': 'Dán văn bản hoặc tải file gốc tại đây...',
            'ph-input-b': 'Dán văn bản hoặc tải file đã chỉnh sửa tại đây...'
        },
        en: {
            'back-link': 'Back to tools',
            'badge-category-docs': 'Documents & Text',
            'compare-h1-prefix': 'Compare',
            'compare-h1-suffix': 'Text & Code',
            'compare-subtitle': 'Compare two text or code files and view differences in a visual GitHub-style diff. Supports side-by-side and unified views, ignore whitespace or case.',
            'lbl-original': 'Original (A)',
            'lbl-modified': 'Modified (B)',
            'btn-upload': 'Upload',
            'btn-clear': 'Clear',
            'btn-swap': 'Swap',
            'btn-sample': 'Sample Text',
            'btn-compare': 'Compare',
            'lbl-view-mode': 'Mode:',
            'mode-split': 'Side-by-side',
            'mode-unified': 'Unified',
            'opt-ignore-ws': 'Ignore whitespace',
            'opt-ignore-case': 'Ignore case',
            'lbl-result': 'Comparison Result',
            'stat-added': 'added',
            'stat-removed': 'removed',
            'stat-unchanged': 'unchanged',
            'msg-identical': 'The two texts are identical.',
            'msg-empty-inputs': 'Please paste or upload content into both panels.',
            'msg-too-large': 'Text is too large (>2500 lines per side). Please split it up.',
            'meta-lines-single': '{n} lines',
            'ph-input-a': 'Paste original text or upload a file here...',
            'ph-input-b': 'Paste modified text or upload a file here...'
        }
    };

    const MAX_LINES_PER_SIDE = 2500;
    let currentLang = localStorage.getItem('preferred-lang') || 'vi';

    function t(key) {
        const d = localDict[currentLang] || localDict.vi;
        return d[key] !== undefined ? d[key] : key;
    }

    function applyLocalTranslation(lang) {
        currentLang = lang;
        const dict = localDict[lang] || localDict.vi;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key] !== undefined) el.textContent = dict[key];
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
        });
        const h1 = document.getElementById('local-title');
        if (h1) h1.innerHTML = dict['compare-h1-prefix'] + ' <span class="text-gradient-amber">' + dict['compare-h1-suffix'] + '</span>';
        const subtitle = document.getElementById('local-subtitle');
        if (subtitle) subtitle.textContent = dict['compare-subtitle'] || subtitle.textContent;
        refreshMeta();
    }

    // ---------- DOM refs ----------
    const inputA = document.getElementById('input-a');
    const inputB = document.getElementById('input-b');
    const metaA = document.getElementById('meta-a');
    const metaB = document.getElementById('meta-b');
    const uploadA = document.getElementById('upload-a');
    const uploadB = document.getElementById('upload-b');
    const btnClearA = document.getElementById('btn-clear-a');
    const btnClearB = document.getElementById('btn-clear-b');
    const btnSwap = document.getElementById('btn-swap');
    const btnSample = document.getElementById('btn-sample');
    const btnCompare = document.getElementById('btn-compare');
    const segSplit = document.getElementById('seg-split');
    const segUnified = document.getElementById('seg-unified');
    const optIgnoreWs = document.getElementById('opt-ignore-ws');
    const optIgnoreCase = document.getElementById('opt-ignore-case');
    const resultPanel = document.getElementById('result-panel');
    const diffOutput = document.getElementById('diff-output');
    const emptyDiff = document.getElementById('empty-diff');
    const statAdd = document.getElementById('stat-add');
    const statDel = document.getElementById('stat-del');
    const statEq = document.getElementById('stat-eq');

    const diffNavPrev = document.getElementById('diff-nav-prev');
    const diffNavNext = document.getElementById('diff-nav-next');
    const diffNavCounter = document.getElementById('diff-nav-counter');
    const diffNavControls = document.getElementById('diff-nav-controls');

    let viewMode = 'split';
    let lastDiff = null;
    let diffChunks = [];
    let currentChunkIndex = -1;

    // ---------- Helpers ----------
    function countLines(s) {
        if (!s) return 0;
        return s.split('\n').length;
    }
    function refreshMeta() {
        const tpl = (localDict[currentLang] || localDict.vi)['meta-lines-single'] || '{n} lines';
        metaA.querySelector('span').textContent = tpl.replace('{n}', countLines(inputA.value));
        metaB.querySelector('span').textContent = tpl.replace('{n}', countLines(inputB.value));
    }
    function escapeHtml(s) {
        if (s === undefined || s === null) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    function normalize(s, opts) {
        if (opts.ignoreCase) s = s.toLowerCase();
        if (opts.ignoreWs) s = s.replace(/\s+/g, ' ').trim();
        return s;
    }

    // ---------- LCS line-diff ----------
    function diffLines(a, b, opts) {
        const aLines = a.length ? a.split('\n') : [];
        const bLines = b.length ? b.split('\n') : [];
        const m = aLines.length, n = bLines.length;

        const aN = new Array(m);
        for (let i = 0; i < m; i++) aN[i] = normalize(aLines[i], opts);
        const bN = new Array(n);
        for (let j = 0; j < n; j++) bN[j] = normalize(bLines[j], opts);

        // Two-row DP for memory; backtracking needs full matrix though.
        // Use Uint32Array rows for compactness.
        const dp = new Array(m + 1);
        for (let i = 0; i <= m; i++) dp[i] = new Uint32Array(n + 1);

        for (let i = m - 1; i >= 0; i--) {
            const ai = aN[i];
            const row = dp[i];
            const next = dp[i + 1];
            for (let j = n - 1; j >= 0; j--) {
                if (ai === bN[j]) row[j] = next[j + 1] + 1;
                else row[j] = next[j] >= row[j + 1] ? next[j] : row[j + 1];
            }
        }

        const out = [];
        let i = 0, j = 0;
        while (i < m && j < n) {
            if (aN[i] === bN[j]) {
                out.push({ type: 'eq', a: aLines[i], b: bLines[j], ai: i + 1, bi: j + 1 });
                i++; j++;
            } else if (dp[i + 1][j] >= dp[i][j + 1]) {
                out.push({ type: 'del', a: aLines[i], ai: i + 1 });
                i++;
            } else {
                out.push({ type: 'add', b: bLines[j], bi: j + 1 });
                j++;
            }
        }
        while (i < m) { out.push({ type: 'del', a: aLines[i], ai: i + 1 }); i++; }
        while (j < n) { out.push({ type: 'add', b: bLines[j], bi: j + 1 }); j++; }
        return out;
    }

    // ---------- Renderers ----------
    function renderSplit(ops) {
        // Group consecutive del/add as paired rows; standalone del/add use empty cell on other side.
        const html = [];
        let k = 0;
        while (k < ops.length) {
            const op = ops[k];
            if (op.type === 'eq') {
                html.push(
                    '<div class="diff-split-row">' +
                    '<div class="diff-cell"><span class="ln">' + op.ai + '</span><span class="code">' + escapeHtml(op.a) + '</span></div>' +
                    '<div class="diff-cell"><span class="ln">' + op.bi + '</span><span class="code">' + escapeHtml(op.b) + '</span></div>' +
                    '</div>'
                );
                k++;
                continue;
            }
            // Collect run of dels followed by run of adds (typical LCS output ordering)
            const dels = [];
            const adds = [];
            while (k < ops.length && ops[k].type === 'del') { dels.push(ops[k]); k++; }
            while (k < ops.length && ops[k].type === 'add') { adds.push(ops[k]); k++; }
            const len = Math.max(dels.length, adds.length);
            for (let x = 0; x < len; x++) {
                const d = dels[x];
                const a = adds[x];
                const left = d
                    ? '<div class="diff-cell del"><span class="ln">' + d.ai + '</span><span class="code">' + escapeHtml(d.a) + '</span></div>'
                    : '<div class="diff-cell empty"><span class="ln"></span><span class="code"></span></div>';
                const right = a
                    ? '<div class="diff-cell add"><span class="ln">' + a.bi + '</span><span class="code">' + escapeHtml(a.b) + '</span></div>'
                    : '<div class="diff-cell empty"><span class="ln"></span><span class="code"></span></div>';
                html.push('<div class="diff-split-row">' + left + right + '</div>');
            }
        }
        return html.join('');
    }

    function renderUnified(ops) {
        const html = [];
        for (let k = 0; k < ops.length; k++) {
            const op = ops[k];
            if (op.type === 'eq') {
                html.push(
                    '<div class="diff-unified-row eq">' +
                    '<span class="ln">' + op.ai + '</span>' +
                    '<span class="ln">' + op.bi + '</span>' +
                    '<span class="marker"> </span>' +
                    '<span class="code">' + escapeHtml(op.a) + '</span>' +
                    '</div>'
                );
            } else if (op.type === 'del') {
                html.push(
                    '<div class="diff-unified-row del">' +
                    '<span class="ln">' + op.ai + '</span>' +
                    '<span class="ln"></span>' +
                    '<span class="marker">-</span>' +
                    '<span class="code">' + escapeHtml(op.a) + '</span>' +
                    '</div>'
                );
            } else {
                html.push(
                    '<div class="diff-unified-row add">' +
                    '<span class="ln"></span>' +
                    '<span class="ln">' + op.bi + '</span>' +
                    '<span class="marker">+</span>' +
                    '<span class="code">' + escapeHtml(op.b) + '</span>' +
                    '</div>'
                );
            }
        }
        return html.join('');
    }

    function findDiffChunks() {
        // Find all rows that are add/del (change rows), group into contiguous chunks
        const rows = diffOutput.querySelectorAll(
            viewMode === 'unified'
                ? '.diff-unified-row.add, .diff-unified-row.del'
                : '.diff-cell.add, .diff-cell.del'
        );
        const chunks = [];
        let currentChunk = null;
        rows.forEach(row => {
            // For split view, find the parent diff-split-row
            const targetRow = viewMode === 'split' ? row.closest('.diff-split-row') : row;
            if (!targetRow) return;
            if (!currentChunk || currentChunk.row !== targetRow) {
                if (currentChunk && currentChunk.rows.length > 0) {
                    chunks.push(currentChunk.rows);
                }
                currentChunk = { row: targetRow, rows: [targetRow] };
            }
            // Avoid duplicates in same row
            if (currentChunk.rows[currentChunk.rows.length - 1] !== targetRow) {
                currentChunk.rows.push(targetRow);
            }
        });
        if (currentChunk && currentChunk.rows.length > 0) {
            chunks.push(currentChunk.rows);
        }
        return chunks;
    }

    function updateNavState() {
        diffChunks = findDiffChunks();
        if (diffChunks.length === 0) {
            diffNavControls.style.display = 'none';
            return;
        }
        diffNavControls.style.display = 'inline-flex';
        if (currentChunkIndex < 0 || currentChunkIndex >= diffChunks.length) {
            currentChunkIndex = 0;
        }
        diffNavPrev.disabled = currentChunkIndex <= 0;
        diffNavNext.disabled = currentChunkIndex >= diffChunks.length - 1;
        diffNavCounter.textContent = (currentChunkIndex + 1) + '/' + diffChunks.length;
    }

    let _navLock = false;

    function scrollToChunk(index) {
        if (index < 0 || index >= diffChunks.length) return;
        _navLock = true;
        currentChunkIndex = index;
        const row = diffChunks[index][0];
        if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // brief highlight
            row.style.transition = 'background 0.3s';
            row.style.background = 'rgba(245, 158, 11, 0.15)';
            setTimeout(() => {
                row.style.background = '';
            }, 800);
        }
        updateNavState();
        setTimeout(() => { _navLock = false; }, 400);
    }

    diffNavPrev.addEventListener('click', () => scrollToChunk(currentChunkIndex - 1));
    diffNavNext.addEventListener('click', () => scrollToChunk(currentChunkIndex + 1));

    function renderDiff(ops) {
        const html = viewMode === 'unified' ? renderUnified(ops) : renderSplit(ops);
        diffOutput.innerHTML = html;
        updateNavState();
    }

    function updateStats(ops) {
        let add = 0, del = 0, eq = 0;
        for (const op of ops) {
            if (op.type === 'add') add++;
            else if (op.type === 'del') del++;
            else eq++;
        }
        statAdd.textContent = add;
        statDel.textContent = del;
        statEq.textContent = eq;
        return { add, del, eq };
    }

    function runCompare() {
        const a = inputA.value;
        const b = inputB.value;
        if (!a && !b) {
            alert(t('msg-empty-inputs'));
            return;
        }
        const aLineCount = countLines(a);
        const bLineCount = countLines(b);
        if (aLineCount > MAX_LINES_PER_SIDE || bLineCount > MAX_LINES_PER_SIDE) {
            alert(t('msg-too-large'));
            return;
        }
        const opts = { ignoreWs: optIgnoreWs.checked, ignoreCase: optIgnoreCase.checked };
        const ops = diffLines(a, b, opts);
        lastDiff = ops;
        const stats = updateStats(ops);
        resultPanel.style.display = '';
        if (stats.add === 0 && stats.del === 0) {
            diffOutput.style.display = 'none';
            emptyDiff.style.display = '';
        } else {
            emptyDiff.style.display = 'none';
            diffOutput.style.display = '';
            renderDiff(ops);
        }
        resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Reset nav position after compare
        currentChunkIndex = 0;
        updateNavState();
    }

    // ---------- Events ----------
    [inputA, inputB].forEach(el => el.addEventListener('input', refreshMeta));

    function readFileInto(file, target) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            target.value = e.target.result || '';
            refreshMeta();
        };
        reader.readAsText(file);
    }
    uploadA.addEventListener('change', e => readFileInto(e.target.files[0], inputA));
    uploadB.addEventListener('change', e => readFileInto(e.target.files[0], inputB));

    btnClearA.addEventListener('click', () => { inputA.value = ''; refreshMeta(); });
    btnClearB.addEventListener('click', () => { inputB.value = ''; refreshMeta(); });
    btnSwap.addEventListener('click', () => {
        const tmp = inputA.value;
        inputA.value = inputB.value;
        inputB.value = tmp;
        refreshMeta();
        if (lastDiff) runCompare();
    });

    const SAMPLE_A = [
        'function greet(name) {',
        '    console.log("Hello, " + name);',
        '    return true;',
        '}',
        '',
        'const user = "World";',
        'greet(user);'
    ].join('\n');
    const SAMPLE_B = [
        'function greet(name, greeting) {',
        '    greeting = greeting || "Hello";',
        '    console.log(`${greeting}, ${name}!`);',
        '    return true;',
        '}',
        '',
        'const user = "Silver Cat";',
        'greet(user, "Hi");'
    ].join('\n');
    btnSample.addEventListener('click', () => {
        inputA.value = SAMPLE_A;
        inputB.value = SAMPLE_B;
        refreshMeta();
        runCompare();
    });

    btnCompare.addEventListener('click', runCompare);

    function setMode(mode) {
        viewMode = mode;
        segSplit.classList.toggle('active', mode === 'split');
        segUnified.classList.toggle('active', mode === 'unified');
        if (lastDiff) renderDiff(lastDiff);
    }
    segSplit.addEventListener('click', () => setMode('split'));
    segUnified.addEventListener('click', () => setMode('unified'));

    [optIgnoreWs, optIgnoreCase].forEach(el => el.addEventListener('change', () => {
        if (lastDiff) runCompare();
    }));

    // Re-calculate diff chunks when scrolling (for virtualization)
    diffOutput.addEventListener('scroll', () => {
        // Only update nav state if user manually scrolls (debounced)
        if (diffChunks.length === 0) return;
        if (_navLock) return; // skip when navigating programmatically
        clearTimeout(diffOutput._navScrollTimer);
        diffOutput._navScrollTimer = setTimeout(() => {
            // Determine which chunk is most visible
            const containerRect = diffOutput.getBoundingClientRect();
            const centerY = containerRect.top + containerRect.height / 2;
            let bestIdx = -1;
            let bestDist = Infinity;
            for (let i = 0; i < diffChunks.length; i++) {
                const el = diffChunks[i][0];
                if (!el) continue;
                const rect = el.getBoundingClientRect();
                const elCenter = rect.top + rect.height / 2;
                const dist = Math.abs(elCenter - centerY);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestIdx = i;
                }
            }
            if (bestIdx >= 0 && bestIdx !== currentChunkIndex) {
                currentChunkIndex = bestIdx;
                diffNavPrev.disabled = currentChunkIndex <= 0;
                diffNavNext.disabled = currentChunkIndex >= diffChunks.length - 1;
                diffNavCounter.textContent = (currentChunkIndex + 1) + '/' + diffChunks.length;
            }
        }, 200);
    });

    window.addEventListener('languageChanged', e => applyLocalTranslation(e.detail.lang));
    applyLocalTranslation(currentLang);
    refreshMeta();
})();
