document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const btnSample = document.getElementById('btn-load-sample');
    const btnDownload = document.getElementById('btn-download');
    const btnNew = document.getElementById('btn-new');
    const compareContainer = document.getElementById('compare-container');
    const processingState = document.getElementById('processing-state');
    const placeholderState = document.getElementById('placeholder-state');
    const resultActions = document.getElementById('result-actions');
    const imgOriginal = document.getElementById('img-original');
    const imgResult = document.getElementById('img-result');
    const progressBar = document.getElementById('progress-bar');
    const processingDetail = document.getElementById('processing-detail');

    let resultBlob = null;
    let originalFileName = 'image';

    // Dropzone events
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) processFile(e.target.files[0]);
    });

    // Download
    btnDownload.addEventListener('click', () => {
        if (!resultBlob) return;
        const url = URL.createObjectURL(resultBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalFileName + '-no-bg.png';
        a.click();
        URL.revokeObjectURL(url);
    });

    // New image
    btnNew.addEventListener('click', resetTool);

    function resetTool() {
        fileInput.value = '';
        resultBlob = null;
        imgOriginal.src = '';
        imgResult.src = '';
        compareContainer.style.display = 'none';
        processingState.style.display = 'none';
        placeholderState.style.display = 'flex';
        resultActions.style.display = 'none';
        dropzone.style.display = 'block';
    }

    function processFile(file) {
        if (!file.type.match(/image\/(jpeg|png|webp)/)) {
            alert('Please select a valid image file (JPG, PNG, or WebP).');
            return;
        }

        originalFileName = file.name.replace(/\.[^.]+$/, '');
        dropzone.style.display = 'none';

        // Show original
        const reader = new FileReader();
        reader.onload = (e) => {
            imgOriginal.src = e.target.result;
            removeBackground(file, e.target.result);
        };
        reader.readAsDataURL(file);
    }

    async function removeBackground(file, dataUrl) {
        placeholderState.style.display = 'none';
        compareContainer.style.display = 'none';
        processingState.style.display = 'flex';
        resultActions.style.display = 'none';
        progressBar.style.width = '0%';
        processingDetail.textContent = 'Downloading AI model (first time only)...';

        try {
            // Use @imgly/background-removal which runs entirely offline via WebAssembly
            const blob = await window.removeBackground(file, {
                progress: (key, current, total) => {
                    const pct = Math.round((current / total) * 100);
                    progressBar.style.width = pct + '%';
                    if (key === 'download') processingDetail.textContent = 'Downloading model... ' + pct + '%';
                    else if (key === 'compute') processingDetail.textContent = 'Processing image... ' + pct + '%';
                },
                model: 'isnet_quint8',  // Balanced quality/speed
                output: {
                    format: 'image/png',
                    quality: 1
                }
            });

            resultBlob = blob;
            const url = URL.createObjectURL(blob);

            const img = new Image();
            img.onload = () => {
                imgResult.src = url;
                processingState.style.display = 'none';
                compareContainer.style.display = 'flex';
                resultActions.style.display = 'flex';
            };
            img.src = url;

        } catch (err) {
            console.error('Background removal failed:', err);
            processingState.style.display = 'none';
            placeholderState.style.display = 'flex';
            placeholderState.innerHTML = `<p style="color:#f87171;">⚠️ Background removal failed. The image may be too large or the AI model could not load. Please try a different image.</p>
                <button class="action-btn-sm" onclick="location.reload()" style="margin-top:1rem;">Retry</button>`;
            dropzone.style.display = 'block';
        }
    }

    // Sample image
    btnSample.addEventListener('click', async () => {
        // Draw a sample image with a subject on a colorful background
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');

        // Colorful gradient background
        const grad = ctx.createLinearGradient(0, 0, 600, 500);
        grad.addColorStop(0, '#4f46e5');
        grad.addColorStop(0.5, '#ec4899');
        grad.addColorStop(1, '#06b6d4');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 500);

        // Draw a clear subject (person silhouette)
        // Head
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(300, 140, 60, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.beginPath();
        ctx.moveTo(240, 180);
        ctx.lineTo(200, 320);
        ctx.lineTo(190, 400);
        ctx.lineTo(250, 400);
        ctx.lineTo(270, 320);
        ctx.lineTo(300, 200);
        ctx.lineTo(330, 320);
        ctx.lineTo(350, 400);
        ctx.lineTo(410, 400);
        ctx.lineTo(400, 320);
        ctx.lineTo(360, 180);
        ctx.closePath();
        ctx.fill();

        // Arms
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(220, 250, 35, 70, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(380, 250, 35, 70, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Face details
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(285, 135, 6, 0, Math.PI * 2);
        ctx.arc(315, 135, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(300, 155, 12, 0, Math.PI);
        ctx.stroke();

        // Silver Cat label
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Silver Cat Tools', 300, 470);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const file = new File([blob], 'sample-person.png', { type: 'image/png' });
        processFile(file);
    });
});