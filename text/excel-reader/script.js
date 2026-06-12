// ==========================================================================
// EXCEL READER - Read .xlsx/.xls/.csv/.tsv/.ods files
// ==========================================================================

// ─── i18n ─────────────────────────────────────────────────────────────────
const localDict = {
    vi: {
        'excel-title-tag': 'Read Excel/CSV File - Silver Cat Tools',
        'excel-head': 'Read File',
        'excel-head-sub': 'Excel/CSV',
        'excel-desc': 'Upload Excel (.xlsx, .xls) or CSV files to view data visually. Supports multiple sheets, filtering, searching and data export.' ,
        'excel-upload-title': 'Tải File Lên',
        'excel-drop': 'Drag & drop a file here or click to browse',
        'excel-drop-desc': 'Supports .xlsx, .xls, .csv, .tsv, .ods. 100% browser-side.',
        'excel-file-name': 'Tên file:',
        'excel-file-size': 'File size:',
        'excel-file-rows': 'Tổng dòng:',
        'excel-sheet-title': 'Select Sheet',
        'excel-filter-title': 'Tìm kiếm & Lọc',
        'excel-filter-placeholder': 'Tìm kiếm trong dữ liệu...',
        'excel-export-csv': 'Export CSV',
        'excel-export-json': 'Export JSON',
        'excel-preview-title': 'Xem Dữ Liệu',
        'excel-empty': 'Tải file lên để xem dữ liệu',
        'badge-rows': 'dòng',
        'excel-loading': 'Đang xử lý file...',
        'excel-error-parse': 'Cannot read file. Please check the file format.',
        'excel-error-large': 'File too large. Please select a file smaller than 50MB.',
        'excel-no-sheets': 'Không tìm thấy sheet nào trong file.',
        'excel-file-encoding': 'Bảng mã:',
    },
    en: {
        'excel-title-tag': 'Excel/CSV File Reader - Silver Cat Tools',
        'excel-head': 'Read',
        'excel-head-sub': 'Excel/CSV',
        'excel-desc': 'Upload Excel (.xlsx, .xls) or CSV files to view data visually. Supports multiple sheets, filtering, search and data export.',
        'excel-upload-title': 'Upload File',
        'excel-drop': 'Drag & drop file here or click to select',
        'excel-drop-desc': 'Supports .xlsx, .xls, .csv, .tsv, .ods. 100% browser-side.',
        'excel-file-name': 'File name:',
        'excel-file-size': 'Size:',
        'excel-file-rows': 'Total rows:',
        'excel-sheet-title': 'Select Sheet',
        'excel-filter-title': 'Search & Filter',
        'excel-filter-placeholder': 'Search in data...',
        'excel-export-csv': 'Export CSV',
        'excel-export-json': 'Export JSON',
        'excel-preview-title': 'Data Preview',
        'excel-empty': 'Upload a file to view data',
        'badge-rows': 'rows',
        'excel-loading': 'Processing file...',
        'excel-error-parse': 'Cannot read file. Please check the format.',
        'excel-error-large': 'File too large. Please select a file smaller than 50MB.',
        'excel-no-sheets': 'No sheets found in this file.',
        'excel-file-encoding': 'Encoding:',
    }
};

function getCurrentLang() { return 'en'; }

function applyLocalTranslation(lang) {
        // Static English HTML is the source of truth for SEO and UI text.
    }

// ==========================================================================
// MAIN APP
// ==========================================================================
(function () {
    'use strict';

    const dropzone = document.getElementById('dropzone-file');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const fileRows = document.getElementById('file-rows');
    const sheetGroup = document.getElementById('sheet-group');
    const sheetTabs = document.getElementById('sheet-tabs');
    const filterGroup = document.getElementById('filter-group');
    const filterInput = document.getElementById('filter-input');
    const emptyState = document.getElementById('empty-state');
    const tableWrapper = document.getElementById('table-wrapper');
    const tableHead = document.getElementById('table-head');
    const tableBody = document.getElementById('table-body');
    const rowCount = document.getElementById('row-count');
    const actionBtns = document.getElementById('action-buttons');
    const btnExportCsv = document.getElementById('btn-export-csv');
    const btnExportJson = document.getElementById('btn-export-json');

    // State
    let workbook = null;
    let currentSheet = null;
    let currentData = [];
    let currentHeaders = [];
    let fileInfoData = {};

    // ======================================================================
    // UTILITY
    // ======================================================================
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function formatNumber(num) {
        return num.toLocaleString();
    }

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    }

    function detectDelimiter(firstLine) {
        const commas = (firstLine.match(/,/g) || []).length;
        const tabs = (firstLine.match(/\t/g) || []).length;
        const semicolons = (firstLine.match(/;/g) || []).length;
        if (tabs > commas && tabs > semicolons) return '\t';
        if (semicolons > commas && semicolons > tabs) return ';';
        return ',';
    }

    function detectEncoding(bytes) {
        // Check BOM (Byte Order Mark)
        if (bytes.length >= 4) {
            if (bytes[0] === 0xFF && bytes[1] === 0xFE && bytes[2] === 0x00 && bytes[3] === 0x00) return 'UTF-32 LE';
            if (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0xFE && bytes[3] === 0xFF) return 'UTF-32 BE';
            if (bytes[0] === 0xFE && bytes[1] === 0xFF) return 'UTF-16 BE';
            if (bytes[0] === 0xFF && bytes[1] === 0xFE) return 'UTF-16 LE';
            if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) return 'UTF-8';
        }
        // Try to detect CJK (Japanese/Chinese/Korean) by scanning a sample
        let hasJapanese = false, hasKorean = false, hasChinese = false, hasVietnamese = false;
        const sample = Math.min(bytes.length, 2048);
        for (let i = 0; i < sample; i++) {
            const b = bytes[i] & 0xFF;
            // UTF-8 multi-byte sequences
            if (b >= 0x80) {
                // Common Vietnamese characters in UTF-8: 1 byte range
                if (b >= 0xC0 && b <= 0xC3) hasVietnamese = true;
                // Japanese: Shift-JIS or UTF-8 Japanese ranges
                if (b >= 0xE0 && b <= 0xEF) {
                    if (i + 2 < sample) {
                        const b2 = bytes[i+1] & 0xFF;
                        const b3 = bytes[i+2] & 0xFF;
                        // CJK Unified Ideographs in UTF-8 (U+4E00-U+9FFF)
                        if (b >= 0xE4 && b <= 0xE9 && b2 >= 0x80 && b3 >= 0x80) {
                            hasChinese = true;
                        }
                    }
                }
            }
        }
        // Detect if text looks like UTF-8 (no high bytes = ASCII)
        let highBytes = 0;
        for (let i = 0; i < sample; i++) {
            if ((bytes[i] & 0x80) !== 0) highBytes++;
        }
        if (highBytes === 0) return 'ASCII (US-ASCII)';
        // Check if it's valid UTF-8
        let validUtf8 = true;
        let i = 0;
        while (i < sample) {
            const b = bytes[i] & 0xFF;
            if (b < 0x80) { i++; continue; }
            if (b >= 0xC2 && b <= 0xDF && i+1 < sample) { i += 2; continue; }
            if (b >= 0xE0 && b <= 0xEF && i+2 < sample) { i += 3; continue; }
            if (b >= 0xF0 && b <= 0xF4 && i+3 < sample) { i += 4; continue; }
            validUtf8 = false; break;
        }
        if (!validUtf8) return 'Windows-1252 / ISO-8859-1';
        if (hasVietnamese) return 'UTF-8 (with VI accents)';
        if (hasChinese) return 'UTF-8 (CJK)';
        return 'UTF-8';
    }

    function parseCSV(text) {
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length === 0) return { headers: [], rows: [] };
        const delimiter = detectDelimiter(lines[0]);
        const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
            const vals = [];
            // Handle quoted fields
            let current = '', inQuote = false;
            for (const ch of lines[i]) {
                if (ch === '"') { inQuote = !inQuote; continue; }
                if (ch === delimiter && !inQuote) { vals.push(current.trim()); current = ''; continue; }
                current += ch;
            }
            vals.push(current.trim());
            if (vals.some(v => v)) rows.push(vals.map(v => v.replace(/^"|"$/g, '')));
        }
        return { headers, rows };
    }

    // ======================================================================
    // RENDER TABLE
    // ======================================================================
    function renderTable(headers, data, filterText) {
        const filter = (filterText || '').toLowerCase().trim();
        const filteredData = filter
            ? data.filter(row => row.some(cell => String(cell).toLowerCase().includes(filter)))
            : data;

        if (headers.length === 0) {
            emptyState.style.display = 'block';
            tableWrapper.style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        tableWrapper.style.display = 'block';

        // Render header
        tableHead.innerHTML = '<tr>' + headers.map(h => `<th>${escapeHtml(h)}</th>`).join('') + '</tr>';

        // Render body
        if (filteredData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="${headers.length}" style="text-align:center;padding:2rem;color:var(--text-muted);">${filter ? 'No results found' : 'No data'}</td></tr>`;
        } else {
            tableBody.innerHTML = filteredData.map(row => {
                const cells = headers.map((_, idx) => {
                    const val = row[idx] !== undefined ? row[idx] : '';
                    return `<td title="${escapeHtml(val)}">${escapeHtml(val)}</td>`;
                }).join('');
                return `<tr>${cells}</tr>`;
            }).join('');
        }

        // Update row count
        const lang = getCurrentLang();
        const rowsLabel = (localDict[lang] && localDict[lang]['badge-rows']) || 'dòng';
        rowCount.textContent = `${formatNumber(filteredData.length)} ${rowsLabel}`;
        fileRows.textContent = formatNumber(data.length);

        // Show actions
        actionBtns.style.display = 'flex';
    }

    // ======================================================================
    // LOAD SHEET DATA
    // ======================================================================
    function loadSheet(sheetName) {
        if (!workbook) return;
        currentSheet = sheetName;
        const ws = workbook.Sheets[sheetName];
        if (!ws) return;

        // Convert to array of arrays
        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        if (jsonData.length === 0) {
            currentHeaders = [];
            currentData = [];
            renderTable([], []);
            return;
        }

        currentHeaders = jsonData[0].map(h => String(h));
        currentData = jsonData.slice(1).filter(row => row.some(cell => cell !== ''));
        
        // Update sheet tabs active
        document.querySelectorAll('.sheet-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.sheet === sheetName);
        });

        renderTable(currentHeaders, currentData, filterInput.value);
    }

    // ======================================================================
    // HANDLE FILE
    // ======================================================================
    function handleFile(file) {
        if (!file) return;

        // Check file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            const dict = localDict[getCurrentLang()] || localDict['en'];
            alert(dict['excel-error-large']);
            return;
        }

        const ext = file.name.split('.').pop().toLowerCase();
        fileInfoData = { name: file.name, size: file.size };

        // Show file info
        fileInfo.style.display = 'flex';
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);

        // Show loading state
        emptyState.style.display = 'block';
        emptyState.innerHTML = `<p>${localDict[getCurrentLang()]['excel-loading']}</p>`;
        tableWrapper.style.display = 'none';

        // Read file as ArrayBuffer first to detect encoding
        const bufferReader = new FileReader();
        bufferReader.onload = (e) => {
            const bytes = new Uint8Array(e.target.result);
            const encoding = detectEncoding(bytes);
            document.getElementById('file-encoding').textContent = encoding;

            if (ext === 'csv' || ext === 'tsv') {
                // Parse CSV/TSV natively: read as text separately
                const textReader = new FileReader();
                textReader.onload = (ev) => {
                    try {
                        const { headers, rows } = parseCSV(ev.target.result);
                        currentHeaders = headers;
                        currentData = rows;
                        sheetGroup.style.display = 'none';
                        filterGroup.style.display = 'block';
                        currentSheet = 'Sheet1';
                        renderTable(headers, rows, '');
                    } catch (err) {
                        const dict = localDict[getCurrentLang()] || localDict['en'];
                        alert(dict['excel-error-parse']);
                        emptyState.style.display = 'block';
                        emptyState.innerHTML = `<p>${dict['excel-error-parse']}</p>`;
                    }
                };
                textReader.readAsText(file);
            } else {
                // Parse with SheetJS (xlsx, xls, ods)
                const data = new Uint8Array(e.target.result);
                workbook = XLSX.read(data, { type: 'array', codepage: 65001 });

                const sheetNames = workbook.SheetNames;
                if (!sheetNames || sheetNames.length === 0) {
                    const dict = localDict[getCurrentLang()] || localDict['en'];
                    alert(dict['excel-no-sheets']);
                    return;
                }

                // Build sheet tabs
                sheetGroup.style.display = 'block';
                sheetTabs.innerHTML = sheetNames.map((name, idx) =>
                    `<button class="sheet-tab ${idx === 0 ? 'active' : ''}" data-sheet="${name}">${escapeHtml(name)}</button>`
                ).join('');

                // Add click handlers
                document.querySelectorAll('.sheet-tab').forEach(tab => {
                    tab.addEventListener('click', () => {
                        loadSheet(tab.dataset.sheet);
                    });
                });

                filterGroup.style.display = 'block';

                // Load first sheet
                loadSheet(sheetNames[0]);
            }
        };
        bufferReader.readAsArrayBuffer(file);
    }

    // ======================================================================
    // DROPZONE SETUP
    // ======================================================================
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', e => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });

    // ======================================================================
    // FILTER
    // ======================================================================
    filterInput.addEventListener('input', () => {
        if (currentHeaders.length > 0) {
            renderTable(currentHeaders, currentData, filterInput.value);
        }
    });

    // ======================================================================
    // EXPORT CSV
    // ======================================================================
    btnExportCsv.addEventListener('click', () => {
        if (currentHeaders.length === 0) return;
        let csv = currentHeaders.map(h => '"' + String(h).replace(/"/g, '""') + '"').join(',') + '\n';
        csv += currentData.map(row => {
            return currentHeaders.map((_, idx) => {
                const val = row[idx] !== undefined ? String(row[idx]) : '';
                return '"' + val.replace(/"/g, '""') + '"';
            }).join(',');
        }).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (fileInfoData.name ? fileInfoData.name.replace(/\.[^.]+$/, '') : 'data') + '.csv';
        a.click();
        URL.revokeObjectURL(url);
    });

    // ======================================================================
    // EXPORT JSON
    // ======================================================================
    btnExportJson.addEventListener('click', () => {
        if (currentHeaders.length === 0) return;
        const json = currentData.map(row => {
            const obj = {};
            currentHeaders.forEach((h, idx) => {
                obj[h] = row[idx] !== undefined ? row[idx] : '';
            });
            return obj;
        });
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (fileInfoData.name ? fileInfoData.name.replace(/\.[^.]+$/, '') : 'data') + '.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    // ======================================================================
    // EXPORT SUPPORTING FUNCTIONS FOR DRAG ON DROP (re-attach)
    // ======================================================================
    // (Re-setup was handled above.)

    // ======================================================================
    // INIT
    // ======================================================================
    applyLocalTranslation(getCurrentLang());
    window.addEventListener('languageChanged', e => {
        applyLocalTranslation(e.detail?.lang || getCurrentLang());
        if (currentHeaders.length > 0) {
            renderTable(currentHeaders, currentData, filterInput.value);
        }
    });
})();