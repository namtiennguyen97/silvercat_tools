// Page-specific dictionary
const localDictionary = {
    vi: {
        "encoder-h1": "Mã Hóa & <span class=\"text-gradient-pink\">Giải Mã Văn Bản</span>",
        "encoder-subtitle": "Mã hóa và giải mã chuỗi văn bản trực tuyến miễn phí. Hỗ trợ các định dạng tiêu chuẩn như Base64, URL percent-encoding, HTML Entities, Hexadecimal, Binary và ROT13.",
        "input-placeholder": "Nhập chuỗi văn bản cần mã hóa hoặc giải mã tại đây...",
        "output-placeholder": "Kết quả sau khi mã hóa/giải mã sẽ hiển thị tại đây...",
        "btn-load-sample": "Văn Bản Mẫu",
        "panel-input-title": "Văn Bản Gốc (Input)",
        "panel-output-title": "Kết Quả Xử Lý (Output)",
        "lbl-controls-title": "Lựa Chọn Bộ Giải Mã / Mã Hóa (Codecs)",
        "sample-text": "Silver Cat Tools - Cổng tiện ích Micro-SaaS đỉnh cao!"
    },
    en: {
        "encoder-h1": "Text Encoder & <span class=\"text-gradient-pink\">Decoder Suite</span>",
        "encoder-subtitle": "Encode and decode string sequences instantly. Supports industry-standard formats including Base64, URL percent-encoding, HTML Entities, Hexadecimal, Binary and ROT13.",
        "input-placeholder": "Enter text to encode or decode here...",
        "output-placeholder": "Processed results will appear here...",
        "btn-load-sample": "Load Sample",
        "panel-input-title": "Raw Input Text",
        "panel-output-title": "Processed Output",
        "lbl-controls-title": "Choose Encoding / Decoding Operations (Codecs)",
        "sample-text": "Silver Cat Tools - The ultimate Micro-SaaS utility portal!"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('input-text');
    const outputArea = document.getElementById('output-text');
    
    const btnLoadSample = document.getElementById('btn-load-sample');
    const btnClearAll = document.getElementById('btn-clear-all');
    
    const btnCopyOutput = document.getElementById('btn-copy-output');
    const btnDownloadOutput = document.getElementById('btn-download-output');

    // Tab toggles for mobile
    const tabBtnInput = document.getElementById('tab-btn-input');
    const tabBtnOutput = document.getElementById('tab-btn-output');
    const panels = document.querySelectorAll('.tool-panel');

    // 1. Language Swapping
    function getLang() {
        return window.getCurrentLang ? window.getCurrentLang() : 'vi';
    }

    function applyLocalTranslation() {
        const lang = getLang();
        const dict = localDictionary[lang];
        
        document.getElementById('local-title').innerHTML = dict["encoder-h1"];
        document.getElementById('local-subtitle').textContent = dict["encoder-subtitle"];
        inputArea.placeholder = dict["input-placeholder"];
        outputArea.placeholder = dict["output-placeholder"];
        btnLoadSample.textContent = dict["btn-load-sample"];
        
        document.getElementById('panel-input-title').innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg> ${dict["panel-input-title"]}`;
        document.getElementById('panel-output-title').innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg> ${dict["panel-output-title"]}`;
        
        document.getElementById('lbl-controls-title').textContent = dict["lbl-controls-title"];
    }

    window.addEventListener('languageChanged', () => {
        applyLocalTranslation();
    });

    // 2. Action triggers
    btnLoadSample.addEventListener('click', () => {
        const lang = getLang();
        inputArea.value = localDictionary[lang]["sample-text"];
    });

    btnClearAll.addEventListener('click', () => {
        inputArea.value = '';
        outputArea.value = '';
    });

    // 3. Document operations
    btnCopyOutput.addEventListener('click', () => {
        const text = outputArea.value;
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            btnCopyOutput.classList.add('success');
            const dict = i18nDictionary[getLang()];
            btnCopyOutput.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> ${dict['btn-copy-success']}`;
            setTimeout(() => {
                btnCopyOutput.classList.remove('success');
                btnCopyOutput.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg> <span>${dict['btn-copy']}</span>`;
            }, 2000);
        });
    });

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

    // 4. Mobile tabs Toggling
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

    // 5. Codecs Engines
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

            // Automatically switch to output tab on mobile for instant UX feedback
            if (window.innerWidth <= 992) {
                tabBtnOutput.click();
            }

        } catch (err) {
            outputArea.value = getLang() === 'vi' ? 
                `[LỖI] Chuỗi đầu vào không hợp lệ với bộ giải mã này.\nChi tiết: ${err.message}` : 
                `[ERROR] Invalid input string for this decoder.\nDetails: ${err.message}`;
            
            if (window.innerWidth <= 992) {
                tabBtnOutput.click();
            }
        }
    }

    // Bind Codec Button listeners
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

    // Init translations
    setTimeout(() => {
        applyLocalTranslation();
    }, 100);
});
