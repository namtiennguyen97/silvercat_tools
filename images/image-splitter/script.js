(function() {
    'use strict';
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const btnSplit = document.getElementById('btn-split');
    const colsInput = document.getElementById('cols');
    const rowsInput = document.getElementById('rows');
    const splitResult = document.getElementById('split-result');

    let currentImage = null;

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.style.borderColor = '#ec4899'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = ''; });
    dropzone.addEventListener('drop', e => { e.preventDefault(); dropzone.style.borderColor = ''; handleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });

    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => { currentImage = img; btnSplit.disabled = false; };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    btnSplit.addEventListener('click', () => {
        if (!currentImage) return;
        const cols = parseInt(colsInput.value) || 3;
        const rows = parseInt(rowsInput.value) || 3;
        const img = currentImage;
        const cw = Math.floor(img.naturalWidth / cols);
        const rh = Math.floor(img.naturalHeight / rows);
        const total = cols * rows;

        splitResult.innerHTML = '<div style="text-align:center;padding:1rem;color:var(--text-secondary);">Processing...</div>';

        setTimeout(() => {
            let html = '<div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-bottom:1rem;">';
            html += `<button class="btn btn-secondary" id="download-all-zip" style="justify-content:center;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download All</button>`;
            html += '</div><div class="split-grid">';

            const blobs = [];
            let loaded = 0;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const canvas = document.createElement('canvas');
                    canvas.width = cw;
                    canvas.height = rh;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, c * cw, r * rh, cw, rh, 0, 0, cw, rh);
                    
                    canvas.toBlob(blob => {
                        const url = URL.createObjectURL(blob);
                        const idx = r * cols + c + 1;
                        blobs.push({ idx, url, blob, label: `row${r+1}_col${c+1}` });

                        html += `<div class="split-item">
                            <img src="${url}" alt="Part ${idx}">
                            <div class="split-label">Part ${idx}/${total}</div>
                            <button class="btn-download-single" data-url="${url}" data-label="part_${r+1}_${c+1}">Download</button>
                        </div>`;

                        loaded++;
                        if (loaded === total) {
                            html += '</div>';
                            splitResult.innerHTML = html;

                            // Single download
                            document.querySelectorAll('.btn-download-single').forEach(btn => {
                                btn.addEventListener('click', () => {
                                    const a = document.createElement('a');
                                    a.href = btn.dataset.url;
                                    a.download = btn.dataset.label + '.png';
                                    a.click();
                                });
                            });

                            // Download all (sequential)
                            const btnAll = document.getElementById('download-all-zip');
                            if (btnAll) {
                                btnAll.addEventListener('click', () => {
                                    blobs.sort((a, b) => a.idx - b.idx).forEach(b => {
                                        const a = document.createElement('a');
                                        a.href = b.url;
                                        a.download = `split_${b.label}.png`;
                                        a.click();
                                    });
                                });
                            }
                        }
                    }, 'image/png');
                }
            }
        }, 100);
    });
})();