document.addEventListener('DOMContentLoaded', () => {
    const dataInput = document.getElementById('data-input');
    const dataOutput = document.getElementById('data-output');
    const btnConvert = document.getElementById('btn-convert');
    const btnCopy = document.getElementById('btn-copy-output');
    const btnDownload = document.getElementById('btn-download-output');
    const btnClear = document.getElementById('btn-clear-data');
    const csvOptions = document.getElementById('csv-options');

    // Mode buttons
    const modeSqlJson = document.getElementById('mode-sql-json');
    const modeCsvMd = document.getElementById('mode-csv-md');
    const modeJsonCsv = document.getElementById('mode-json-csv');

    let currentMode = 'sql-json';

    // Mobile tabs
    const tabInput = document.querySelector('[data-target="panel-input"]');
    const tabOutput = document.querySelector('[data-target="panel-output"]');
    const panelInput = document.getElementById('panel-input');
    const panelOutput = document.getElementById('panel-output');

    if (tabInput && tabOutput) {
        tabInput.addEventListener('click', () => {
            tabInput.classList.add('active'); tabOutput.classList.remove('active');
            panelInput.classList.add('active-panel'); panelOutput.classList.remove('active-panel');
        });
        tabOutput.addEventListener('click', () => {
            tabOutput.classList.add('active'); tabInput.classList.remove('active');
            panelOutput.classList.add('active-panel'); panelInput.classList.remove('active-panel');
        });
    }

    function setMode(mode) {
        currentMode = mode;
        modeSqlJson.classList.toggle('active', mode === 'sql-json');
        modeCsvMd.classList.toggle('active', mode === 'csv-md');
        modeJsonCsv.classList.toggle('active', mode === 'json-csv');
        csvOptions.style.display = mode === 'csv-md' ? 'block' : 'none';
    }

    modeSqlJson.addEventListener('click', () => setMode('sql-json'));
    modeCsvMd.addEventListener('click', () => setMode('csv-md'));
    modeJsonCsv.addEventListener('click', () => setMode('json-csv'));

    // Convert
    btnConvert.addEventListener('click', runConversion);

    function runConversion() {
        const input = dataInput.value.trim();
        if (!input) {
            dataOutput.value = 'Please paste some data to convert.';
            return;
        }

        try {
            let result = '';
            if (currentMode === 'sql-json') {
                result = sqlToJson(input);
            } else if (currentMode === 'csv-md') {
                const delimiter = document.getElementById('csv-delimiter').value;
                const hasHeader = document.getElementById('csv-has-header').checked;
                const realDelim = delimiter === '\\t' ? '\t' : delimiter;
                result = csvToMarkdown(input, realDelim, hasHeader);
            } else if (currentMode === 'json-csv') {
                result = jsonArrayToCsv(input);
            }
            dataOutput.value = result;
        } catch (e) {
            dataOutput.value = 'Conversion Error: ' + e.message;
        }

        if (window.innerWidth <= 992 && tabOutput) {
            tabOutput.click();
        }
    }

    // SQL INSERT → JSON
    function sqlToJson(sqlText) {
        // Parse SQL INSERT statements
        // Pattern: INSERT INTO table_name (col1, col2, ...) VALUES (val1, val2, ...);
        const results = [];
        const lines = sqlText.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('--') || trimmed.startsWith('#')) continue;

            // Match INSERT INTO ... VALUES
            const insertMatch = trimmed.match(/INSERT\s+INTO\s+\S+\s*\(([^)]+)\)\s*VALUES\s*\((.+)\)\s*;?\s*$/i);
            if (!insertMatch) continue;

            const cols = insertMatch[1].split(',').map(c => c.trim().replace(/`/g, '').replace(/'/g, '').replace(/"/g, ''));
            const valsRaw = insertMatch[2];

            // Parse values (handle quoted strings with commas inside)
            const vals = parseSqlValues(valsRaw);

            const obj = {};
            cols.forEach((col, i) => {
                let val = vals[i] ? vals[i].trim() : '';
                // Try to convert to appropriate type
                if (val === 'NULL' || val === 'null') {
                    obj[col] = null;
                } else if (val === 'TRUE' || val === 'true') {
                    obj[col] = true;
                } else if (val === 'FALSE' || val === 'false') {
                    obj[col] = false;
                } else if (/^-?\d+$/g.test(val)) {
                    obj[col] = parseInt(val);
                } else if (/^-?\d+\.\d+$/g.test(val)) {
                    obj[col] = parseFloat(val);
                } else {
                    // Remove surrounding quotes
                    val = val.replace(/^['"]|['"]$/g, '');
                    obj[col] = val;
                }
            });
            results.push(obj);
        }
        return JSON.stringify(results, null, 2);
    }

    function parseSqlValues(valsStr) {
        const vals = [];
        let current = '';
        let inQuote = false;
        let quoteChar = '';

        for (let i = 0; i < valsStr.length; i++) {
            const ch = valsStr[i];
            if ((ch === "'" || ch === '"') && !inQuote) {
                inQuote = true;
                quoteChar = ch;
                current += ch;
            } else if (ch === quoteChar && inQuote) {
                inQuote = false;
                quoteChar = '';
                current += ch;
            } else if (ch === ',' && !inQuote) {
                vals.push(current);
                current = '';
            } else {
                current += ch;
            }
        }
        if (current) vals.push(current);
        return vals;
    }

    // CSV → Markdown Table
    function csvToMarkdown(csvText, delimiter, hasHeader) {
        const lines = csvText.split('\n').filter(l => l.trim());
        if (lines.length === 0) return '';

        const rows = lines.map(line => parseCsvLine(line, delimiter));

        // Ensure consistent column count
        const maxCols = Math.max(...rows.map(r => r.length));
        const normalized = rows.map(r => {
            while (r.length < maxCols) r.push('');
            return r.slice(0, maxCols);
        });

        let md = '';
        const startRow = hasHeader ? 1 : 0;
        const dataStart = hasHeader ? 0 : -1;

        if (hasHeader) {
            const header = normalized[0];
            md += '| ' + header.join(' | ') + ' |\n';
        } else if (normalized.length > 0) {
            // Generate default headers (Col 1, Col 2, ...)
            const defaultHeaders = normalized[0].map((_, i) => `Column ${i + 1}`);
            md += '| ' + defaultHeaders.join(' | ') + ' |\n';
        }

        // Separator
        const separator = normalized[0].map(() => '---').join(' | ');
        md += '| ' + separator + ' |\n';

        // Data rows
        for (let i = startRow; i < normalized.length; i++) {
            md += '| ' + normalized[i].join(' | ') + ' |\n';
        }

        return md;
    }

    function parseCsvLine(line, delimiter) {
        const cols = [];
        let current = '';
        let inQuote = false;

        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"' && !inQuote) {
                inQuote = true;
            } else if (ch === '"' && inQuote) {
                if (i + 1 < line.length && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuote = false;
                }
            } else if (ch === delimiter && !inQuote) {
                cols.push(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }
        cols.push(current.trim());
        return cols;
    }

    // JSON Array → CSV
    function jsonArrayToCsv(jsonText) {
        const arr = JSON.parse(jsonText);
        if (!Array.isArray(arr) || arr.length === 0) {
            throw new Error('Input must be a non-empty JSON array of objects');
        }

        // Get all unique keys preserving order
        const keys = [];
        const keySet = new Set();
        arr.forEach(obj => {
            Object.keys(obj).forEach(k => {
                if (!keySet.has(k)) {
                    keySet.add(k);
                    keys.push(k);
                }
            });
        });

        // Header
        let csv = keys.join(',');

        // Rows
        arr.forEach(obj => {
            const row = keys.map(k => {
                let val = obj[k];
                if (val === null || val === undefined) return '';
                const str = String(val);
                // Quote if contains comma, newline, or quote
                if (str.includes(',') || str.includes('\n') || str.includes('"')) {
                    return '"' + str.replace(/"/g, '""') + '"';
                }
                return str;
            }).join(',');
            csv += row;
        });

        return csv;
    }

    // Copy
    btnCopy.addEventListener('click', () => {
        if (!dataOutput.value) return;
        navigator.clipboard.writeText(dataOutput.value).then(() => {
            btnCopy.textContent = 'Copied!';
            setTimeout(() => { btnCopy.textContent = 'Copy Output'; }, 2000);
        });
    });

    // Download
    btnDownload.addEventListener('click', () => {
        if (!dataOutput.value) return;
        const blob = new Blob([dataOutput.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentMode === 'sql-json' ? 'output.json' : currentMode === 'csv-md' ? 'table.md' : 'output.csv';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Clear
    btnClear.addEventListener('click', () => {
        dataInput.value = '';
        dataOutput.value = '';
    });

    // Sample Data
    document.getElementById('btn-sample-sql').addEventListener('click', () => {
        dataInput.value = SQL_SAMPLE;
        setMode('sql-json');
    });
    document.getElementById('btn-sample-csv').addEventListener('click', () => {
        dataInput.value = CSV_SAMPLE;
        setMode('csv-md');
    });
    document.getElementById('btn-sample-json').addEventListener('click', () => {
        dataInput.value = JSON_SAMPLE;
        setMode('json-csv');
    });
});

const SQL_SAMPLE = `INSERT INTO users (id, name, email, role, created_at) VALUES (1, 'John Doe', 'john@example.com', 'admin', '2026-01-15');
INSERT INTO users (id, name, email, role, created_at) VALUES (2, 'Jane Smith', 'jane@example.com', 'editor', '2026-02-20');
INSERT INTO users (id, name, email, role, created_at) VALUES (3, 'Bob Johnson', 'bob@example.com', 'viewer', '2026-03-10');
INSERT INTO users (id, name, email, role, created_at) VALUES (4, 'Alice Wong', 'alice@example.com', 'editor', '2026-03-15');
INSERT INTO users (id, name, email, role, created_at) VALUES (5, 'Charlie Brown', 'charlie@example.com', 'viewer', '2026-04-01');`;

const CSV_SAMPLE = `Product Name,Category,Price,Stock,Rating
Wireless Mouse,Electronics,29.99,150,4.5
Mechanical Keyboard,Electronics,89.99,75,4.8
USB-C Hub,Electronics,45.00,200,4.2
Monitor Stand,Office,34.99,90,4.6
Desk Lamp,Office,24.99,120,4.3`;

const JSON_SAMPLE = `[
  {"name": "John Doe", "email": "john@example.com", "role": "admin", "active": true},
  {"name": "Jane Smith", "email": "jane@example.com", "role": "editor", "active": true},
  {"name": "Bob Johnson", "email": "bob@example.com", "role": "viewer", "active": false},
  {"name": "Alice Wong", "email": "alice@example.com", "role": "editor", "active": true}
]`;