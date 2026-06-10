(function () {
    'use strict';

    const localDict = {
        vi: {
            'watermark-title-page': 'Chèn Watermark Hàng Loạt - Silver Cat Tools',
            'meta-desc': 'Embed logo or copyright watermark text on multiple images simultaneously right in your browser. Fast, secure, and free.',
            'meta-keywords': 'watermark ảnh, chèn logo ảnh, đóng dấu bản quyền ảnh, watermark hàng loạt, chèn chữ vào ảnh, đóng dấu logo',
            'back-home': 'Quay lại Home',
            'watermark-head': 'Chèn Watermark', 'watermark-head-sub': 'Hàng Loạt',
            'watermark-desc': 'Stamp logo or copyright watermark text on multiple images at once.',
            'mob-settings': 'Settings', 'mob-preview': 'Preview',
            'config-header': 'Cấu hình Watermark',
            'drop-title': 'Chọn hoặc thả nhiều ảnh tại đây',
            'drop-desc': 'Supports JPG, PNG, WebP formats',
            'lbl-wm-type': 'Loại Watermark',
            'type-text': 'Text', 'type-logo': 'Logo (Image)',
            'lbl-text-content': 'Nội dung chữ', 'lbl-font': 'Phông chữ', 'lbl-color': 'Màu sắc',
            'lbl-upload-logo': 'Upload Logo', 'btn-select-logo': 'Select Logo Image',
            'logo-no-file': 'No logo selected',
            'lbl-size': 'Size (%)', 'lbl-opacity': 'Opacity', 'lbl-rotation': 'Rotation (Angle)',
            'lbl-position': 'Vị trí (Góc bố cục)',
            'btn-sample': 'Tải Ảnh Mẫu (Sample)',
            'preview-header': 'Preview Result',
            'no-image': 'No images yet',
            'placeholder-preview-text': 'Drag & drop images to start previewing',
            'queue-title': 'Danh sách hàng đợi',
            'btn-clear': 'Clear All', 'btn-download-all': 'Download', 'btn-download-all-text': 'Download Tất Cả',
            'footer-copyright': '© 2026 Silver Cat Tools.'
        },
        en: {
            'watermark-title-page': 'Batch Image Watermarker - Silver Cat Tools',
            'meta-desc': 'Batch watermark multiple images with custom logos or text. Secure, fast, and runs entirely in your browser.',
            'meta-keywords': 'batch image watermark, bulk watermark photos, add logo to image, image copyright, free watermark tool',
            'back-home': 'Back to Home',
            'watermark-head': 'Batch Image', 'watermark-head-sub': 'Watermarker',
            'watermark-desc': 'Overlay logos or copyright text onto multiple images simultaneously.',
            'mob-settings': 'Settings', 'mob-preview': 'Preview',
            'config-header': 'Watermark Settings',
            'drop-title': 'Drop images here or click to upload',
            'drop-desc': 'Supports JPG, PNG, WebP',
            'lbl-wm-type': 'Watermark Type',
            'type-text': 'Text', 'type-logo': 'Logo (Image)',
            'lbl-text-content': 'Text Content', 'lbl-font': 'Font Family', 'lbl-color': 'Color',
            'lbl-upload-logo': 'Upload Logo', 'btn-select-logo': 'Select Logo Image',
            'logo-no-file': 'No logo selected',
            'lbl-size': 'Size (%)', 'lbl-opacity': 'Opacity', 'lbl-rotation': 'Rotation',
            'lbl-position': 'Position',
            'btn-sample': 'Load Sample Image',
            'preview-header': 'Live Preview',
            'no-image': 'No image loaded',
            'placeholder-preview-text': 'Drag & drop images to start previewing',
            'queue-title': 'Image Queue',
            'btn-clear': 'Clear All', 'btn-download-all': 'Download', 'btn-download-all-text': 'Download All',
            'footer-copyright': '© 2026 Silver Cat Tools.'
        }
    };

    function applyLocalTranslation(lang) {
        const dict = localDict[lang] || localDict.vi;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.textContent = dict[key];
        });
        const titleEl = document.querySelector('title[data-i18n]');
        if (titleEl && dict[titleEl.getAttribute('data-i18n')]) document.title = dict[titleEl.getAttribute('data-i18n')];
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && dict['meta-desc']) metaDesc.setAttribute('content', dict['meta-desc']);
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords && dict['meta-keywords']) metaKeywords.setAttribute('content', dict['meta-keywords']);
    }

    // ─── State ────────────────────────────────────────────────────────────
    let fileQueue = [];
    let logoImage = null;
    let activePos = 'mid-center';
    let wmType = 'text';
    let activeQueueIdx = 0;

    // ─── DOM refs ─────────────────────────────────────────────────────────
    const dropzone        = document.getElementById('dropzone');
    const fileUpload      = document.getElementById('file-upload');
    const canvas          = document.getElementById('preview-canvas');
    const ctx             = canvas.getContext('2d');
    const placeholder     = document.getElementById('placeholder-text');
    const previewFilename = document.getElementById('preview-filename');
    const previewBadge    = document.getElementById('preview-size-badge');
    const queueBox        = document.getElementById('queue-box');
    const queueList       = document.getElementById('queue-list');
    const btnClear        = document.getElementById('btn-clear-queue');
    const btnDlAll        = document.getElementById('btn-download-all');
    const wmText          = document.getElementById('wm-text');
    const wmFont          = document.getElementById('wm-font');
    const wmColor         = document.getElementById('wm-color');
    const wmSize          = document.getElementById('wm-size');
    const wmSizeVal       = document.getElementById('wm-size-val');
    const wmOpacity       = document.getElementById('wm-opacity');
    const wmOpacityVal    = document.getElementById('wm-opacity-val');
    const wmRotation      = document.getElementById('wm-rotation');
    const wmRotationVal   = document.getElementById('wm-rotation-val');
    const logoUpload      = document.getElementById('logo-upload');
    const btnSelectLogo   = document.getElementById('btn-select-logo');
    const logoFilename    = document.getElementById('logo-filename');
    const settingsText    = document.getElementById('settings-text-block');
    const settingsLogo    = document.getElementById('settings-logo-block');

    // ─── Sliders ──────────────────────────────────────────────────────────
    wmSize.addEventListener('input', () => { wmSizeVal.textContent = wmSize.value + '%'; renderPreview(); });
    wmOpacity.addEventListener('input', () => { wmOpacityVal.textContent = wmOpacity.value + '%'; renderPreview(); });
    wmRotation.addEventListener('input', () => { wmRotationVal.textContent = wmRotation.value + '°'; renderPreview(); });
    wmText.addEventListener('input', renderPreview);
    wmFont.addEventListener('change', renderPreview);
    wmColor.addEventListener('input', renderPreview);

    // ─── Type switch ──────────────────────────────────────────────────────
    document.querySelectorAll('.tab-opt').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-opt').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            wmType = btn.dataset.type;
            settingsText.style.display = wmType === 'text' ? '' : 'none';
            settingsLogo.style.display = wmType === 'logo' ? '' : 'none';
            renderPreview();
        });
    });

    // ─── Placement grid ───────────────────────────────────────────────────
    document.querySelectorAll('.placement-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.placement-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activePos = btn.dataset.pos;
            renderPreview();
        });
    });

    // ─── File Upload ──────────────────────────────────────────────────────
    dropzone.addEventListener('click', () => fileUpload.click());
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', e => {
        e.preventDefault(); dropzone.classList.remove('dragover');
        handleFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')));
    });
    fileUpload.addEventListener('change', () => handleFiles(Array.from(fileUpload.files)));

    function handleFiles(files) {
        files.forEach(file => fileQueue.push({ file, objectUrl: URL.createObjectURL(file), name: file.name }));
        updateQueue();
        if (fileQueue.length) loadPreview(fileQueue.length - 1);
    }

    // ─── Logo Upload ──────────────────────────────────────────────────────
    btnSelectLogo.addEventListener('click', () => logoUpload.click());
    logoUpload.addEventListener('change', () => {
        if (!logoUpload.files[0]) return;
        logoFilename.textContent = logoUpload.files[0].name;
        const img = new Image();
        img.src = URL.createObjectURL(logoUpload.files[0]);
        img.onload = () => { logoImage = img; renderPreview(); };
    });

    // ─── Sample ───────────────────────────────────────────────────────────
    document.getElementById('btn-load-sample').addEventListener('click', () => {
        const fc = document.createElement('canvas');
        fc.width = 800; fc.height = 600;
        const fx = fc.getContext('2d');
        const grad = fx.createLinearGradient(0, 0, 800, 600);
        grad.addColorStop(0, '#0f2027'); grad.addColorStop(0.5, '#203a43'); grad.addColorStop(1, '#2c5364');
        fx.fillStyle = grad; fx.fillRect(0, 0, 800, 600);
        fx.fillStyle = 'rgba(255,255,255,0.08)';
        for (let i = 0; i < 15; i++) {
            fx.beginPath();
            fx.arc(Math.random()*800, Math.random()*600, Math.random()*80+20, 0, Math.PI*2);
            fx.fill();
        }
        fx.fillStyle = 'rgba(20,184,166,0.3)';
        fx.beginPath(); fx.arc(400, 300, 160, 0, Math.PI*2); fx.fill();
        fc.toBlob(blob => handleFiles([new File([blob], 'sample.jpg', {type: 'image/jpeg'})]), 'image/jpeg', 0.9);
    });

    // ─── Queue ────────────────────────────────────────────────────────────
    function updateQueue() {
        queueList.innerHTML = '';
        const hasItems = fileQueue.length > 0;
        queueBox.style.display  = hasItems ? '' : 'none';
        btnClear.style.display  = hasItems ? 'flex' : 'none';
        btnDlAll.style.display  = hasItems ? 'flex' : 'none';

        fileQueue.forEach((item, idx) => {
            const el = document.createElement('div');
            el.className = 'queue-item' + (idx === activeQueueIdx ? ' active' : '');
            el.innerHTML = `
                <div class="queue-item-info">
                    <img class="queue-item-thumb" src="${item.objectUrl}">
                    <div class="queue-item-details">
                        <span class="queue-item-name">${item.name}</span>
                        <span class="queue-item-size">${formatBytes(item.file.size)}</span>
                    </div>
                </div>
                <div class="queue-item-actions">
                    <button class="btn-icon btn-delete" title="Remove">
                        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>
                </div>`;
            el.querySelector('.queue-item-info').addEventListener('click', () => loadPreview(idx));
            el.querySelector('.btn-delete').addEventListener('click', e => {
                e.stopPropagation();
                URL.revokeObjectURL(item.objectUrl);
                fileQueue.splice(idx, 1);
                if (activeQueueIdx >= fileQueue.length) activeQueueIdx = Math.max(0, fileQueue.length - 1);
                updateQueue();
                fileQueue.length ? loadPreview(activeQueueIdx) : clearPreview();
            });
            queueList.appendChild(el);
        });
    }

    function clearPreview() {
        canvas.style.display = 'none'; placeholder.style.display = '';
        previewFilename.textContent = '—'; previewBadge.textContent = '—';
    }

    function loadPreview(idx) {
        activeQueueIdx = idx; updateQueue();
        const item = fileQueue[idx]; if (!item) return clearPreview();
        const img = new Image();
        img.src = item.objectUrl;
        img.onload = () => {
            canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
            canvas._base = img;
            previewFilename.textContent = item.name;
            previewBadge.textContent = img.naturalWidth + 'x' + img.naturalHeight + ' px';
            placeholder.style.display = 'none'; canvas.style.display = 'block';
            renderPreview();
        };
    }

    // ─── Render ───────────────────────────────────────────────────────────
    function renderPreview() {
        if (!canvas._base) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(canvas._base, 0, 0);
        applyWatermark(ctx, canvas.width, canvas.height);
    }

    function applyWatermark(c, W, H) {
        const opacity   = parseFloat(wmOpacity.value) / 100;
        const sizePct   = parseFloat(wmSize.value) / 100;
        const rotation  = parseFloat(wmRotation.value) * Math.PI / 180;
        c.save(); c.globalAlpha = opacity;
        if (wmType === 'text') {
            const fontSize = Math.round(W * sizePct * 0.2);
            c.font = `bold ${fontSize}px '${wmFont.value}', sans-serif`;
            c.fillStyle = wmColor.value;
            const text = wmText.value || 'Watermark';
            const tw = c.measureText(text).width, th = fontSize;
            const [cx, cy] = getCenter(activePos, W, H, tw, th);
            c.translate(cx + tw/2, cy + th/2); c.rotate(rotation);
            c.fillText(text, -tw/2, th*0.35);
        } else if (wmType === 'logo' && logoImage) {
            const lw = Math.round(W * sizePct);
            const lh = Math.round(lw * logoImage.naturalHeight / logoImage.naturalWidth);
            const [cx, cy] = getCenter(activePos, W, H, lw, lh);
            c.translate(cx + lw/2, cy + lh/2); c.rotate(rotation);
            c.drawImage(logoImage, -lw/2, -lh/2, lw, lh);
        }
        c.restore();
    }

    function getCenter(pos, W, H, tw, th) {
        const pad = Math.round(W * 0.03);
        const m = {
            'top-left':      [pad, pad],
            'top-center':    [(W-tw)/2, pad],
            'top-right':     [W-tw-pad, pad],
            'mid-left':      [pad, (H-th)/2],
            'mid-center':    [(W-tw)/2, (H-th)/2],
            'mid-right':     [W-tw-pad, (H-th)/2],
            'bottom-left':   [pad, H-th-pad],
            'bottom-center': [(W-tw)/2, H-th-pad],
            'bottom-right':  [W-tw-pad, H-th-pad]
        };
        return m[pos] || m['mid-center'];
    }

    // ─── Download All ─────────────────────────────────────────────────────
    btnDlAll.addEventListener('click', async () => {
        for (let i = 0; i < fileQueue.length; i++) await downloadOne(i);
    });

    function downloadOne(idx) {
        return new Promise(resolve => {
            const item = fileQueue[idx];
            const img = new Image(); 
            img.src = item.objectUrl;
            img.onload = () => {
                const off = document.createElement('canvas');
                off.width = img.naturalWidth; off.height = img.naturalHeight;
                const oc = off.getContext('2d');
                oc.drawImage(img, 0, 0); 
                applyWatermark(oc, off.width, off.height);
                off.toBlob(blob => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; 
                    a.download = 'wm_' + item.name; 
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(url), 1000); 
                    resolve();
                }, item.file.type || 'image/jpeg', 0.92);
            };
            img.onerror = () => resolve();
        });
    }

    // ─── Clear ────────────────────────────────────────────────────────────
    btnClear.addEventListener('click', () => {
        fileQueue.forEach(f => URL.revokeObjectURL(f.objectUrl));
        fileQueue = []; activeQueueIdx = 0; clearPreview(); updateQueue();
    });

    // ─── Mobile tabs ──────────────────────────────────────────────────────
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const t = btn.dataset.target;
            document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active-panel'));
            document.getElementById(t).classList.add('active-panel');
            document.querySelectorAll('.mobile-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    function formatBytes(b) {
        if (b < 1024) return b + ' B';
        if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
        return (b/1048576).toFixed(2) + ' MB';
    }

    const initLang = localStorage.getItem('preferred-lang') || 'vi';
    applyLocalTranslation(initLang);
    window.addEventListener('languageChanged', e => applyLocalTranslation(e.detail?.lang || localStorage.getItem('preferred-lang') || 'vi'));
})();
