(function () {
    'use strict';

    const localDict = {
        vi: {
            'crop-title-page': 'Cắt & Xoay Ảnh Trực Tuyến - Silver Cat Tools',
            'meta-desc': 'Công cụ cắt ảnh, xoay ảnh, lật ảnh trực tuyến miễn phí và an toàn. Xử lý ảnh nhanh chóng mà không cần cài đặt.',
            'meta-keywords': 'cắt ảnh online, crop ảnh, xoay ảnh, lật ảnh, chỉnh sửa ảnh cơ bản',
            'back-home': 'Quay lại Trang Chủ',
            'crop-head': 'Cắt & Xoay',
            'crop-head-sub': 'Hình Ảnh',
            'crop-desc': 'Cắt ảnh theo tỷ lệ, xoay góc hoặc lật hình ảnh trực quan, nhanh chóng hoàn toàn tại local.',
            'drop-title': 'Kéo thả ảnh hoặc click để tải',
            'controls-title': 'Công cụ',
            'lbl-aspect-ratio': 'Tỷ Lệ Khung Hình',
            'lbl-actions': 'Hành Động',
            'btn-crop-download': 'Cắt & Tải Về',
            'footer-copyright': '© 2026 Silver Cat Tools. Được xây dựng cho hiệu suất tối ưu và bảo mật tối đa.'
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
    
    let cropper = null;
    let currentFileName = 'cropped.png';

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
                background: false
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
            }
        });
    });

    let scaleX = 1;
    let scaleY = 1;
    document.getElementById('btn-rotate-left').addEventListener('click', () => { if(cropper) cropper.rotate(-90); });
    document.getElementById('btn-rotate-right').addEventListener('click', () => { if(cropper) cropper.rotate(90); });
    document.getElementById('btn-flip-h').addEventListener('click', () => { if(cropper) { scaleX = -scaleX; cropper.scaleX(scaleX); }});
    document.getElementById('btn-flip-v').addEventListener('click', () => { if(cropper) { scaleY = -scaleY; cropper.scaleY(scaleY); }});

    btnCrop.addEventListener('click', () => {
        if (!cropper) return alert('Vui lòng tải ảnh lên trước.');
        const canvas = cropper.getCroppedCanvas({
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        
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
