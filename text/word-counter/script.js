const EN_FILLERS = ["the", "a", "an", "and", "of", "to", "in", "is", "you", "that", "it", "he", "was", "for", "on", "are", "as", "with", "his", "they", "i", "at", "be", "this", "have", "from", "or", "one", "had", "by", "word", "but", "not", "what", "all", "were", "we", "when", "your", "can", "there", "use", "each", "which"];

const SAMPLE_TEXT = "Silver Cat Tools is a premium and free online utility collection. We provide high-performance single-feature micro-applications such as image compressor, document converters, and advanced text utilities. Enjoy ultra-fast processing speeds, absolute local privacy, and gorgeous user interface designs!";

document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('input-text');

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

    // Sample and Clear
    btnLoadSample.addEventListener('click', () => {
        inputArea.value = SAMPLE_TEXT;
        processTextAnalysis();
    });

    btnClearAll.addEventListener('click', () => {
        inputArea.value = '';
        processTextAnalysis();
    });

    // Copy
    btnCopyText.addEventListener('click', () => {
        const text = inputArea.value;
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            btnCopyText.classList.add('success');
            btnCopyText.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Copied!';
            setTimeout(() => {
                btnCopyText.classList.remove('success');
                btnCopyText.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg> <span>Copy Text</span>';
            }, 2000);
        });
    });

    // Download
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

    // Mobile tabs
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

    // Core Text Processing
    function processTextAnalysis() {
        const text = inputArea.value;
        const charCount = text.length;
        const charNoSpaceCount = text.replace(/\s/g, '').length;

        const cleanText = text.trim();
        const wordList = cleanText === '' ? [] : cleanText.split(/\s+/);
        const wordCount = wordList.length;

        const sentencesList = cleanText === '' ? [] : cleanText.split(/[.!?]+/g).filter(s => s.trim() !== '');
        const sentenceCount = sentencesList.length;

        valWords.textContent = wordCount.toLocaleString();
        valChars.textContent = charCount.toLocaleString();
        valCharsNoSpace.textContent = charNoSpaceCount.toLocaleString();
        valSentences.textContent = sentenceCount.toLocaleString();

        const readSecs = Math.ceil((wordCount / 180) * 60);
        const speakSecs = Math.ceil((wordCount / 130) * 60);

        if (wordCount === 0) {
            valReadingTime.textContent = '0m 0s';
            valSpeakingTime.textContent = '0m 0s';
        } else {
            valReadingTime.textContent = `${Math.floor(readSecs / 60)}m ${readSecs % 60}s`;
            valSpeakingTime.textContent = `${Math.floor(speakSecs / 60)}m ${speakSecs % 60}s`;
        }

        updateKeywordDensity(wordList);
        updateReadability(wordCount, sentenceCount, charNoSpaceCount);
    }

    function updateKeywordDensity(wordList) {
        if (wordList.length === 0) {
            densityList.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 1rem 0;">Enter text to see keyword density</div>';
            return;
        }

        const frequencyMap = {};
        const ignoreFiller = chkIgnoreFiller.checked;

        wordList.forEach(w => {
            const cleaned = w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
            if (cleaned.length < 2) return;
            if (ignoreFiller && EN_FILLERS.includes(cleaned)) return;
            frequencyMap[cleaned] = (frequencyMap[cleaned] || 0) + 1;
        });

        const sortedKeywords = Object.entries(frequencyMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (sortedKeywords.length === 0) {
            densityList.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 1rem 0;">N/A</div>';
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
        if (wordCount === 0 || sentenceCount === 0) {
            valReadability.textContent = '0';
            valReadabilityLabel.textContent = 'Enter text to assess';
            valReadabilityDesc.textContent = 'Flesch-Kincaid';
            readabilityGauge.style.background = 'conic-gradient(var(--border-color) 0%, rgba(255, 255, 255, 0.05) 0%)';
            return;
        }

        const charsPerWord = charCount / wordCount;
        const wordsPerSentence = wordCount / sentenceCount;

        let score = Math.round(206.835 - (1.015 * wordsPerSentence) - (84.6 * (charsPerWord / 5.2)));
        if (score > 100) score = 100;
        if (score < 0) score = 0;

        valReadability.textContent = score;
        readabilityGauge.style.background = `conic-gradient(var(--accent-purple) ${score}%, rgba(255, 255, 255, 0.05) ${score}%)`;

        let level, desc;
        if (score >= 80) {
            level = 'Very Easy to Read';
            desc = 'Simple standard English';
        } else if (score >= 60) {
            level = 'Easy to Understand';
            desc = 'Conversational structure';
        } else if (score >= 40) {
            level = 'Fairly Difficult';
            desc = 'Slightly complex prose';
        } else {
            level = 'Very Difficult';
            desc = 'High cognitive density';
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
});