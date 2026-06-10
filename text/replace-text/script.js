document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('input-text');
    const outputArea = document.getElementById('output-text');
    
    const searchInput = document.getElementById('search-term');
    const replaceInput = document.getElementById('replace-term');
    
    const caseCheckbox = document.getElementById('option-case');
    const regexCheckbox = document.getElementById('option-regex');
    
    const btnReplace = document.getElementById('btn-replace');
    const btnClear = document.getElementById('btn-clear');
    const btnCopy = document.getElementById('btn-copy');
    const btnDownload = document.getElementById('btn-download');

    // Quick Preset Buttons
    const presetSpaces = document.getElementById('preset-spaces');
    const presetLines = document.getElementById('preset-lines');
    const presetUnaccent = document.getElementById('preset-unaccent');
    const presetUpper = document.getElementById('preset-upper');
    const presetLower = document.getElementById('preset-lower');
    const presetCapitalize = document.getElementById('preset-capitalize');
    const presetSentence = document.getElementById('preset-sentence');
    const presetStripHtml = document.getElementById('preset-strip-html');
    const presetStripNum = document.getElementById('preset-strip-num');
    const presetStripSymbols = document.getElementById('preset-strip-symbols');

    // Text Stats Helpers
    const inputStats = document.getElementById('input-stats');
    const outputStats = document.getElementById('output-stats');

    // 1. Text Stats Updating (Localized)
    function updateStats(text, element) {
        const charCount = text.length;
        const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        const lang = window.getCurrentLang ? window.getCurrentLang() : 'vi';
        if (lang === 'vi') {
            element.textContent = `${charCount} characters | ${wordCount} words`;
        } else {
            element.textContent = `${charCount} chars | ${wordCount} words`;
        }
    }

    inputArea.addEventListener('input', () => {
        updateStats(inputArea.value, inputStats);
    });

    // Helper function to remove accents
    function removeVietnameseAccents(text) {
        let processed = text;
        processed = processed.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        processed = processed.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        processed = processed.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        processed = processed.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        processed = processed.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        processed = processed.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        processed = processed.replace(/đ/g, "d");
        
        processed = processed.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        processed = processed.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        processed = processed.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        processed = processed.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        processed = processed.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        processed = processed.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        processed = processed.replace(/Đ/g, "D");
        return processed;
    }

    // 2. Preset Template Toggle Logic with Mutual Exclusions
    presetSpaces.addEventListener('click', () => presetSpaces.classList.toggle('selected'));
    presetLines.addEventListener('click', () => presetLines.classList.toggle('selected'));
    presetUnaccent.addEventListener('click', () => presetUnaccent.classList.toggle('selected'));
    presetStripHtml.addEventListener('click', () => presetStripHtml.classList.toggle('selected'));
    presetStripNum.addEventListener('click', () => presetStripNum.classList.toggle('selected'));
    presetStripSymbols.addEventListener('click', () => presetStripSymbols.classList.toggle('selected'));

    presetSentence.addEventListener('click', () => {
        const wasSelected = presetSentence.classList.contains('selected');
        if (!wasSelected) {
            presetSentence.classList.add('selected');
            presetUpper.classList.remove('selected');
            presetLower.classList.remove('selected');
            presetCapitalize.classList.remove('selected');
        } else {
            presetSentence.classList.remove('selected');
        }
    });

    presetUpper.addEventListener('click', () => {
        const wasSelected = presetUpper.classList.contains('selected');
        if (!wasSelected) {
            presetUpper.classList.add('selected');
            presetLower.classList.remove('selected');
            presetCapitalize.classList.remove('selected');
            presetSentence.classList.remove('selected');
        } else {
            presetUpper.classList.remove('selected');
        }
    });

    presetLower.addEventListener('click', () => {
        const wasSelected = presetLower.classList.contains('selected');
        if (!wasSelected) {
            presetLower.classList.add('selected');
            presetUpper.classList.remove('selected');
            presetCapitalize.classList.remove('selected');
            presetSentence.classList.remove('selected');
        } else {
            presetLower.classList.remove('selected');
        }
    });

    presetCapitalize.addEventListener('click', () => {
        const wasSelected = presetCapitalize.classList.contains('selected');
        if (!wasSelected) {
            presetCapitalize.classList.add('selected');
            presetUpper.classList.remove('selected');
            presetLower.classList.remove('selected');
            presetSentence.classList.remove('selected');
        } else {
            presetCapitalize.classList.remove('selected');
        }
    });

    // 3. Mobile view tab panel switcher
    const tabButtons = document.querySelectorAll('.mobile-tab-btn');
    const panels = document.querySelectorAll('.tool-panel');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            panels.forEach(p => {
                if (p.id === targetId) {
                    p.classList.add('active-panel');
                } else {
                    p.classList.remove('active-panel');
                }
            });
        });
    });

    const autoSwitchToOutputTab = () => {
        if (window.innerWidth <= 992) {
            const tabBtnOutput = document.getElementById('tab-btn-output');
            if (tabBtnOutput) {
                tabBtnOutput.click();
                window.scrollTo({
                    top: document.querySelector('.tool-container').offsetTop - 20,
                    behavior: 'smooth'
                });
            }
        }
    };

    // 4. Core Find & Replace Execution Pipeline (with Integrated Presets)
    btnReplace.addEventListener('click', () => {
        const rawText = inputArea.value;
        const searchVal = searchInput.value;
        const replaceVal = replaceInput.value;

        if (!rawText) return;

        let processedText = rawText;

        // A. Run Find & Replace if Search Term is provided
        if (searchVal) {
            try {
                if (regexCheckbox.checked) {
                    const flags = caseCheckbox.checked ? 'g' : 'gi';
                    const re = new RegExp(searchVal, flags);
                    processedText = processedText.replace(re, replaceVal);
                } else {
                    if (caseCheckbox.checked) {
                        processedText = processedText.split(searchVal).join(replaceVal);
                    } else {
                        const escapedSearch = searchVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const re = new RegExp(escapedSearch, 'gi');
                        processedText = processedText.replace(re, replaceVal);
                    }
                }
            } catch (error) {
                const alertMsg = window.getCurrentLang && window.getCurrentLang() === 'en' 
                    ? 'Invalid RegEx syntax: ' 
                    : 'Invalid RegEx expression error: ';
                alert(alertMsg + error.message);
                return;
            }
        }

        // B. Run Spacing & Casing Presets in sequence
        // spaces
        if (presetSpaces.classList.contains('selected')) {
            processedText = processedText.replace(/[ \t]+/g, ' ').replace(/^[ \t]+/gm, '').replace(/[ \t]+$/gm, '');
        }

        // lines
        if (presetLines.classList.contains('selected')) {
            processedText = processedText.replace(/^\s*[\r\n]/gm, '');
        }

        // html tags
        if (presetStripHtml.classList.contains('selected')) {
            processedText = processedText.replace(/<\/?[^>]+(>|$)/g, "");
        }

        // digits
        if (presetStripNum.classList.contains('selected')) {
            processedText = processedText.replace(/[0-9]/g, "");
        }

        // accents
        if (presetUnaccent.classList.contains('selected')) {
            processedText = removeVietnameseAccents(processedText);
        }

        // special symbols
        if (presetStripSymbols.classList.contains('selected')) {
            processedText = processedText.replace(/[^\w\s\d\u00C0-\u1EF9]/g, "");
        }

        // uppercase
        if (presetUpper.classList.contains('selected')) {
            processedText = processedText.toUpperCase();
        }

        // lowercase
        else if (presetLower.classList.contains('selected')) {
            processedText = processedText.toLowerCase();
        }

        // capitalize words
        else if (presetCapitalize.classList.contains('selected')) {
            processedText = processedText.replace(/\b\w/g, char => char.toUpperCase());
        }

        // sentence casing
        else if (presetSentence.classList.contains('selected')) {
            processedText = processedText.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z\u00C0-\u1EF9])/g, (m, p1, p2) => p1 + p2.toUpperCase());
        }

        outputArea.value = processedText;
        updateStats(processedText, outputStats);
        autoSwitchToOutputTab();
    });

    // 5. Clear All Action
    btnClear.addEventListener('click', () => {
        inputArea.value = '';
        outputArea.value = '';
        searchInput.value = '';
        replaceInput.value = '';
        
        // Deselect all presets
        const presetsList = [
            presetSpaces, presetLines, presetUnaccent, 
            presetUpper, presetLower, presetCapitalize, 
            presetSentence, presetStripHtml, presetStripNum, presetStripSymbols
        ];
        presetsList.forEach(p => {
            if (p) p.classList.remove('selected');
        });

        updateStats('', inputStats);
        updateStats('', outputStats);
    });

    // 6. Copy to Clipboard with Success Micro-animation
    btnCopy.addEventListener('click', () => {
        const textToCopy = outputArea.value;
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            btnCopy.classList.add('success');
            
            const successText = i18nDictionary[window.getCurrentLang ? window.getCurrentLang() : 'vi']['btn-copy-success'];
            const normalText = i18nDictionary[window.getCurrentLang ? window.getCurrentLang() : 'vi']['btn-copy'];

            btnCopy.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                ${successText}
            `;

            setTimeout(() => {
                btnCopy.classList.remove('success');
                btnCopy.innerHTML = `
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    ${normalText}
                `;
            }, 2000);
        });
    });

    // 7. Download Output Text as File (.txt)
    btnDownload.addEventListener('click', () => {
        const textToSave = outputArea.value;
        if (!textToSave) return;

        const blob = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'silver-cat-text-processed.txt';
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});
