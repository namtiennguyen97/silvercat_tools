const SAMPLE_TEXT = "Silver Cat Tools - The ultimate Micro-SaaS utility portal!";

document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('input-text');
    const outputArea = document.getElementById('output-text');

    const btnLoadSample = document.getElementById('btn-load-sample');
    const btnClearAll = document.getElementById('btn-clear-all');

    const btnCopyOutput = document.getElementById('btn-copy-output');
    const btnDownloadOutput = document.getElementById('btn-download-output');

    const tabBtnInput = document.getElementById('tab-btn-input');
    const tabBtnOutput = document.getElementById('tab-btn-output');
    const panels = document.querySelectorAll('.tool-panel');

    // Action triggers
    btnLoadSample.addEventListener('click', () => {
        inputArea.value = SAMPLE_TEXT;
    });

    btnClearAll.addEventListener('click', () => {
        inputArea.value = '';
        outputArea.value = '';
    });

    // Copy
    btnCopyOutput.addEventListener('click', () => {
        const text = outputArea.value;
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            btnCopyOutput.classList.add('success');
            btnCopyOutput.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Copied!';
            setTimeout(() => {
                btnCopyOutput.classList.remove('success');
                btnCopyOutput.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg> <span>Copy</span>';
            }, 2000);
        });
    });

    // Download
    btnDownloadOutput.addEventListener('click', () => {
        const text = outputArea.value;
        if (!text) return;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'silver-cat-codec-output.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Mobile tabs
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

    // Codec Engines
    function handleCodec(action) {
        const input = inputArea.value;
        if (!input) {
            outputArea.value = '';
            return;
        }

        try {
            let result = '';
            switch (action) {
                case 'b64-enc':
                    result = btoa(unescape(encodeURIComponent(input)));
                    break;
                case 'b64-dec':
                    result = decodeURIComponent(escape(atob(input)));
                    break;
                case 'url-enc':
                    result = encodeURIComponent(input);
                    break;
                case 'url-dec':
                    result = decodeURIComponent(input);
                    break;
                case 'html-enc':
                    const divEnc = document.createElement('div');
                    divEnc.textContent = input;
                    result = divEnc.innerHTML;
                    break;
                case 'html-dec':
                    const divDec = document.createElement('div');
                    divDec.innerHTML = input;
                    result = divDec.textContent;
                    break;
                case 'hex-enc':
                    result = Array.from(input)
                        .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
                        .join(' ');
                    break;
                case 'hex-dec':
                    const cleanHex = input.replace(/\s+/g, '');
                    const bytes = [];
                    for (let i = 0; i < cleanHex.length; i += 2) {
                        bytes.push(parseInt(cleanHex.substr(i, 2), 16));
                    }
                    result = String.fromCharCode(...bytes);
                    break;
                case 'bin-enc':
                    result = Array.from(input)
                        .map(c => c.charCodeAt(0).toString(2).padStart(8, '0'))
                        .join(' ');
                    break;
                case 'bin-dec':
                    const cleanBin = input.replace(/\s+/g, '');
                    const binBytes = [];
                    for (let i = 0; i < cleanBin.length; i += 8) {
                        binBytes.push(parseInt(cleanBin.substr(i, 8), 2));
                    }
                    result = String.fromCharCode(...binBytes);
                    break;
                case 'rot13':
                    result = input.replace(/[a-zA-Z]/g, c => {
                        return String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
                    });
                    break;
            }
            outputArea.value = result;

            if (window.innerWidth <= 992) {
                tabBtnOutput.click();
            }

        } catch (err) {
            outputArea.value = '[ERROR] Invalid input string for this decoder.\nDetails: ' + err.message;

            if (window.innerWidth <= 992) {
                tabBtnOutput.click();
            }
        }
    }

    // Bind Codec Buttons
    document.getElementById('btn-b64-enc').addEventListener('click', () => handleCodec('b64-enc'));
    document.getElementById('btn-b64-dec').addEventListener('click', () => handleCodec('b64-dec'));
    document.getElementById('btn-url-enc').addEventListener('click', () => handleCodec('url-enc'));
    document.getElementById('btn-url-dec').addEventListener('click', () => handleCodec('url-dec'));
    document.getElementById('btn-html-enc').addEventListener('click', () => handleCodec('html-enc'));
    document.getElementById('btn-html-dec').addEventListener('click', () => handleCodec('html-dec'));
    document.getElementById('btn-hex-enc').addEventListener('click', () => handleCodec('hex-enc'));
    document.getElementById('btn-hex-dec').addEventListener('click', () => handleCodec('hex-dec'));
    document.getElementById('btn-bin-enc').addEventListener('click', () => handleCodec('bin-enc'));
    document.getElementById('btn-bin-dec').addEventListener('click', () => handleCodec('bin-dec'));
    document.getElementById('btn-rot13').addEventListener('click', () => handleCodec('rot13'));
});