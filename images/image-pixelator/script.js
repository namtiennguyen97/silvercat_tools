(function () {
    'use strict';

    const localDict = {
        vi: {
            'pixel-title-page': 'Tạo Ảnh Pixel Art & Mosaics - Silver Cat Tools',
            'meta-desc': 'Convert images to 8-bit Pixel Art or mosaic style right in your browser, free.',
            'meta-keywords': 'ảnh pixel, pixel art, 8-bit image, mosaic photo, tạo ảnh pixel online',
            'back-home': 'Quay lại Home',
            'pixel-head': 'Tạo Ảnh Pixel',
            'pixel-head-sub': '8-bit & Mosaics',
            'pixel-desc': 'Transform your photo into a unique retro 8-bit pixel art style right in your browser.',
            'mob-settings': 'Cấu Hình',
            'mob-preview': 'Result',
            'drop-title': 'Kéo thả ảnh hoặc click để tải',
            'controls-title': 'Cài Đặt Pixel',
            'lbl-pixel-size': 'Pixel Size',
            'btn-download-img': 'Tải Ảnh Về',
            'footer-copyright': '© 2026 Silver Cat Tools. Built for optimal performance and premium experience.'
        },
        en: {
            'pixel-title-page': 'Pixel Art & Mosaics Generator - Silver Cat Tools',
            'meta-desc': 'Transform your images into cool retro 8-bit pixel art or mosaic style directly in your browser. Free online tool.',
            'meta-keywords': 'pixel art generator, 8-bit image maker, image to pixel, retro photo effect, mosaic generator',
            'back-home': 'Back to Home',
            'pixel-head': 'Pixel Art',
            'pixel-head-sub': 'Generator',
            'pixel-desc': 'Transform your photos into retro 8-bit pixel art styles instantly in your browser.',
            'mob-settings': 'Settings',
            'mob-preview': 'Preview',
            'drop-title': 'Drag & drop image here or click',
            'controls-title': 'Pixel Settings',
            'lbl-pixel-size': 'Pixel Size',
            'btn-download-img': 'Download Image',
            'footer-copyright': '© 2026 Silver Cat Tools. Built for optimal performance and privacy.'
        }
    };

    function applyLocalTranslation(lang) {
        const dict = localDict[lang] || localDict['vi'];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.textContent = dict[key];
        });
        const titleKey = document.querySelector('title[data-i18n]');
        if (titleKey && dict[titleKey.getAttribute('data-i18n')]) {
            document.title = dict[titleKey.getAttribute('data-i18n')];
        }
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && dict['meta-desc']) metaDesc.setAttribute('content', dict['meta-desc']);
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords && dict['meta-keywords']) metaKeywords.setAttribute('content', dict['meta-keywords']);
    }

    const dropzone = document.getElementById('dropzone');
    const fileUpload = document.getElementById('file-upload');
    const editorContainer = document.getElementById('editor-container');
    const canvas = document.getElementById('pixel-canvas');
    const ctx = canvas.getContext('2d');
    const btnDownload = document.getElementById('btn-download');
    const pixelSizeSlider = document.getElementById('pixel-size');
    const pixelSizeVal = document.getElementById('pixel-size-val');
    
    let originalImage = null;
    let currentFileName = 'pixelated.png';

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
            const img = new Image();
            img.onload = () => {
                originalImage = img;
                dropzone.style.display = 'none';
                editorContainer.style.display = 'block';
                canvas.width = img.width;
                canvas.height = img.height;
                renderPixelated();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function renderPixelated() {
        if (!originalImage) return;
        
        let pSize = parseInt(pixelSizeSlider.value);
        if(pSize < 1) pSize = 1;
        
        const scaledW = Math.max(1, Math.floor(originalImage.width / pSize));
        const scaledH = Math.max(1, Math.floor(originalImage.height / pSize));
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = scaledW;
        tempCanvas.height = scaledH;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(originalImage, 0, 0, scaledW, scaledH);
        
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0, scaledW, scaledH, 0, 0, canvas.width, canvas.height);
    }

    pixelSizeSlider.addEventListener('input', () => {
        pixelSizeVal.textContent = pixelSizeSlider.value;
        renderPixelated();
    });

    btnDownload.addEventListener('click', () => {
        if (!originalImage) return alert('Vui lòng tải ảnh lên trước.');
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'pixel-' + currentFileName;
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
