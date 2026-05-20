(function () {
    'use strict';

    const localDict = {
        vi: {
            'pdf-title-page': 'Ghép Ảnh Thành PDF - Silver Cat Tools',
            'meta-desc': 'Ghép nhiều ảnh thành một tài liệu PDF chất lượng cao ngay trong trình duyệt, không cần cài phần mềm.',
            'meta-keywords': 'image to pdf, ghép pdf, chuyển ảnh pdf, tạo pdf từ ảnh, pdf generator',
            'back-home': 'Quay lại Trang Chủ',
            'pdf-head': 'Ghép Ảnh',
            'pdf-head-sub': 'Thành PDF',
            'pdf-desc': 'Chọn nhiều ảnh, sắp xếp thứ tự và tạo file PDF trong chớp mắt.',
            'mob-upload': 'Tải Ảnh',
            'mob-result': 'Kết Quả PDF',
            'upload-title': 'Tải Ảnh & Sắp Xếp',
            'drop-title': 'Kéo thả ảnh hoặc click để tải',
            'lbl-paper-size': 'Khổ giấy',
            'lbl-orientation': 'Hướng giấy',
            'orient-portrait': 'Dọc',
            'orient-landscape': 'Ngang',
            'btn-generate-pdf': 'Tạo PDF',
            'result-title': 'Kết Quả PDF',
            'no-pdf': 'Chưa có PDF. Vui lòng tải ảnh và nhấn "Tạo PDF".',
            'btn-download-pdf': 'Tải PDF',
            'footer-copyright': '© 2026 Silver Cat Tools. Được xây dựng cho hiệu suất tối ưu và bảo mật tối đa.'
        },
        en: {
            'pdf-title-page': 'Image to PDF - Silver Cat Tools',
            'meta-desc': 'Combine multiple images into a high-quality PDF document directly in your browser. Fast and secure.',
            'meta-keywords': 'image to pdf converter, jpg to pdf, png to pdf, combine images to pdf, online pdf generator',
            'back-home': 'Back to Home',
            'pdf-head': 'Image to',
            'pdf-head-sub': 'PDF',
            'pdf-desc': 'Select multiple images, arrange them, and generate a PDF document instantly.',
            'mob-upload': 'Upload',
            'mob-result': 'PDF Result',
            'upload-title': 'Upload & Arrange',
            'drop-title': 'Drag & drop images here or click',
            'lbl-paper-size': 'Paper Size',
            'lbl-orientation': 'Orientation',
            'orient-portrait': 'Portrait',
            'orient-landscape': 'Landscape',
            'btn-generate-pdf': 'Generate PDF',
            'result-title': 'PDF Result',
            'no-pdf': 'No PDF yet. Upload images and click "Generate PDF".',
            'btn-download-pdf': 'Download PDF',
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

    // Tab Logic
    const tabs = document.querySelectorAll('.mobile-tab-btn');
    const panels = document.querySelectorAll('.tool-panel');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active-panel'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active-panel');
        });
    });

    const dropzone = document.getElementById('dropzone');
    const fileUpload = document.getElementById('file-upload');
    const btnGenerate = document.getElementById('btn-generate');
    const pdfResult = document.getElementById('pdf-result');
    const paperSize = document.getElementById('paper-size');
    const paperOrient = document.getElementById('paper-orient');

    let images = []; 
    
    const listContainer = document.createElement('div');
    listContainer.className = 'image-list';
    listContainer.style.display = 'flex';
    listContainer.style.flexWrap = 'wrap';
    listContainer.style.gap = '10px';
    listContainer.style.marginTop = '20px';
    dropzone.parentNode.insertBefore(listContainer, dropzone.nextSibling);

    dropzone.addEventListener('click', () => fileUpload.click());
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', e => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    fileUpload.addEventListener('change', () => handleFiles(fileUpload.files));

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = e => {
                const img = new Image();
                img.onload = () => {
                    images.push({ file, dataUrl: e.target.result, width: img.width, height: img.height });
                    renderList();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function renderList() {
        listContainer.innerHTML = '';
        images.forEach((item, index) => {
            const div = document.createElement('div');
            div.style.position = 'relative';
            div.style.width = '100px';
            div.style.height = '100px';
            div.style.border = '2px solid var(--border-color)';
            div.style.borderRadius = '8px';
            div.style.overflow = 'hidden';

            const img = document.createElement('img');
            img.src = item.dataUrl;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';

            const btnRemove = document.createElement('button');
            btnRemove.innerHTML = '×';
            btnRemove.style.position = 'absolute';
            btnRemove.style.top = '2px';
            btnRemove.style.right = '2px';
            btnRemove.style.background = 'rgba(255,0,0,0.7)';
            btnRemove.style.color = '#fff';
            btnRemove.style.border = 'none';
            btnRemove.style.borderRadius = '50%';
            btnRemove.style.width = '24px';
            btnRemove.style.height = '24px';
            btnRemove.style.cursor = 'pointer';
            btnRemove.onclick = () => {
                images.splice(index, 1);
                renderList();
            };

            div.appendChild(img);
            div.appendChild(btnRemove);
            listContainer.appendChild(div);
        });
    }

    btnGenerate.addEventListener('click', async () => {
        if (images.length === 0) return alert('Vui lòng thêm ít nhất một ảnh.');
        
        btnGenerate.textContent = 'Đang xử lý...';
        btnGenerate.disabled = true;

        try {
            const { jsPDF } = window.jspdf;
            const size = paperSize.value;
            const orient = paperOrient.value; 

            const doc = new jsPDF({
                orientation: orient,
                unit: 'mm',
                format: size
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            for (let i = 0; i < images.length; i++) {
                if (i > 0) doc.addPage();
                const item = images[i];
                
                const imgRatio = item.width / item.height;
                const pageRatio = pageWidth / pageHeight;
                
                let drawWidth = pageWidth;
                let drawHeight = pageHeight;
                let x = 0;
                let y = 0;

                if (imgRatio > pageRatio) {
                    drawHeight = pageWidth / imgRatio;
                    y = (pageHeight - drawHeight) / 2;
                } else {
                    drawWidth = pageHeight * imgRatio;
                    x = (pageWidth - drawWidth) / 2;
                }

                let format = 'JPEG';
                if (item.file.type === 'image/png') format = 'PNG';
                else if (item.file.type === 'image/webp') format = 'WEBP';

                doc.addImage(item.dataUrl, format, x, y, drawWidth, drawHeight);
            }

            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);

            pdfResult.innerHTML = `
                <iframe src="${pdfUrl}" width="100%" height="400px" style="border:1px solid var(--border-color); border-radius:12px; margin-bottom:20px;"></iframe>
                <button class="btn btn-primary" id="btn-download-pdf-actual">Tải PDF Xuống</button>
            `;

            document.getElementById('btn-download-pdf-actual').onclick = () => {
                const a = document.createElement('a');
                a.href = pdfUrl;
                a.download = 'images.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };

            if (window.innerWidth <= 768) {
                if(tabs.length > 1) tabs[1].click();
            }

        } catch (e) {
            console.error(e);
            alert('Lỗi tạo PDF: ' + e.message);
        }

        btnGenerate.textContent = localDict[window.currentLang || 'vi']?.['btn-generate-pdf'] || 'Tạo PDF';
        btnGenerate.disabled = false;
    });

    window.addEventListener('languageChanged', (e) => applyLocalTranslation(e.detail.lang));
    const savedLang = localStorage.getItem('sct_lang') || 'vi';
    applyLocalTranslation(savedLang);

})();
