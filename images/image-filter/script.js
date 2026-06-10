// ==========================================================================
// IMAGE FILTER & EFFECTS - Interactive Script
// Uses Canvas API to apply CSS/CV filters on pixel data
// ==========================================================================

// ─── i18n ─────────────────────────────────────────────────────────────────
const localDict = {
    vi: {
        'filter-title-page': 'Bộ Lọc & Hiệu Ứng Ảnh - Silver Cat Tools',
        'back-home': 'Quay lại Home',
        'filter-head': 'Bộ Lọc',
        'filter-head-sub': 'Hiệu Ứng Ảnh',
        'filter-desc': 'Transform your photos with a wide range of professional filters: from classic to modern. All runs in your browser - absolute privacy!',
        'upload-title': 'Tải Ảnh Lên',
        'drop-title': 'Drag & drop an image here or click to browse',
        'drop-desc': 'Supports JPG, PNG, WebP. 100% browser-side processing.',
        'intensity-lbl': 'Cường độ hiệu ứng',
        'btn-reset': 'Reset',
        'btn-download': 'Tải Ảnh Đã Filter',
        'preview-title': 'Preview',
        'preview-label': 'Result after applying filter',
        'preview-badge': 'Filtered',
        'dims-lbl': 'Dimensions:',
        'filter-lbl': 'Filter:',
        'no-image': 'No image uploaded yet',
        'filter-none': 'Không',
        'footer-copyright': '© 2026 Silver Cat Tools.',
    },
    en: {
        'filter-title-page': 'Image Filter & Effects - Silver Cat Tools',
        'back-home': 'Back to Home',
        'filter-head': 'Image',
        'filter-head-sub': 'Filter & Effects',
        'filter-desc': 'Transform your photos with professional filters: from classic to modern. All processing runs in your browser - 100% private!',
        'upload-title': 'Upload Image',
        'drop-title': 'Drop an image here or click to select',
        'drop-desc': 'Supports JPG, PNG, WebP. 100% browser-side processing.',
        'intensity-lbl': 'Effect Intensity',
        'btn-reset': 'Reset',
        'btn-download': 'Download Filtered Image',
        'preview-title': 'Preview',
        'preview-label': 'Result after applying filter',
        'preview-badge': 'Filtered',
        'dims-lbl': 'Dimensions:',
        'filter-lbl': 'Filter:',
        'no-image': 'No image uploaded yet',
        'filter-none': 'None',
        'footer-copyright': '© 2026 Silver Cat Tools.',
    }
};

function getCurrentLang() {
    return localStorage.getItem('preferred-lang') || 'vi';
}

function applyLocalTranslation(lang) {
    const dict = localDict[lang] || localDict['vi'];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = dict[key];
        if (translation !== undefined) {
            if (translation.includes('<') && translation.includes('>')) {
                el.innerHTML = translation;
            } else {
                el.textContent = translation;
            }
        }
    });
    const titleEl = document.querySelector('title[data-i18n]');
    if (titleEl && dict[titleEl.getAttribute('data-i18n')]) {
        document.title = dict[titleEl.getAttribute('data-i18n')];
    }
}

function getFilterLabel(f, lang) {
    if (f.labelKey) {
        return (localDict[lang] && localDict[lang][f.labelKey]) || localDict['vi'][f.labelKey];
    }
    return f.label;
}

// ==========================================================================
// MAIN APP
// ==========================================================================
(function () {
    'use strict';

    // DOM refs
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const canvas = document.getElementById('preview-canvas');
    const ctx = canvas.getContext('2d');
    const previewBox = document.getElementById('preview-box');
    const placeholder = document.getElementById('no-image-placeholder');
    const filtersGrid = document.getElementById('filters-grid');
    const intensitySlider = document.getElementById('intensity-slider');
    const intensityVal = document.getElementById('intensity-val');
    const btnReset = document.getElementById('btn-reset');
    const btnDownload = document.getElementById('btn-download');
    const previewDims = document.getElementById('preview-dims');
    const previewFilter = document.getElementById('preview-filter');

    let originalImage = null;  // Image object
    let currentFilter = 'none';
    let isProcessing = false;

    // ======================================================================
    // FILTER DEFINITIONS (i18n keys)
    // ======================================================================
    const filters = [
        { id: 'none',      icon: '❌', labelKey: 'filter-none' },
        { id: 'grayscale', icon: '⚪', label: 'Grayscale' },
        { id: 'sepia',     icon: '🟤', label: 'Sepia' },
        { id: 'invert',    icon: '🔄', label: 'Invert' },
        { id: 'vintage',   icon: '📻', label: 'Vintage' },
        { id: 'cool',      icon: '❄️', label: 'Cool' },
        { id: 'warm',      icon: '🔥', label: 'Warm' },
        { id: 'blur',      icon: '🌫️', label: 'Blur' },
        { id: 'sharpen',   icon: '✨', label: 'Sharpen' },
        { id: 'emboss',    icon: '🗿', label: 'Emboss' },
        { id: 'edge',      icon: '✏️', label: 'Edge Detect' },
        { id: 'pixelate',  icon: '🔲', label: 'Pixelate' },
        { id: 'noise',     icon: '📺', label: 'Noise' },
        { id: 'saturate',  icon: '🌈', label: 'Saturate' },
        { id: 'hue',       icon: '🎨', label: 'Hue Rotate' },
        { id: 'contrast',  icon: '☀️', label: 'High Contrast' },
    ];

    // ======================================================================
    // RENDER FILTER BUTTONS
    // ======================================================================
    function renderFilterButtons(lang) {
        filtersGrid.innerHTML = '';
        filters.forEach(f => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn' + (f.id === 'none' ? ' active' : '');
            btn.dataset.filter = f.id;
            const label = getFilterLabel(f, lang);
            btn.innerHTML = `<span class="filter-icon">${f.icon}</span><span class="filter-label">${label}</span>`;
            btn.addEventListener('click', () => applyFilter(f.id));
            filtersGrid.appendChild(btn);
        });
        // Update preview filter name if image loaded
        if (originalImage) {
            const curFilter = filters.find(f => f.id === currentFilter);
            if (curFilter) {
                previewFilter.textContent = getFilterLabel(curFilter, lang);
            }
        }
    }

    // ======================================================================
    // DROPZONE HANDLING
    // ======================================================================
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => { dropzone.classList.remove('dragover'); });
    dropzone.addEventListener('drop', (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); handleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });

    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                originalImage = img;
                currentFilter = 'none';
                intensitySlider.value = 100;
                intensityVal.textContent = '100%';
                renderPreview();
                placeholder.style.display = 'none';
                previewBox.style.display = 'block';
                btnDownload.style.display = 'flex';
                // Reset active state
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                document.querySelector('.filter-btn[data-filter="none"]').classList.add('active');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // ======================================================================
    // FILTER APPLICATION
    // ======================================================================
    function applyFilter(filterId) {
        if (!originalImage || isProcessing) return;
        currentFilter = filterId;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.filter-btn[data-filter="${filterId}"]`).classList.add('active');
        renderPreview();
    }

    function renderPreview() {
        if (!originalImage) return;
        isProcessing = true;

        const intensity = parseInt(intensitySlider.value) / 100;
        const w = originalImage.naturalWidth;
        const h = originalImage.naturalHeight;

        // Limit max canvas size for performance
        const maxDim = 1200;
        let drawW = w, drawH = h;
        if (w > maxDim || h > maxDim) {
            if (w > h) { drawW = maxDim; drawH = Math.round(h * (maxDim / w)); }
            else { drawH = maxDim; drawW = Math.round(w * (maxDim / h)); }
        }

        canvas.width = drawW;
        canvas.height = drawH;
        ctx.drawImage(originalImage, 0, 0, drawW, drawH);

        previewDims.textContent = `${drawW} × ${drawH}`;
        const curFilter = filters.find(f => f.id === currentFilter);
        previewFilter.textContent = curFilter ? getFilterLabel(curFilter, getCurrentLang()) : '—';

        if (currentFilter === 'none') { isProcessing = false; return; }

        const imageData = ctx.getImageData(0, 0, drawW, drawH);
        const data = imageData.data;

        applyPixelFilter(data, drawW, drawH, intensity);

        ctx.putImageData(imageData, 0, 0);
        isProcessing = false;
    }

    // ======================================================================
    // PIXEL-LEVEL FILTER ENGINE
    // ======================================================================
    function applyPixelFilter(data, w, h, intensity) {
        const conv = (kernel, pixels, idx, w) => {
            const kSize = Math.sqrt(kernel.length);
            const half = Math.floor(kSize / 2);
            let r = 0, g = 0, b = 0;
            for (let ky = -half; ky <= half; ky++) {
                for (let kx = -half; kx <= half; kx++) {
                    const px = (idx / 4) % w + kx;
                    const py = Math.floor(idx / 4 / w) + ky;
                    if (px < 0 || px >= w || py < 0 || py >= h) continue;
                    const pIdx = (py * w + px) * 4;
                    const kVal = kernel[(ky + half) * kSize + (kx + half)];
                    r += data[pIdx] * kVal;
                    g += data[pIdx + 1] * kVal;
                    b += data[pIdx + 2] * kVal;
                }
            }
            return [r, g, b];
        };

        switch (currentFilter) {
            case 'grayscale': {
                for (let i = 0; i < data.length; i += 4) {
                    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                    const val = data[i] * (1 - intensity) + gray * intensity;
                    data[i] = data[i + 1] = data[i + 2] = val;
                }
                break;
            }
            case 'sepia': {
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i + 1], b = data[i + 2];
                    const sr = 0.393 * r + 0.769 * g + 0.189 * b;
                    const sg = 0.349 * r + 0.686 * g + 0.168 * b;
                    const sb = 0.272 * r + 0.534 * g + 0.131 * b;
                    data[i] = r * (1 - intensity) + Math.min(255, sr) * intensity;
                    data[i + 1] = g * (1 - intensity) + Math.min(255, sg) * intensity;
                    data[i + 2] = b * (1 - intensity) + Math.min(255, sb) * intensity;
                }
                break;
            }
            case 'invert': {
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = data[i] * (1 - intensity) + (255 - data[i]) * intensity;
                    data[i + 1] = data[i + 1] * (1 - intensity) + (255 - data[i + 1]) * intensity;
                    data[i + 2] = data[i + 2] * (1 - intensity) + (255 - data[i + 2]) * intensity;
                }
                break;
            }
            case 'vintage': {
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i + 1], b = data[i + 2];
                    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                    const sr = Math.min(255, gray * 0.9 + 30);
                    const sg = Math.min(255, gray * 0.85 + 10);
                    const sb = Math.min(255, gray * 0.75);
                    data[i] = r * (1 - intensity) + sr * intensity;
                    data[i + 1] = g * (1 - intensity) + sg * intensity;
                    data[i + 2] = b * (1 - intensity) + sb * intensity;
                }
                break;
            }
            case 'cool': {
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = data[i] * (1 - intensity * 0.3);
                    data[i + 2] = data[i + 2] * (1 - intensity * 0.3) + 30 * intensity;
                }
                break;
            }
            case 'warm': {
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = data[i] * (1 - intensity * 0.3) + 40 * intensity;
                    data[i + 2] = data[i + 2] * (1 - intensity * 0.3);
                }
                break;
            }
            case 'saturate': {
                for (let i = 0; i < data.length; i += 4) {
                    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                    const f = intensity * 1.5 + 0.5;
                    data[i] = Math.min(255, gray + (data[i] - gray) * f);
                    data[i + 1] = Math.min(255, gray + (data[i + 1] - gray) * f);
                    data[i + 2] = Math.min(255, gray + (data[i + 2] - gray) * f);
                }
                break;
            }
            case 'hue': {
                const rot = intensity * 360;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
                    const max = Math.max(r, g, b), min = Math.min(r, g, b);
                    let h = 0, s = 0, l = (max + min) / 2;
                    if (max !== min) {
                        const d = max - min;
                        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
                        else if (max === g) h = ((b - r) / d + 2) * 60;
                        else h = ((r - g) / d + 4) * 60;
                    }
                    h = (h + rot) % 360;
                    const c = (1 - Math.abs(2 * l - 1)) * s;
                    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
                    const m = l - c / 2;
                    let nr, ng, nb;
                    if (h < 60) { nr = c; ng = x; nb = 0; }
                    else if (h < 120) { nr = x; ng = c; nb = 0; }
                    else if (h < 180) { nr = 0; ng = c; nb = x; }
                    else if (h < 240) { nr = 0; ng = x; nb = c; }
                    else if (h < 300) { nr = x; ng = 0; nb = c; }
                    else { nr = c; ng = 0; nb = x; }
                    data[i] = Math.min(255, (nr + m) * 255);
                    data[i + 1] = Math.min(255, (ng + m) * 255);
                    data[i + 2] = Math.min(255, (nb + m) * 255);
                }
                break;
            }
            case 'contrast': {
                const f = (259 * (intensity * 200 + 55)) / (255 * (259 - (intensity * 200 + 55)));
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, Math.max(0, f * (data[i] - 128) + 128));
                    data[i + 1] = Math.min(255, Math.max(0, f * (data[i + 1] - 128) + 128));
                    data[i + 2] = Math.min(255, Math.max(0, f * (data[i + 2] - 128) + 128));
                }
                break;
            }
            case 'blur': {
                const blurKernel = [];
                const size = Math.max(1, Math.round(intensity * 3));
                const kLen = size * 2 + 1;
                for (let i = 0; i < kLen * kLen; i++) blurKernel.push(1 / (kLen * kLen));
                const newData = new Uint8ClampedArray(data);
                for (let i = 0; i < data.length; i += 4) {
                    const [r, g, b] = conv(blurKernel, newData, i, w);
                    data[i] = r; data[i + 1] = g; data[i + 2] = b;
                }
                break;
            }
            case 'sharpen': {
                const f = 0.5 + intensity * 0.8;
                const kernel = [0, -f, 0, -f, 1 + 4 * f, -f, 0, -f, 0];
                const newData = new Uint8ClampedArray(data);
                for (let i = 0; i < data.length; i += 4) {
                    const [r, g, b] = conv(kernel, newData, i, w);
                    data[i] = Math.min(255, Math.max(0, r));
                    data[i + 1] = Math.min(255, Math.max(0, g));
                    data[i + 2] = Math.min(255, Math.max(0, b));
                }
                break;
            }
            case 'emboss': {
                const kernel = [-2, -1, 0, -1, 1, 1, 0, 1, 2];
                const newData = new Uint8ClampedArray(data);
                for (let i = 0; i < data.length; i += 4) {
                    const [r, g, b] = conv(kernel, newData, i, w);
                    data[i] = Math.min(255, Math.max(0, r + 128));
                    data[i + 1] = Math.min(255, Math.max(0, g + 128));
                    data[i + 2] = Math.min(255, Math.max(0, b + 128));
                }
                break;
            }
            case 'edge': {
                const kernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
                const newData = new Uint8ClampedArray(data);
                for (let i = 0; i < data.length; i += 4) {
                    const [r, g, b] = conv(kernel, newData, i, w);
                    const val = Math.min(255, Math.max(0, (r + g + b) / 3));
                    data[i] = val; data[i + 1] = val; data[i + 2] = val;
                }
                break;
            }
            case 'pixelate': {
                const block = Math.max(2, Math.round(2 + intensity * 16));
                for (let y = 0; y < h; y += block) {
                    for (let x = 0; x < w; x += block) {
                        const idx = (y * w + x) * 4;
                        let r = 0, g = 0, b = 0, count = 0;
                        for (let py = y; py < Math.min(y + block, h); py++) {
                            for (let px = x; px < Math.min(x + block, w); px++) {
                                const pi = (py * w + px) * 4;
                                r += data[pi]; g += data[pi + 1]; b += data[pi + 2]; count++;
                            }
                        }
                        r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
                        for (let py = y; py < Math.min(y + block, h); py++) {
                            for (let px = x; px < Math.min(x + block, w); px++) {
                                const pi = (py * w + px) * 4;
                                data[pi] = r; data[pi + 1] = g; data[pi + 2] = b;
                            }
                        }
                    }
                }
                break;
            }
            case 'noise': {
                const amount = intensity * 60;
                for (let i = 0; i < data.length; i += 4) {
                    const noise = (Math.random() - 0.5) * amount;
                    data[i] = Math.min(255, Math.max(0, data[i] + noise));
                    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
                    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
                }
                break;
            }
        }
    }

    // ======================================================================
    // INTENSITY SLIDER
    // ======================================================================
    intensitySlider.addEventListener('input', () => {
        intensityVal.textContent = `${intensitySlider.value}%`;
        if (originalImage && currentFilter !== 'none') renderPreview();
    });

    // ======================================================================
    // RESET
    // ======================================================================
    btnReset.addEventListener('click', () => {
        if (!originalImage) return;
        currentFilter = 'none';
        intensitySlider.value = 100;
        intensityVal.textContent = '100%';
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.filter-btn[data-filter="none"]').classList.add('active');
        renderPreview();
    });

    // ======================================================================
    // DOWNLOAD
    // ======================================================================
    btnDownload.addEventListener('click', () => {
        if (!originalImage) return;
        const link = document.createElement('a');
        link.download = 'filtered-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // ======================================================================
    // MOBILE TABS
    // ======================================================================
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mobile-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active-panel'));
            btn.classList.add('active');
            const target = document.getElementById(btn.dataset.target);
            if (target) target.classList.add('active-panel');
        });
    });

    // ======================================================================
    // INIT i18n
    // ======================================================================
    const initLang = getCurrentLang();
    applyLocalTranslation(initLang);
    renderFilterButtons(initLang);

    window.addEventListener('languageChanged', e => {
        const lang = e.detail?.lang || getCurrentLang();
        applyLocalTranslation(lang);
        renderFilterButtons(lang);
        // Re-render preview to update filter name shown
        if (originalImage) {
            const curFilter = filters.find(f => f.id === currentFilter);
            if (curFilter) {
                previewFilter.textContent = getFilterLabel(curFilter, lang);
            }
        }
    });

})();