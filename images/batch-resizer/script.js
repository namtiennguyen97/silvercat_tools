(function() {
    'use strict';

    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const queueList = document.getElementById('queue-list');
    const emptyQueue = document.getElementById('empty-queue');
    const queueCount = document.getElementById('queue-count');
    const btnResize = document.getElementById('btn-resize');
    const btnClear = document.getElementById('btn-clear');
    const presetSelect = document.getElementById('preset-select');
    const customWidth = document.getElementById('custom-width');
    const customHeight = document.getElementById('custom-height');
    const lockAspect = document.getElementById('lock-aspect');
    const outputFormat = document.getElementById('output-format');

    let files = [];

    // Dropzone
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.style.borderColor = '#f59e0b'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = ''; });
    dropzone.addEventListener('drop', e => { e.preventDefault(); dropzone.style.borderColor = ''; addFiles(e.dataTransfer.files); });
    fileInput.addEventListener('change', () => { addFiles(fileInput.files); fileInput.value = ''; });

    function addFiles(fileList) {
        for (const file of fileList) {
            if (!file.type.startsWith('image/')) continue;
            files.push(file);
        }
        renderQueue();
    }

    function renderQueue() {
        emptyQueue.style.display = files.length === 0 ? 'block' : 'none';
        queueCount.textContent = files.length;
        btnResize.disabled = files.length === 0;

        // Remove existing items
        document.querySelectorAll('.queue-item').forEach(el => el.remove());

        files.forEach((file, idx) => {
            const item = document.createElement('div');
            item.className = 'queue-item';
            item.dataset.index = idx;

            const thumb = document.createElement('img');
            thumb.className = 'queue-item-thumb';
            thumb.src = URL.createObjectURL(file);
            thumb.alt = file.name;

            const info = document.createElement('div');
            info.className = 'queue-item-info';
            info.innerHTML = `
                <div class="queue-item-name">${file.name}</div>
                <div class="queue-item-size">${(file.size / 1024).toFixed(1)} KB</div>
            `;

            const status = document.createElement('span');
            status.className = 'queue-item-status status-pending';
            status.textContent = 'Ready';

            item.appendChild(thumb);
            item.appendChild(info);
            item.appendChild(status);

            // Insert before empty-queue
            queueList.insertBefore(item, emptyQueue);
        });
    }

    // Preset
    presetSelect.addEventListener('change', () => {
        const val = presetSelect.value;
        if (val === 'custom') return;
        customWidth.value = val;
        if (lockAspect.checked) {
            customHeight.value = Math.round(parseInt(val) * 0.75);
        }
    });

    // Lock aspect: auto-calculate height from width
    customWidth.addEventListener('input', () => {
        if (!lockAspect.checked || customWidth.value <= 0) return;
        customHeight.value = Math.round(parseInt(customWidth.value) * 0.75);
    });

    // Resize
    btnResize.addEventListener('click', async () => {
        const w = parseInt(customWidth.value);
        const h = parseInt(customHeight.value);
        if (!w || !h || w <= 0 || h <= 0) return;

        btnResize.disabled = true;
        btnResize.innerHTML = '<span>Processing...</span>';
        const format = outputFormat.value;
        const ext = format.split('/')[1];

        for (let idx = 0; idx < files.length; idx++) {
            const statusEl = document.querySelector(`.queue-item[data-index="${idx}"] .queue-item-status`);
            if (!statusEl) continue;
            
            statusEl.className = 'queue-item-status status-processing';
            statusEl.textContent = 'Processing...';

            try {
                const file = files[idx];
                const img = await loadImage(file);
                const canvas = document.createElement('canvas');
                
                let fw = w, fh = h;
                if (lockAspect.checked) {
                    const ratio = img.naturalWidth / img.naturalHeight;
                    if (w / h > ratio) { fw = Math.round(h * ratio); fh = h; }
                    else { fw = w; fh = Math.round(w / ratio); }
                }

                canvas.width = fw;
                canvas.height = fh;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, fw, fh);

                const blob = await new Promise(resolve => canvas.toBlob(resolve, format, 0.92));
                const url = URL.createObjectURL(blob);
                const baseName = file.name.replace(/\.[^.]+$/, '');
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `${baseName}_${fw}x${fh}.${ext}`;
                a.click();
                URL.revokeObjectURL(url);

                statusEl.className = 'queue-item-status status-success';
                statusEl.textContent = '✅ Success';
            } catch (err) {
                console.error(err);
                statusEl.className = 'queue-item-status status-error';
                statusEl.textContent = '❌ Error';
            }
        }

        btnResize.disabled = false;
        btnResize.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16"><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Resize All';
    });

    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Clear
    btnClear.addEventListener('click', () => {
        files = [];
        renderQueue();
    });
})();