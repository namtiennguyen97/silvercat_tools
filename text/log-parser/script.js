document.addEventListener('DOMContentLoaded', () => {
    const logInput = document.getElementById('log-input');
    const logOutput = document.getElementById('log-output');
    const regexInput = document.getElementById('regex-input');
    const regexFlags = document.getElementById('regex-flags');
    const btnRun = document.getElementById('btn-run');
    const btnCopy = document.getElementById('btn-copy-result');
    const btnDownload = document.getElementById('btn-download-result');
    const btnClear = document.getElementById('btn-clear-all');

    const statLines = document.getElementById('stat-lines');
    const statSize = document.getElementById('stat-size');
    const statMatches = document.getElementById('stat-matches');
    const statUnique = document.getElementById('stat-unique');

    const regexStatusIcon = document.getElementById('regex-status-icon');
    const regexStatusMsg = document.getElementById('regex-status-msg');
    const regexError = document.getElementById('regex-error');

    // Mode buttons
    const modeFilter = document.getElementById('mode-filter');
    const modeExtract = document.getElementById('mode-extract');
    const modeReplace = document.getElementById('mode-replace');
    const replaceGroup = document.getElementById('replace-group');
    const replaceText = document.getElementById('replace-text');

    let currentMode = 'filter';

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

    // Mode switching
    modeFilter.addEventListener('click', () => {
        setMode('filter');
    });
    modeExtract.addEventListener('click', () => {
        setMode('extract');
    });
    modeReplace.addEventListener('click', () => {
        setMode('replace');
    });

    function setMode(mode) {
        currentMode = mode;
        modeFilter.classList.toggle('active', mode === 'filter');
        modeExtract.classList.toggle('active', mode === 'extract');
        modeReplace.classList.toggle('active', mode === 'replace');
        replaceGroup.style.display = mode === 'replace' ? 'block' : 'none';
    }

    // Update input stats on typing
    logInput.addEventListener('input', updateStats);
    logInput.addEventListener('paste', () => setTimeout(updateStats, 100));

    function updateStats() {
        const text = logInput.value;
        const lines = text ? text.split('\n').length : 0;
        const bytes = new Blob([text]).size;
        statLines.textContent = lines.toLocaleString();
        statSize.textContent = formatBytes(bytes);
    }

    // Live regex validation
    let validateTimer;
    regexInput.addEventListener('input', () => {
        clearTimeout(validateTimer);
        validateTimer = setTimeout(validateRegex, 300);
    });
    regexFlags.addEventListener('change', validateRegex);

    function validateRegex() {
        const pattern = regexInput.value.trim();
        regexError.style.display = 'none';
        regexStatusIcon.style.display = 'none';

        if (!pattern) {
            regexStatusMsg.textContent = 'Enter a regex pattern to filter or extract data';
            regexStatusMsg.style.color = 'var(--text-muted)';
            return;
        }

        try {
            new RegExp(pattern, regexFlags.value);
            regexStatusIcon.style.display = 'inline';
            regexStatusIcon.textContent = '✅';
            regexStatusMsg.textContent = 'Pattern is valid';
            regexStatusMsg.style.color = '#34d399';
        } catch (e) {
            regexError.style.display = 'inline';
            regexError.textContent = 'Syntax Error: ' + e.message;
            regexStatusMsg.textContent = '';
        }
    }

    // Run filter
    btnRun.addEventListener('click', runFilter);
    // Also run on Enter in regex input
    regexInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            runFilter();
        }
    });

    function runFilter() {
        const text = logInput.value;
        const pattern = regexInput.value.trim();

        if (!text) {
            logOutput.value = 'Please paste some log data first.';
            return;
        }
        if (!pattern) {
            logOutput.value = 'Please enter a regex pattern.';
            return;
        }

        let regex;
        try {
            regex = new RegExp(pattern, regexFlags.value);
        } catch (e) {
            logOutput.value = 'Regex Error: ' + e.message;
            return;
        }

        const lines = text.split('\n');
        const results = [];
        const uniqueSet = new Set();

        if (currentMode === 'filter') {
            // Show lines that match the regex
            for (const line of lines) {
                if (regex.test(line)) {
                    results.push(line);
                    uniqueSet.add(line);
                }
            }
            logOutput.value = results.join('\n');

        } else if (currentMode === 'extract') {
            // Extract all regex matches (global match across entire text)
            const matches = [];
            // Reset regex lastIndex
            regex.lastIndex = 0;
            
            // For each line, find all matches
            for (const line of lines) {
                const lineRegex = new RegExp(pattern, regexFlags.value);
                let match;
                while ((match = lineRegex.exec(line)) !== null) {
                    const val = match[1] !== undefined ? match[1] : match[0];
                    matches.push(val);
                    uniqueSet.add(val);
                    if (match.index === lineRegex.lastIndex) lineRegex.lastIndex++;
                }
            }
            logOutput.value = matches.join('\n');

        } else if (currentMode === 'replace') {
            const replacement = replaceText.value || '';
            const replaced = [];
            for (const line of lines) {
                const newLine = line.replace(regex, replacement);
                if (newLine !== line) {
                    uniqueSet.add(newLine);
                }
                replaced.push(newLine);
            }
            logOutput.value = replaced.join('\n');
        }

        // Update stats
        statMatches.textContent = results.length || logOutput.value.split('\n').length;
        statUnique.textContent = uniqueSet.size;

        // Auto-switch to output on mobile
        if (window.innerWidth <= 992 && tabOutput) {
            tabOutput.click();
        }
    }

    // Format bytes
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Copy result
    btnCopy.addEventListener('click', () => {
        if (!logOutput.value) return;
        navigator.clipboard.writeText(logOutput.value).then(() => {
            btnCopy.textContent = 'Copied!';
            setTimeout(() => { btnCopy.textContent = 'Copy Result'; }, 2000);
        });
    });

    // Download result
    btnDownload.addEventListener('click', () => {
        if (!logOutput.value) return;
        const blob = new Blob([logOutput.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'log-filtered-result.txt';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Clear all
    btnClear.addEventListener('click', () => {
        logInput.value = '';
        logOutput.value = '';
        regexInput.value = '';
        statLines.textContent = '0';
        statSize.textContent = '0 KB';
        statMatches.textContent = '0';
        statUnique.textContent = '0';
    });

    // Sample data - Apache log
    document.getElementById('btn-load-sample').addEventListener('click', () => {
        logInput.value = APACHE_LOG_SAMPLE;
        updateStats();
        regexInput.value = '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b';
        regexFlags.value = 'gm';
        validateRegex();
    });

    // Sample data - Nginx log
    document.getElementById('btn-load-nginx').addEventListener('click', () => {
        logInput.value = NGINX_LOG_SAMPLE;
        updateStats();
        regexInput.value = '"GET [^"]*"';
        regexFlags.value = 'gm';
        validateRegex();
    });

    // Sample data - JSON log
    document.getElementById('btn-load-json').addEventListener('click', () => {
        logInput.value = JSON_LOG_SAMPLE;
        updateStats();
        regexInput.value = '"level":\\s*"error"';
        regexFlags.value = 'gim';
        validateRegex();
    });

    // Initial stats
    updateStats();
});

const APACHE_LOG_SAMPLE = `192.168.1.1 - - [15/Mar/2026:10:23:45 +0000] "GET /index.html HTTP/1.1" 200 2326 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
192.168.1.2 - - [15/Mar/2026:10:23:46 +0000] "POST /api/login HTTP/1.1" 200 128 "-" "curl/7.68.0"
192.168.1.1 - - [15/Mar/2026:10:23:47 +0000] "GET /css/style.css HTTP/1.1" 304 0 "https://example.com/" "Mozilla/5.0"
10.0.0.5 - admin [15/Mar/2026:10:23:48 +0000] "GET /admin/dashboard HTTP/1.1" 200 4567 "-" "Mozilla/5.0"
192.168.1.3 - - [15/Mar/2026:10:23:49 +0000] "GET /api/users HTTP/1.1" 500 256 "-" "PostmanRuntime/7.28"
10.0.0.5 - admin [15/Mar/2026:10:23:50 +0000] "POST /admin/settings HTTP/1.1" 302 0 "https://example.com/admin/dashboard" "Mozilla/5.0"
192.168.1.1 - - [15/Mar/2026:10:23:51 +0000] "GET /favicon.ico HTTP/1.1" 404 196 "https://example.com/" "Mozilla/5.0"
172.16.0.8 - - [15/Mar/2026:10:23:52 +0000] "GET /api/products?page=2 HTTP/1.1" 200 12345 "-" "axios/0.27.2"
192.168.1.2 - - [15/Mar/2026:10:23:53 +0000] "DELETE /api/session HTTP/1.1" 204 0 "-" "Mozilla/5.0"
192.168.1.4 - - [15/Mar/2026:10:23:54 +0000] "GET /images/logo.png HTTP/1.1" 200 8192 "https://example.com/" "Mozilla/5.0"`;

const NGINX_LOG_SAMPLE = `2026-03-15T10:23:45+00:00 192.168.1.1 "GET /api/v1/health HTTP/1.1" 200 15 "-" "kube-probe/1.24" 0.002
2026-03-15T10:23:46+00:00 192.168.1.2 "GET /api/v1/users/12345 HTTP/1.1" 200 2341 "-" "Mozilla/5.0" 0.045
2026-03-15T10:23:47+00:00 10.0.0.5 "POST /api/v1/orders HTTP/1.1" 201 512 "-" "PostmanRuntime/7.28" 0.231
2026-03-15T10:23:48+00:00 192.168.1.1 "GET /api/v1/health HTTP/1.1" 200 15 "-" "kube-probe/1.24" 0.001
2026-03-15T10:23:49+00:00 172.16.0.8 "GET /api/v1/products?category=electronics HTTP/1.1" 200 8765 "-" "Mozilla/5.0" 0.078
2026-03-15T10:23:50+00:00 192.168.1.3 "PUT /api/v1/users/12345 HTTP/1.1" 400 98 "-" "axios/0.27.2" 0.012
2026-03-15T10:23:51+00:00 10.0.0.5 "GET /api/v1/admin/stats HTTP/1.1" 403 45 "-" "Mozilla/5.0" 0.005
2026-03-15T10:23:52+00:00 192.168.1.2 "DELETE /api/v1/orders/789 HTTP/1.1" 204 0 "-" "Mozilla/5.0" 0.034
2026-03-15T10:23:53+00:00 192.168.1.1 "GET /api/v1/health HTTP/1.1" 200 15 "-" "kube-probe/1.24" 0.001
2026-03-15T10:23:54+00:00 172.16.0.8 "POST /api/v1/payments HTTP/1.1" 500 128 "-" "Mozilla/5.0" 1.234`;

const JSON_LOG_SAMPLE = `{"timestamp":"2026-03-15T10:23:45.123Z","level":"info","service":"auth-service","message":"User login successful","userId":"usr_12345","ip":"192.168.1.1"}
{"timestamp":"2026-03-15T10:23:46.456Z","level":"info","service":"api-gateway","message":"Request processed","path":"/api/products","statusCode":200,"duration_ms":45}
{"timestamp":"2026-03-15T10:23:47.789Z","level":"warn","service":"db-connector","message":"Connection pool at 85% capacity","poolSize":100,"active":85}
{"timestamp":"2026-03-15T10:23:48.012Z","level":"error","service":"payment-service","message":"Payment gateway timeout","orderId":"ord_789","gateway":"stripe","duration_ms":30000}
{"timestamp":"2026-03-15T10:23:49.345Z","level":"info","service":"cache-service","message":"Cache warmed successfully","keys":12456,"memory_mb":512}
{"timestamp":"2026-03-15T10:23:50.678Z","level":"error","service":"auth-service","message":"Invalid token provided","ip":"10.0.0.5","reason":"expired_token"}
{"timestamp":"2026-03-15T10:23:51.901Z","level":"info","service":"api-gateway","message":"Request processed","path":"/api/orders","statusCode":201,"duration_ms":231}
{"timestamp":"2026-03-15T10:23:52.234Z","level":"warn","service":"rate-limiter","message":"Rate limit approaching for IP","ip":"172.16.0.8","current":95,"limit":100}
{"timestamp":"2026-03-15T10:23:53.567Z","level":"error","service":"db-connector","message":"Query execution failed","query":"SELECT * FROM transactions","error":"timeout after 5000ms"}
{"timestamp":"2026-03-15T10:23:54.890Z","level":"info","service":"notification","message":"Email sent to user","userId":"usr_12345","template":"order_confirmation"}`;