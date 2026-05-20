(function () {
    'use strict';

    // ─── i18n ─────────────────────────────────────────────────────────────
    const localDict = {
        vi: {
            'palette-title-page': 'Trích Xuất Bảng Màu - Silver Cat Tools',
            'meta-desc': 'Trích xuất bảng màu nổi bật từ ảnh, lấy mã màu HEX, RGB một cách nhanh chóng trong trình duyệt.',
            'meta-keywords': 'color palette, trích xuất màu, palette generator, hex color, rgb, image colors',
            'back-home': 'Quay lại Trang Chủ',
            'palette-head': 'Trích Xuất Bảng Màu',
            'palette-head-sub': 'Ảnh',
            'palette-desc': 'Lấy ra các màu chủ đạo, hiển thị mã HEX, RGB và sao chép nhanh.',
            'mob-settings': 'Cài Đặt',
            'mob-result': 'Kết Quả',
            'settings-title': 'Cài Đặt',
            'drop-title': 'Kéo thả ảnh hoặc click để tải',
            'lbl-color-count': 'Số màu tối đa',
            'btn-extract': 'Tải Bảng Màu (.txt)',
            'result-title': 'Màu Đã Trích Xuất',
            'no-result': 'Chưa có kết quả. Tải ảnh và nhấn "Trích Xuất Màu".',
            'footer-copyright': '© 2026 Silver Cat Tools. Được xây dựng cho hiệu suất tối ưu.'
        },
        en: {
            'palette-title-page': 'Image Color Palette Generator - Silver Cat Tools',
            'meta-desc': 'Extract dominant color palettes from images, get HEX and RGB color codes instantly in your browser.',
            'meta-keywords': 'color palette generator, extract image colors, hex color, rgb color, dominant colors, color picker',
            'back-home': 'Back to Home',
            'palette-head': 'Image Color',
            'palette-head-sub': 'Palette',
            'palette-desc': 'Extract dominant colors, view HEX & RGB values and copy with one click.',
            'mob-settings': 'Settings',
            'mob-result': 'Results',
            'settings-title': 'Settings',
            'drop-title': 'Drop an image here or click to upload',
            'lbl-color-count': 'Max Colors',
            'btn-extract': 'Download Palette (.txt)',
            'result-title': 'Extracted Colors',
            'no-result': 'No results yet. Upload an image and click "Extract Colors".',
            'footer-copyright': '© 2026 Silver Cat Tools. Built for optimal performance.'
        }
    };

    function applyLocalTranslation(lang) {
        const dict = localDict[lang] || localDict['vi'];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.textContent = dict[key];
        });
        const titleEl = document.querySelector('title[data-i18n]');
        if (titleEl && dict[titleEl.getAttribute('data-i18n')]) {
            document.title = dict[titleEl.getAttribute('data-i18n')];
        }
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && dict['meta-desc']) metaDesc.setAttribute('content', dict['meta-desc']);
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords && dict['meta-keywords']) metaKeywords.setAttribute('content', dict['meta-keywords']);
    }

    // ─── DOM Refs ──────────────────────────────────────────────────────────
    const dropzone   = document.getElementById('dropzone');
    const fileUpload = document.getElementById('file-upload');
    const canvas     = document.getElementById('preview-canvas');
    const noResult   = document.getElementById('no-result');
    const paletteGrid= document.getElementById('palette-grid');
    const colorCount = document.getElementById('color-count');
    const colorCountVal = document.getElementById('color-count-val');
    const btnExtract = document.getElementById('btn-extract');

    // Hover tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'color-hover-tooltip';
    tooltip.style.display = 'none';
    tooltip.innerHTML = '<div class="tooltip-color-dot" id="tt-dot"></div><span id="tt-hex">#000000</span>';
    document.body.appendChild(tooltip);

    let loadedImage = null;

    // ─── Slider ──────────────────────────────────────────────────────────
    colorCount.addEventListener('input', () => { 
        colorCountVal.textContent = colorCount.value; 
        if (loadedImage) extractColors();
    });

    // ─── File Upload ─────────────────────────────────────────────────────
    dropzone.addEventListener('click', () => fileUpload.click());
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', e => {
        e.preventDefault(); dropzone.classList.remove('dragover');
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    fileUpload.addEventListener('change', () => { if (fileUpload.files[0]) handleFile(fileUpload.files[0]); });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) return;
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            loadedImage = img;
            // Draw image onto canvas
            canvas.width  = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            canvas.style.display = 'block';
            URL.revokeObjectURL(url);
            // Auto extract
            extractColors();
            // Switch to result tab automatically
            const resultTab = document.querySelector('[data-target="panel-result"]');
            if (resultTab) resultTab.click();
        };
        img.src = url;
    }

    // ─── Pixel hover ─────────────────────────────────────────────────────
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width  / rect.width;
        const scaleY = canvas.height / rect.height;
        const px = Math.round((e.clientX - rect.left) * scaleX);
        const py = Math.round((e.clientY - rect.top)  * scaleY);
        const d = canvas.getContext('2d').getImageData(px, py, 1, 1).data;
        const hex = rgbToHex(d[0], d[1], d[2]);
        document.getElementById('tt-dot').style.background = hex;
        document.getElementById('tt-hex').textContent = hex;
        tooltip.style.display = 'flex';
        tooltip.style.left = e.clientX + 'px';
        tooltip.style.top  = e.clientY + 'px';
    });
    canvas.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
    canvas.addEventListener('click', e => {
        // Add clicked color to palette
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width  / rect.width;
        const scaleY = canvas.height / rect.height;
        const px = Math.round((e.clientX - rect.left) * scaleX);
        const py = Math.round((e.clientY - rect.top)  * scaleY);
        const d = canvas.getContext('2d').getImageData(px, py, 1, 1).data;
        const hex = rgbToHex(d[0], d[1], d[2]);
        addManualSwatch(hex, d[0], d[1], d[2]);
    });

    // ─── Download Palette Text ──────────────────────────────────────────────────
    btnExtract.addEventListener('click', downloadPaletteText);

    function downloadPaletteText() {
        if (!loadedImage) return alert('Vui lòng tải ảnh lên trước.');
        
        const swatches = paletteGrid.querySelectorAll('.color-swatch');
        if (swatches.length === 0) return alert('Chưa có màu nào được trích xuất.');
        
        let textContent = "Silver Cat Tools - Color Palette\n--------------------------------\n\n";
        swatches.forEach(sw => {
            const hex = sw.querySelector('.swatch-hex').textContent;
            const rgb = sw.querySelector('.swatch-rgb').textContent;
            textContent += `${hex} | ${rgb}\n`;
        });
        
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'palette.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function extractColors() {
        if (!loadedImage) return;
        const n = parseInt(colorCount.value, 10);
        const ctx = canvas.getContext('2d');
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colors = quantizeColors(data, n);
        renderPalette(colors);
        noResult.style.display = 'none';
    }

    function quantizeColors(data, n) {
        // Simple color quantization: sample pixels, bucket by 32-unit color space
        const buckets = {};
        const step = Math.max(1, Math.floor(data.length / 4 / 5000)); // sample up to 5000 pixels
        for (let i = 0; i < data.length; i += 4 * step) {
            const r = data[i] & 0xE0;
            const g = data[i+1] & 0xE0;
            const b = data[i+2] & 0xE0;
            const a = data[i+3];
            if (a < 128) continue;
            const key = `${r},${g},${b}`;
            buckets[key] = (buckets[key] || 0) + 1;
        }
        const sorted = Object.entries(buckets)
            .sort((a, b) => b[1] - a[1])
            .slice(0, n * 4);

        // Ensure diversity: filter too-similar colors
        const chosen = [];
        for (const [key] of sorted) {
            const [r, g, b] = key.split(',').map(Number);
            const tooClose = chosen.some(c => colorDistance(r, g, b, c[0], c[1], c[2]) < 60);
            if (!tooClose) chosen.push([r, g, b]);
            if (chosen.length >= n) break;
        }
        return chosen;
    }

    function colorDistance(r1, g1, b1, r2, g2, b2) {
        return Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2);
    }

    function renderPalette(colors) {
        paletteGrid.innerHTML = '';
        colors.forEach(([r, g, b]) => {
            const hex = rgbToHex(r, g, b);
            paletteGrid.appendChild(createSwatch(hex, r, g, b));
        });
    }

    function addManualSwatch(hex, r, g, b) {
        // Check duplicate
        const existing = paletteGrid.querySelector(`[data-hex="${hex}"]`);
        if (existing) { existing.style.animation = 'none'; existing.offsetHeight; existing.style.animation = ''; return; }
        const sw = createSwatch(hex, r, g, b);
        sw.setAttribute('data-hex', hex);
        paletteGrid.insertBefore(sw, paletteGrid.firstChild);
    }

    function createSwatch(hex, r, g, b) {
        const el = document.createElement('div');
        el.className = 'color-swatch';
        el.style.cursor = 'pointer';
        el.title = 'Click to copy HEX';
        el.innerHTML = `
            <div class="swatch-block" style="background:${hex};"></div>
            <div class="swatch-info">
                <span class="swatch-hex">${hex}</span>
                <span class="swatch-rgb">rgb(${r}, ${g}, ${b})</span>
            </div>
            <div class="swatch-actions">
                <button class="btn-copy-swatch" data-copy="${hex}">HEX</button>
                <button class="btn-copy-swatch" data-copy="rgb(${r},${g},${b})">RGB</button>
            </div>`;
            
        el.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-copy-swatch')) return;
            navigator.clipboard.writeText(hex).then(() => {
                const hexSpan = el.querySelector('.swatch-hex');
                const orig = hexSpan.textContent;
                hexSpan.textContent = 'Copied!';
                hexSpan.style.color = 'var(--primary-color)';
                setTimeout(() => { hexSpan.textContent = orig; hexSpan.style.color = ''; }, 1500);
            });
        });

        el.querySelectorAll('.btn-copy-swatch').forEach(btn => {
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(btn.dataset.copy).then(() => {
                    const orig = btn.textContent;
                    btn.classList.add('copied');
                    btn.textContent = '✓';
                    setTimeout(() => { btn.classList.remove('copied'); btn.textContent = orig; }, 1500);
                });
            });
        });
        return el;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
    }

    // ─── Mobile tabs ──────────────────────────────────────────────────────
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active-panel'));
            document.getElementById(target).classList.add('active-panel');
            document.querySelectorAll('.mobile-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // ─── Init i18n ────────────────────────────────────────────────────────
    const initLang = localStorage.getItem('preferred-lang') || 'vi';
    applyLocalTranslation(initLang);
    window.addEventListener('languageChanged', e => applyLocalTranslation(e.detail?.lang || localStorage.getItem('preferred-lang') || 'vi'));
})();
