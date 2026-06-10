(function () {
    'use strict';

    const localDict = {
        vi: {
            'crop-title-page': 'Image Cropper & Rotator - Silver Cat Tools',
            'meta-desc': 'Free and secure online image cropper. Crop, rotate, and flip your photos easily without installing any software.',
            'meta-keywords': 'crop image online, image rotator, flip photo, online image editor, basic photo editing',
            'back-home': 'Back to Home',
            'crop-head': 'Image Cropper',
            'crop-head-sub': '& Rotator',
            'crop-desc': 'Crop, rotate, and flip images instantly right in your browser with no quality loss.',
            'drop-title': 'Drag & drop image here or click',
            'controls-title': 'Tools',
            'lbl-aspect-ratio': 'Aspect Ratio',
            'lbl-actions': 'Actions',
            'lbl-resize': 'Output Size (px)',
            'resize-hint': 'Auto-syncs with crop area. Type values to resize freely.',
            'ph-width': 'Width',
            'ph-height': 'Height',
            'lock-title': 'Lock aspect ratio',
            'btn-crop-download': 'Crop & Download',
            'footer-copyright': '© 2026 Silver Cat Tools. Built for optimal performance and privacy.'
        },
        en: {
            'crop-title-page': 'Image Cropper & Rotator - Silver Cat Tools',
            'meta-desc': 'Free and secure online image cropper. Crop, rotate, and flip your photos easily without installing any software.',
            'meta-keywords': 'crop image online, image rotator, flip photo, online image editor, basic photo editing',
            'back-home': 'Back to Home',
            'crop-head': 'Image Cropper',
            'crop-head-sub': '& Rotator',
            'crop-desc': 'Crop, rotate, and flip images instantly right in your browser with no quality loss.',
            'drop-title': 'Drag & drop image here or click',
            'controls-title': 'Tools',
            'lbl-aspect-ratio': 'Aspect Ratio',
            'lbl-actions': 'Actions',
            'lbl-resize': 'Output Size (px)',
            'resize-hint': 'Auto-syncs with crop area. Type values to resize freely.',
            'ph-width': 'Width',
            'ph-height': 'Height',
            'lock-title': 'Lock aspect ratio',
            'btn-crop-download': 'Crop & Download',
            'footer-copyright': '© 2026 Silver Cat Tools. Built for optimal performance and privacy.'
        }
    };

    function applyLocalTranslation(lang) {
        const dict = localDict[lang] || localDict['vi'];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.textContent = dict[key];
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key]) el.setAttribute('placeholder', dict[key]);
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (dict[key]) el.setAttribute('title', dict[key]);
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

    const dropzone = document.getElementById('dropzone');
    const fileUpload = document.getElementById('file-upload');
    const editorContainer = document.getElementById('editor-container');
    const imageToCrop = document.getElementById('image-to-crop');
    const btnCrop = document.getElementById('btn-crop');
    const widthInput = document.getElementById('resize-width');
    const heightInput = document.getElementById('resize-height');
    const btnLockRatio = document.getElementById('btn-lock-ratio');
    const lockIconOn = document.getElementById('lock-icon-on');
    const lockIconOff = document.getElementById('lock-icon-off');

    let cropper = null;
    let currentFileName = 'cropped.png';
    let lockRatio = true;
    let currentRatio = 1;
    let syncing = false;

    dropzone.addEventListener('click', () => fileUpload.click());
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', e => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
    });
    fileUpload.addEventListener('change', () => handleFile(fileUpload.files[0]));

    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        currentFileName = file.name;
        const reader = new FileReader();
        reader.onload = e => {
            imageToCrop.src = e.target.result;
            dropzone.style.display = 'none';
            editorContainer.style.display = 'block';
            
            if (cropper) cropper.destroy();
            cropper = new Cropper(imageToCrop, {
                aspectRatio: NaN,
                viewMode: 1,
                background: false,
                ready: syncDimsFromCrop,
                cropend: syncDimsFromCrop
            });
        };
        reader.readAsDataURL(file);
    }

    document.querySelectorAll('.aspect-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.aspect-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (cropper) {
                cropper.setAspectRatio(parseFloat(btn.dataset.ratio));
                syncDimsFromCrop();
            }
        });
    });

    function syncDimsFromCrop() {
        if (!cropper) return;
        const d = cropper.getData(true);
        if (!d.width || !d.height) return;
        syncing = true;
        widthInput.value = d.width;
        heightInput.value = d.height;
        currentRatio = d.width / d.height;
        syncing = false;
    }

    widthInput.addEventListener('input', () => {
        if (syncing) return;
        const w = parseFloat(widthInput.value);
        if (lockRatio && w > 0 && currentRatio > 0) {
            syncing = true;
            heightInput.value = Math.max(1, Math.round(w / currentRatio));
            syncing = false;
        }
    });
    heightInput.addEventListener('input', () => {
        if (syncing) return;
        const h = parseFloat(heightInput.value);
        if (lockRatio && h > 0 && currentRatio > 0) {
            syncing = true;
            widthInput.value = Math.max(1, Math.round(h * currentRatio));
            syncing = false;
        }
    });
    btnLockRatio.addEventListener('click', () => {
        lockRatio = !lockRatio;
        btnLockRatio.classList.toggle('active', lockRatio);
        lockIconOn.style.display = lockRatio ? '' : 'none';
        lockIconOff.style.display = lockRatio ? 'none' : '';
        const w = parseFloat(widthInput.value);
        const h = parseFloat(heightInput.value);
        if (lockRatio && w > 0 && h > 0) currentRatio = w / h;
    });

    let scaleX = 1;
    let scaleY = 1;
    document.getElementById('btn-rotate-left').addEventListener('click', () => { if(cropper) cropper.rotate(-90); });
    document.getElementById('btn-rotate-right').addEventListener('click', () => { if(cropper) cropper.rotate(90); });
    document.getElementById('btn-flip-h').addEventListener('click', () => { if(cropper) { scaleX = -scaleX; cropper.scaleX(scaleX); }});
    document.getElementById('btn-flip-v').addEventListener('click', () => { if(cropper) { scaleY = -scaleY; cropper.scaleY(scaleY); }});

    btnCrop.addEventListener('click', () => {
        if (!cropper) return alert('Vui lòng tải ảnh lên trước.');
        const opts = {
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        };
        const tw = parseInt(widthInput.value, 10);
        const th = parseInt(heightInput.value, 10);
        if (tw > 0) opts.width = tw;
        if (th > 0) opts.height = th;
        const canvas = cropper.getCroppedCanvas(opts);
        
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cropped-' + currentFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png', 1.0);
    });

    window.addEventListener('languageChanged', (e) => applyLocalTranslation(e.detail.lang));
    const savedLang = localStorage.getItem('sct_lang') || 'vi';
    applyLocalTranslation(savedLang);

})();
