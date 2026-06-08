document.addEventListener('DOMContentLoaded', () => {
    // Mobile Tabs Logic
    const tabBtnSettings = document.getElementById('tab-btn-settings');
    const tabBtnPreview = document.getElementById('tab-btn-preview');
    const settingsPanel = document.getElementById('settings-panel');
    const previewPanel = document.getElementById('preview-panel');

    tabBtnSettings.addEventListener('click', () => {
        tabBtnSettings.classList.add('active');
        tabBtnPreview.classList.remove('active');
        settingsPanel.classList.add('active-panel');
        previewPanel.classList.remove('active-panel');
    });

    tabBtnPreview.addEventListener('click', () => {
        tabBtnPreview.classList.add('active');
        tabBtnSettings.classList.remove('active');
        previewPanel.classList.add('active-panel');
        settingsPanel.classList.remove('active-panel');
    });

    // Debounce timer for auto compression
    let debounceTimer = null;
    function debouncedCompress() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (loadedImage) {
                compressImage();
            }
        }, 150);
    }

    // Quality Slider value indicator
    const slider = document.getElementById('quality-slider');
    const sliderVal = document.getElementById('quality-val');
    slider.addEventListener('input', (e) => {
        sliderVal.textContent = e.target.value + '%';
        debouncedCompress();
    });

    // Dimensions Select Logic
    const scaleMode = document.getElementById('scale-mode');
    const customDimsBox = document.getElementById('custom-dims-box');
    scaleMode.addEventListener('change', () => {
        if (scaleMode.value === 'custom') {
            customDimsBox.style.display = 'grid';
        } else {
            customDimsBox.style.display = 'none';
        }
        if (loadedImage) {
            compressImage();
        }
    });

    // Aspect Ratio Linkage
    const wInput = document.getElementById('custom-width');
    const hInput = document.getElementById('custom-height');
    const aspectLock = document.getElementById('aspect-lock');
    let originalAspect = 1.0;

    wInput.addEventListener('input', () => {
        if (aspectLock.checked && loadedImage) {
            hInput.value = Math.round(wInput.value / originalAspect);
        }
        debouncedCompress();
    });

    hInput.addEventListener('input', () => {
        if (aspectLock.checked && loadedImage) {
            wInput.value = Math.round(hInput.value * originalAspect);
        }
        debouncedCompress();
    });

    // Dropzone Drag and Drop handlers
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    });

    // Core Compressor Logic
    let loadedImage = null;
    let originalFileSize = 0;
    let compressedBlob = null;
    let originalFileName = 'compressed-image';

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function processFile(file) {
        if (!file.type.match('image.*')) {
            alert('Please upload a valid image file!');
            return;
        }
        originalFileSize = file.size;
        originalFileName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

        const reader = new FileReader();
        reader.onload = (e) => {
            loadedImage = new Image();
            loadedImage.onload = () => {
                originalAspect = loadedImage.naturalWidth / loadedImage.naturalHeight;
                wInput.value = loadedImage.naturalWidth;
                hInput.value = loadedImage.naturalHeight;

                // Display original stats
                document.getElementById('orig-size').textContent = formatBytes(originalFileSize);
                document.getElementById('orig-dims').textContent = `${loadedImage.naturalWidth} x ${loadedImage.naturalHeight} px`;
                document.getElementById('img-orig-preview').src = e.target.result;
                document.getElementById('orig-box').style.display = 'flex';

                // Auto execute initial compression
                compressImage();
            };
            loadedImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function compressImage() {
        try {
            console.log('compressImage started');
            if (!loadedImage) {
                alert('Please upload an image first!');
                return;
            }

            // Determine target width/height
            let targetWidth = loadedImage.naturalWidth;
            let targetHeight = loadedImage.naturalHeight;
            const mode = scaleMode.value;
            console.log('Scale Mode:', mode, 'Original dimensions:', targetWidth, 'x', targetHeight);

            if (mode === 'scale-75') {
                targetWidth = Math.round(loadedImage.naturalWidth * 0.75);
                targetHeight = Math.round(loadedImage.naturalHeight * 0.75);
            } else if (mode === 'scale-50') {
                targetWidth = Math.round(loadedImage.naturalWidth * 0.50);
                targetHeight = Math.round(loadedImage.naturalHeight * 0.50);
            } else if (mode === 'custom') {
                targetWidth = parseInt(wInput.value) || loadedImage.naturalWidth;
                targetHeight = parseInt(hInput.value) || loadedImage.naturalHeight;
            }
            console.log('Target dimensions:', targetWidth, 'x', targetHeight);

            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(loadedImage, 0, 0, targetWidth, targetHeight);

            // Read quality
            const quality = parseFloat(slider.value) / 100;
            console.log('Compression Quality:', quality);
            
            // Compress to WebP or JPEG based on input type (defaults to JPEG)
            const mimeType = 'image/jpeg';

            console.log('Running canvas.toBlob...');
            canvas.toBlob((blob) => {
                try {
                    if (!blob) {
                        console.error('canvas.toBlob returned null blob');
                        alert('Error: canvas.toBlob returned null blob.');
                        return;
                    }
                    console.log('Blob generated successfully. Size:', blob.size);
                    compressedBlob = blob;

                    // Display compressed preview & stats
                    const compUrl = URL.createObjectURL(blob);
                    document.getElementById('img-comp-preview').src = compUrl;
                    document.getElementById('comp-size').textContent = formatBytes(blob.size);
                    document.getElementById('comp-dims').textContent = `${targetWidth} x ${targetHeight} px`;
                    document.getElementById('comp-box').style.display = 'flex';

                    // Savings calculation
                    const savings = originalFileSize - blob.size;
                    const savingsPct = Math.round((savings / originalFileSize) * 100);
                    
                    const pctElement = document.getElementById('savings-pct');
                    const widget = document.getElementById('savings-widget');
                    const savingTitle = document.getElementById('lbl-saving-title');
                    const savingDesc = document.getElementById('lbl-saving-desc');

                    if (savingsPct > 0) {
                        pctElement.textContent = `-${savingsPct}%`;
                        savingTitle.textContent = 'File size shrunk successfully!';
                        savingDesc.textContent = `Reduced from ${formatBytes(originalFileSize)} to ${formatBytes(blob.size)}.`;
                    } else {
                        pctElement.textContent = `+${Math.abs(savingsPct)}%`;
                        savingTitle.textContent = 'Optimized file size is larger';
                        savingDesc.textContent = 'Adjust quality slider lower or scale down dimensions to shrink the file size.';
                    }
                    
                    widget.style.display = 'flex';
                    document.getElementById('btn-download').style.display = 'inline-flex';

                    // Auto switch to preview panel on mobile so user sees output
                    if (window.innerWidth <= 992) {
                        tabBtnPreview.click();
                    }
                } catch (innerErr) {
                    console.error('Error inside toBlob callback:', innerErr);
                    alert('Callback Error: ' + innerErr.message);
                }
            }, mimeType, quality);
        } catch (err) {
            console.error('Error in compressImage:', err);
            alert('Error: ' + err.message);
        }
    }

    // Load Sample Image Function (Draws beautiful abstract gradient local canvas to simulate upload)
    const sampleBtn = document.getElementById('btn-load-sample');
    sampleBtn.addEventListener('click', () => {
        const sampleCanvas = document.createElement('canvas');
        sampleCanvas.width = 1200;
        sampleCanvas.height = 800;
        const sampleCtx = sampleCanvas.getContext('2d');

        // Draw gorgeous gradient background
        const grad = sampleCtx.createLinearGradient(0, 0, 1200, 800);
        grad.addColorStop(0, '#111827');
        grad.addColorStop(0.5, '#0d9488');
        grad.addColorStop(1, '#6366f1');
        sampleCtx.fillStyle = grad;
        sampleCtx.fillRect(0, 0, 1200, 800);

        // Add grid lines for compression verification
        sampleCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        sampleCtx.lineWidth = 1;
        for (let i = 0; i < 1200; i += 40) {
            sampleCtx.beginPath();
            sampleCtx.moveTo(i, 0);
            sampleCtx.lineTo(i, 800);
            sampleCtx.stroke();
        }
        for (let j = 0; j < 800; j += 40) {
            sampleCtx.beginPath();
            sampleCtx.moveTo(0, j);
            sampleCtx.lineTo(1200, j);
            sampleCtx.stroke();
        }

        // Add some artwork circles
        sampleCtx.beginPath();
        sampleCtx.arc(600, 400, 150, 0, 2 * Math.PI);
        sampleCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        sampleCtx.fill();

        // Add logo brand text
        sampleCtx.font = 'bold 50px Inter, system-ui';
        sampleCtx.fillStyle = '#111827';
        sampleCtx.textAlign = 'center';
        sampleCtx.fillText('Silver Cat Tools', 600, 415);

        sampleCtx.font = '28px "Be Vietnam Pro"';
        sampleCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        sampleCtx.fillText('Image Compression Sample File (1200x800 px)', 600, 600);

        // Convert canvas to File object to process normally
        sampleCanvas.toBlob((blob) => {
            const sampleFile = new File([blob], 'sample-image.jpg', { type: 'image/jpeg' });
            processFile(sampleFile);
        }, 'image/jpeg', 0.95);
    });

    // Action triggers
    const downloadBtn = document.getElementById('btn-download');
    downloadBtn.addEventListener('click', () => {
        if (!compressedBlob) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(compressedBlob);
        link.download = `${originalFileName}-optimized.jpg`;
        link.click();
    });

});
