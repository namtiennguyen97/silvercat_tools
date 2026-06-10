(function() {
    'use strict';
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const btnCreate = document.getElementById('btn-create');
    const gapSlider = document.getElementById('gap-slider');
    const gapVal = document.getElementById('gap-val');
    const resultArea = document.getElementById('result-area');

    let images = [];
    let currentCols = 2, currentRows = 1;

    // Layout buttons
    document.querySelectorAll('.layout-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCols = parseInt(btn.dataset.cols);
            currentRows = parseInt(btn.dataset.rows);
        });
    });

    gapSlider.addEventListener('input', () => { gapVal.textContent = gapSlider.value + 'px'; });

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.style.borderColor = '#14b8a6'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = ''; });
    dropzone.addEventListener('drop', e => { e.preventDefault(); dropzone.style.borderColor = ''; addImages(e.dataTransfer.files); });
    fileInput.addEventListener('change', () => { addImages(fileInput.files); fileInput.value = ''; });

    function addImages(fileList) {
        for (const file of fileList) {
            if (!file.type.startsWith('image/') || images.length >= 9) continue;
            const reader = new FileReader();
            reader.onload = e => {
                const img = new Image();
                img.onload = () => {
                    images.push({ img, file });
                    btnCreate.disabled = images.length < 2;
                    updateDropzoneText();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    function updateDropzoneText() {
        const title = dropzone.querySelector('.dropzone-title');
        title.textContent = images.length >= 9 ? 'Max 9 images reached!' : 
            `Selected ${images.length}/9 images. Add more or click "Create Collage"`;
    }

    btnCreate.addEventListener('click', () => {
        if (images.length < 2) return;
        const gap = parseInt(gapSlider.value);
        const cols = currentCols;
        const rows = currentRows;
        const totalCells = cols * rows;
        const useCount = Math.min(images.length, totalCells);
        const cellW = 300;
        const cellH = 300;
        const canvasW = cols * cellW + (cols - 1) * gap;
        const canvasH = rows * cellH + (rows - 1) * gap;

        const canvas = document.createElement('canvas');
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext('2d');

        // Fill background
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, canvasW, canvasH);

        let idx = 0;
        for (let r = 0; r < rows && idx < useCount; r++) {
            for (let c = 0; c < cols && idx < useCount; c++) {
                const img = images[idx].img;
                const x = c * (cellW + gap);
                const y = r * (cellH + gap);
                // Cover
                const imgRatio = img.naturalWidth / img.naturalHeight;
                const cellRatio = cellW / cellH;
                let drawW, drawH, sx, sy;
                if (imgRatio > cellRatio) {
                    drawH = cellH;
                    drawW = cellH * imgRatio;
                    sx = (drawW - cellW) / 2;
                    sy = 0;
                } else {
                    drawW = cellW;
                    drawH = cellW / imgRatio;
                    sx = 0;
                    sy = (drawH - cellH) / 2;
                }
                ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight,
                    x - sx, y - sy, drawW, drawH);
                idx++;
            }
        }

        const dataUrl = canvas.toDataURL('image/png');
        resultArea.innerHTML = `
            <div class="collage-canvas-wrapper">
                <canvas id="collage-canvas" width="${canvasW}" height="${canvasH}" style="width:100%;height:auto;display:block;"></canvas>
            </div>
            <button class="btn btn-primary" id="btn-download-collage" style="margin-top:1rem;width:100%;justify-content:center;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Collage
            </button>
        `;
        const cCanvas = document.getElementById('collage-canvas');
        const cCtx = cCanvas.getContext('2d');
        cCtx.drawImage(canvas, 0, 0);

        document.getElementById('btn-download-collage').addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = cCanvas.toDataURL('image/png');
            a.download = 'collage.png';
            a.click();
        });
    });
})();