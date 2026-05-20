// Local Dictionary for page-specific elements
const localDictionary = {
    vi: {
        "word-counter-h1": "Bộ Đếm Từ & <span class=\"text-gradient-purple\">Phân Tích Văn Bản</span>",
        "word-counter-subtitle": "Đếm số từ, ký tự chuyên nghiệp thời gian thực. Phân tích mật độ từ khóa, thời gian đọc và đánh giá chỉ số dễ đọc của văn bản trực quan.",
        "input-placeholder": "Bắt đầu gõ hoặc dán văn bản của bạn vào đây...",
        "stat-words": "Số từ",
        "stat-chars": "Ký tự (có cách)",
        "stat-chars-no-space": "Ký tự (không cách)",
        "stat-sentences": "Số câu",
        "stat-paragraphs": "Đoạn văn",
        "stat-reading-time": "Thời gian đọc",
        "stat-speaking-time": "Thời gian nói",
        "stat-keyword-density": "Mật Độ Từ Khóa",
        "stat-readability": "Độ Dễ Đọc",
        "btn-load-sample": "Văn Bản Mẫu",
        "readability-assess": "Nhập văn bản để đánh giá",
        "readability-level-easy": "Cực kỳ dễ đọc",
        "readability-level-normal": "Dễ đọc hiểu",
        "readability-level-fair": "Khá khó đọc",
        "readability-level-hard": "Rất khó đọc",
        "density-ignore-filler": "Bỏ qua từ đệm",
        "panel-editor-title": "Trình Soạn Thảo Văn Bản",
        "panel-metrics-title": "Bảng Chỉ Số Phân Tích",
        "lbl-reading-metrics": "Ước Tính Tốc Độ",
        "lbl-no-density": "Nhập văn bản để xem mật độ từ khóa",
        "sample-text": "Silver Cat Tools là cổng công cụ trực tuyến miễn phí và cao cấp. Chúng tôi cung cấp các giải pháp tiện ích một tính năng như nén ảnh chất lượng cao, chuyển đổi định dạng tài liệu, và dọn dẹp văn bản nhanh chóng. Hãy trải nghiệm tốc độ xử lý nhanh, bảo mật tối đa và giao diện người dùng đẹp mắt!"
    },
    en: {
        "word-counter-h1": "Word Counter & <span class=\"text-gradient-purple\">Text Analyzer</span>",
        "word-counter-subtitle": "Professional real-time word and character counter. Analyze keyword density, estimated reading/speaking time, and readability score instantly.",
        "input-placeholder": "Start typing or paste your text here...",
        "stat-words": "Words",
        "stat-chars": "Chars (with spaces)",
        "stat-chars-no-space": "Chars (no spaces)",
        "stat-sentences": "Sentences",
        "stat-paragraphs": "Paragraphs",
        "stat-reading-time": "Reading Time",
        "stat-speaking-time": "Speaking Time",
        "stat-keyword-density": "Keyword Density",
        "stat-readability": "Readability Score",
        "btn-load-sample": "Load Sample",
        "readability-assess": "Enter text to evaluate",
        "readability-level-easy": "Very Easy to read",
        "readability-level-normal": "Easy to understand",
        "readability-level-fair": "Fairly difficult",
        "readability-level-hard": "Very difficult",
        "density-ignore-filler": "Ignore common fillers",
        "panel-editor-title": "Text Editor Workspace",
        "panel-metrics-title": "Analysis Dashboard",
        "lbl-reading-metrics": "Speed Estimators",
        "lbl-no-density": "Enter text to check density",
        "sample-text": "Silver Cat Tools is a premium and free online utility collection. We provide high-performance single-feature micro-applications such as image compressor, document converters, and advanced text utilities. Enjoy ultra-fast processing speeds, absolute local privacy, and gorgeous user interface designs!"
    }
};

// Filler words lists
const viFillers = ["và", "của", "cho", "là", "các", "có", "trong", "được", "để", "một", "những", "như", "này", "với", "tại", "về", "ra", "đã", "sẽ", "cũng", "đang", "nhưng", "khi", "lại", "thì", "từ", "nếu", "nó", "họ", "tôi", "anh", "chị", "em", "này", "kia"];
const enFillers = ["the", "a", "an", "and", "of", "to", "in", "is", "you", "that", "it", "he", "was", "for", "on", "are", "as", "with", "his", "they", "i", "at", "be", "this", "have", "from", "or", "one", "had", "by", "word", "but", "not", "what", "all", "were", "we", "when", "your", "can", "there", "use", "an", "each", "which"];

document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('input-text');
    
    // Stats elements
    const valWords = document.getElementById('val-words');
    const valChars = document.getElementById('val-chars');
    const valCharsNoSpace = document.getElementById('val-chars-no-space');
    const valSentences = document.getElementById('val-sentences');
    
    const valReadingTime = document.getElementById('val-reading-time');
    const valSpeakingTime = document.getElementById('val-speaking-time');
    
    const valReadability = document.getElementById('val-readability');
    const valReadabilityLabel = document.getElementById('val-readability-label');
    const valReadabilityDesc = document.getElementById('val-readability-desc');
    const readabilityGauge = document.getElementById('readability-gauge');
    
    const densityList = document.getElementById('density-list');
    const chkIgnoreFiller = document.getElementById('chk-ignore-filler');
    
    const btnLoadSample = document.getElementById('btn-load-sample');
    const btnClearAll = document.getElementById('btn-clear-all');
    const btnCopyText = document.getElementById('btn-copy-text');
    const btnDownloadText = document.getElementById('btn-download-text');

    // 1. Language Swapping
    function getLang() {
        return window.getCurrentLang ? window.getCurrentLang() : 'vi';
    }

    function applyLocalTranslation() {
        const lang = getLang();
        const dict = localDictionary[lang];
        
        document.getElementById('local-title').innerHTML = dict["word-counter-h1"];
        document.getElementById('local-subtitle').textContent = dict["word-counter-subtitle"];
        inputArea.placeholder = dict["input-placeholder"];
        
        document.getElementById('panel-editor-title').innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg> ${dict["panel-editor-title"]}`;
        document.getElementById('panel-metrics-title').innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
            </svg> ${dict["panel-metrics-title"]}`;

        btnLoadSample.textContent = dict["btn-load-sample"];
        document.getElementById('lbl-words').textContent = dict["stat-words"];
        document.getElementById('lbl-chars').textContent = dict["stat-chars"];
        document.getElementById('lbl-chars-no-space').textContent = dict["stat-chars-no-space"];
        document.getElementById('lbl-sentences').textContent = dict["stat-sentences"];
        document.getElementById('lbl-reading-metrics').textContent = dict["lbl-reading-metrics"];
        document.getElementById('lbl-reading-time').textContent = dict["stat-reading-time"];
        document.getElementById('lbl-speaking-time').textContent = dict["stat-speaking-time"];
        document.getElementById('lbl-readability-title').textContent = dict["stat-readability"];
        document.getElementById('lbl-keyword-density').textContent = dict["stat-keyword-density"];
        document.getElementById('lbl-ignore-fillers').textContent = dict["density-ignore-filler"];
        
        if (inputArea.value.trim() === '') {
            document.getElementById('lbl-no-density').textContent = dict["lbl-no-density"];
            valReadabilityLabel.textContent = dict["readability-assess"];
        }
    }

    // Bind global translation sweeps hook
    const originalLangToggle = window.toggleLanguage;
    window.addEventListener('languageChanged', () => {
        applyLocalTranslation();
        processTextAnalysis();
    });

    // 2. Sample and Clear Actions
    btnLoadSample.addEventListener('click', () => {
        const lang = getLang();
        inputArea.value = localDictionary[lang]["sample-text"];
        processTextAnalysis();
    });

    btnClearAll.addEventListener('click', () => {
        inputArea.value = '';
        processTextAnalysis();
    });

    // 3. Copy & Download
    btnCopyText.addEventListener('click', () => {
        const text = inputArea.value;
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            btnCopyText.classList.add('success');
            const dict = i18nDictionary[getLang()];
            btnCopyText.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> ${dict['btn-copy-success']}`;
            setTimeout(() => {
                btnCopyText.classList.remove('success');
                btnCopyText.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg> <span>${dict['btn-copy']}</span>`;
            }, 2000);
        });
    });

    btnDownloadText.addEventListener('click', () => {
        const text = inputArea.value;
        if (!text) return;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'silver-cat-word-count.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // 4. Mobile View Panel Toggling
    const tabBtnInput = document.getElementById('tab-btn-input');
    const tabBtnOutput = document.getElementById('tab-btn-output');
    const panels = document.querySelectorAll('.tool-panel');

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

    // 5. Core Text Processing Engine
    function processTextAnalysis() {
        const text = inputArea.value;
        const charCount = text.length;
        const charNoSpaceCount = text.replace(/\s/g, '').length;
        
        // Words Split
        const cleanText = text.trim();
        const wordList = cleanText === '' ? [] : cleanText.split(/\s+/);
        const wordCount = wordList.length;

        // Sentences Split
        const sentencesList = cleanText === '' ? [] : cleanText.split(/[.!?]+/g).filter(s => s.trim() !== '');
        const sentenceCount = sentencesList.length;

        // Update basic stats
        valWords.textContent = wordCount.toLocaleString();
        valChars.textContent = charCount.toLocaleString();
        valCharsNoSpace.textContent = charNoSpaceCount.toLocaleString();
        valSentences.textContent = sentenceCount.toLocaleString();

        // Estimated Speeds (Reading: 180wpm, Speaking: 130wpm)
        const readSecs = Math.ceil((wordCount / 180) * 60);
        const speakSecs = Math.ceil((wordCount / 130) * 60);

        if (wordCount === 0) {
            valReadingTime.textContent = '0m 0s';
            valSpeakingTime.textContent = '0m 0s';
        } else {
            valReadingTime.textContent = `${Math.floor(readSecs / 60)}m ${readSecs % 60}s`;
            valSpeakingTime.textContent = `${Math.floor(speakSecs / 60)}m ${speakSecs % 60}s`;
        }

        // Keyword Density Analysis
        updateKeywordDensity(wordList);

        // Readability Evaluation
        updateReadability(wordCount, sentenceCount, charNoSpaceCount);
    }

    function updateKeywordDensity(wordList) {
        const lang = getLang();
        const dict = localDictionary[lang];
        
        if (wordList.length === 0) {
            densityList.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 1rem 0;" id="lbl-no-density">${dict["lbl-no-density"]}</div>`;
            return;
        }

        const frequencyMap = {};
        const fillers = lang === 'vi' ? viFillers : enFillers;
        const ignoreFiller = chkIgnoreFiller.checked;

        wordList.forEach(w => {
            let cleaned = w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
            if (cleaned.length < 2) return; // ignore ultra-short single letters
            
            if (ignoreFiller && fillers.includes(cleaned)) return;

            frequencyMap[cleaned] = (frequencyMap[cleaned] || 0) + 1;
        });

        const sortedKeywords = Object.entries(frequencyMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (sortedKeywords.length === 0) {
            densityList.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 1rem 0;">N/A</div>`;
            return;
        }

        const maxQty = sortedKeywords[0][1];
        densityList.innerHTML = '';

        sortedKeywords.forEach(([word, count]) => {
            const percentage = Math.round((count / wordList.length) * 100);
            const relativePercent = Math.round((count / maxQty) * 100);

            const densityItem = document.createElement('div');
            densityItem.className = 'density-item';
            densityItem.innerHTML = `
                <div class="density-meta">
                    <span class="density-word">${word}</span>
                    <span class="density-qty">${count} (${percentage}%)</span>
                </div>
                <div class="density-progress-bg">
                    <div class="density-progress-bar" style="width: ${relativePercent}%"></div>
                </div>
            `;
            densityList.appendChild(densityItem);
        });
    }

    function updateReadability(wordCount, sentenceCount, charCount) {
        const lang = getLang();
        const dict = localDictionary[lang];

        if (wordCount === 0 || sentenceCount === 0) {
            valReadability.textContent = '0';
            valReadabilityLabel.textContent = dict["readability-assess"];
            valReadabilityDesc.textContent = 'Flesch-Kincaid';
            readabilityGauge.style.background = `conic-gradient(var(--border-color) 0%, rgba(255, 255, 255, 0.05) 0%)`;
            return;
        }

        // Simple customized readability check based on characters per word and words per sentence
        const charsPerWord = charCount / wordCount;
        const wordsPerSentence = wordCount / sentenceCount;

        // Flesch Reading Ease approximation
        let score = Math.round(206.835 - (1.015 * wordsPerSentence) - (84.6 * (charsPerWord / 5.2)));
        if (score > 100) score = 100;
        if (score < 0) score = 0;

        valReadability.textContent = score;

        // conic gradient sweep
        readabilityGauge.style.background = `conic-gradient(var(--accent-purple) ${score}%, rgba(255, 255, 255, 0.05) ${score}%)`;

        let level = '';
        let desc = '';

        if (score >= 80) {
            level = dict["readability-level-easy"];
            desc = lang === 'vi' ? 'Dễ như truyện thiếu nhi' : 'Simple standard English';
        } else if (score >= 60) {
            level = dict["readability-level-normal"];
            desc = lang === 'vi' ? 'Tiêu chuẩn báo chí bình dân' : 'Conversational structure';
        } else if (score >= 40) {
            level = dict["readability-level-fair"];
            desc = lang === 'vi' ? 'Tài liệu kỹ thuật / Học thuật nhẹ' : 'Slightly complex prose';
        } else {
            level = dict["readability-level-hard"];
            desc = lang === 'vi' ? 'Rất hàn lâm hoặc cực kỳ dài' : 'High cognitive density';
        }

        valReadabilityLabel.textContent = level;
        valReadabilityDesc.textContent = desc;
    }

    inputArea.addEventListener('input', processTextAnalysis);
    chkIgnoreFiller.addEventListener('change', () => {
        const cleanText = inputArea.value.trim();
        const wordList = cleanText === '' ? [] : cleanText.split(/\s+/);
        updateKeywordDensity(wordList);
    });

    // Initialize Page Translations
    setTimeout(() => {
        applyLocalTranslation();
    }, 100);
});
