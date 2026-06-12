document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const core = window.BackgroundRemoverCore;
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const btnSample = document.getElementById('btn-load-sample');
    const btnProcess = document.getElementById('btn-process');
    const btnDownload = document.getElementById('btn-download');
    const btnDownloadAll = document.getElementById('btn-download-all');
    const btnClear = document.getElementById('btn-clear');
    const compareContainer = document.getElementById('compare-container');
    const processingState = document.getElementById('processing-state');
    const placeholderState = document.getElementById('placeholder-state');
    const imgOriginal = document.getElementById('img-original');
    const imgResult = document.getElementById('img-result');
    const originalBox = document.getElementById('original-box');
    const resultBg = document.getElementById('result-bg');
    const progressBar = document.getElementById('progress-bar');
    const processingDetail = document.getElementById('processing-detail');
    const queueList = document.getElementById('queue-list');
    const statusLine = document.getElementById('status-line');
    const statTotal = document.getElementById('stat-total');
    const statDone = document.getElementById('stat-done');
    const statSize = document.getElementById('stat-size');
    const statModel = document.getElementById('stat-model');
    const outputFormat = document.getElementById('output-format');
    const maxDimension = document.getElementById('max-dimension');
    const cropTransparent = document.getElementById('crop-transparent');
    const showOriginal = document.getElementById('show-original');
    const backgroundOptions = document.getElementById('background-options');

    let items = [];
    let activeIndex = -1;
    let currentPreviewUrl = '';
    let currentOriginalUrl = '';
    let isProcessing = false;

    setupMobileTabs();
    setupDropzone();
    setupActions();

    function setupMobileTabs() {
        document.querySelectorAll('.mobile-tab-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.mobile-tab-btn').forEach(item => item.classList.remove('active'));
                button.classList.add('active');
                document.getElementById('panel-input').classList.toggle('active-panel', button.dataset.target === 'panel-input');
                document.getElementById('panel-result').classList.toggle('active-panel', button.dataset.target === 'panel-result');
            });
        });
    }

    function setupDropzone() {
        fileInput.addEventListener('change', () => addFiles(fileInput.files));

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, event => {
                event.preventDefault();
                dropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, event => {
                event.preventDefault();
                dropzone.classList.remove('dragover');
            });
        });

        dropzone.addEventListener('drop', event => addFiles(event.dataTransfer.files));
    }

    function setupActions() {
        btnProcess.addEventListener('click', processQueue);
        btnDownload.addEventListener('click', downloadCurrent);
        btnDownloadAll.addEventListener('click', downloadAll);
        btnClear.addEventListener('click', clearAll);
        btnSample.addEventListener('click', loadSample);
        showOriginal.addEventListener('change', renderActivePreview);
        [outputFormat, maxDimension, cropTransparent].forEach(control => {
            control.addEventListener('change', invalidateResults);
        });

        backgroundOptions.addEventListener('click', event => {
            const button = event.target.closest('.swatch');
            if (!button) return;
            document.querySelectorAll('.swatch').forEach(item => item.classList.remove('active'));
            button.classList.add('active');
            setPreviewBackground(button.dataset.bg);
        });
    }

    function addFiles(fileList) {
        const incoming = Array.from(fileList || []);
        const accepted = [];
        const rejected = [];

        incoming.forEach(file => {
            const validation = core.validateImageFile(file, 20);
            if (!validation.ok) {
                rejected.push(`${file.name}: ${validation.message}`);
                return;
            }
            accepted.push({
                file,
                name: file.name,
                size: file.size,
                originalUrl: URL.createObjectURL(file),
                resultBlob: null,
                resultUrl: '',
                status: 'Ready',
                error: ''
            });
        });

        items = items.concat(accepted);
        if (activeIndex === -1 && items.length) activeIndex = 0;
        if (rejected.length) statusLine.textContent = rejected[0];
        else statusLine.textContent = `${accepted.length} image(s) added.`;
        fileInput.value = '';
        renderQueue();
        renderActivePreview();
        updateStats();
    }

    async function processQueue() {
        if (!items.length || isProcessing) return;
        const remover = getRemoveBackgroundFunction();
        if (!remover) {
            statModel.textContent = 'Missing';
            statusLine.textContent = 'Background removal library is not loaded. Check your connection and reload this page.';
            return;
        }

        isProcessing = true;
        setProcessingUi(true);
        statModel.textContent = 'Loading';

        for (let index = 0; index < items.length; index += 1) {
            const item = items[index];
            if (item.resultBlob) continue;
            activeIndex = index;
            item.status = 'Processing';
            renderQueue();
            renderActivePreview();

            try {
                statusLine.textContent = `Processing ${item.name}`;
                const preparedFile = await prepareInputFile(item.file);
                const rawBlob = await remover(preparedFile, {
                    progress: (key, current, total) => {
                        const percent = total ? (current / total) * 100 : current;
                        progressBar.style.width = `${Math.max(0, Math.min(100, Math.round(percent || 0)))}%`;
                        processingDetail.textContent = core.progressMessage(key, percent);
                    },
                    model: 'isnet_quint8',
                    output: {
                        format: `image/${outputFormat.value}`,
                        quality: outputFormat.value === 'webp' ? 0.95 : 1
                    }
                });
                item.resultBlob = await finalizeOutput(rawBlob, outputFormat.value);
                item.resultUrl = URL.createObjectURL(item.resultBlob);
                item.status = 'Done';
                statModel.textContent = 'Ready';
            } catch (error) {
                item.status = 'Error';
                item.error = userFriendlyError(error);
                statusLine.textContent = item.error;
                statModel.textContent = 'Error';
            }

            renderQueue();
            renderActivePreview();
            updateStats();
        }

        isProcessing = false;
        setProcessingUi(false);
        statusLine.textContent = completedCount() ? 'Processing finished. Download the current image or ZIP all results.' : statusLine.textContent;
    }

    async function prepareInputFile(file) {
        const bitmap = await createImageBitmap(file);
        const plan = core.getResizePlan(bitmap.width, bitmap.height, Number(maxDimension.value));
        if (plan.scale === 1) {
            bitmap.close();
            return file;
        }
        const canvas = document.createElement('canvas');
        canvas.width = plan.width;
        canvas.height = plan.height;
        canvas.getContext('2d').drawImage(bitmap, 0, 0, plan.width, plan.height);
        bitmap.close();
        const blob = await canvasToBlob(canvas, file.type, 0.92);
        return new File([blob], file.name, { type: file.type });
    }

    async function finalizeOutput(blob, format) {
        if (!cropTransparent.checked && blob.type === `image/${format}`) return blob;
        const bitmap = await createImageBitmap(blob);
        const source = document.createElement('canvas');
        source.width = bitmap.width;
        source.height = bitmap.height;
        const sourceCtx = source.getContext('2d');
        sourceCtx.drawImage(bitmap, 0, 0);
        bitmap.close();

        let target = source;
        if (cropTransparent.checked) {
            const imageData = sourceCtx.getImageData(0, 0, source.width, source.height);
            const bounds = core.findAlphaBounds(imageData.data, source.width, source.height, 8);
            target = document.createElement('canvas');
            target.width = bounds.width;
            target.height = bounds.height;
            target.getContext('2d').drawImage(source, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);
        }

        return canvasToBlob(target, `image/${format}`, format === 'webp' ? 0.95 : 1);
    }

    function renderQueue() {
        queueList.innerHTML = '';
        items.forEach((item, index) => {
            const row = document.createElement('button');
            row.type = 'button';
            row.className = 'queue-item';
            row.innerHTML = `
                <img class="queue-thumb" src="${item.originalUrl}" alt="">
                <span>
                    <span class="queue-name">${escapeHtml(item.name)}</span>
                    <span class="queue-meta">${formatBytes(item.size)}${item.error ? ' - ' + escapeHtml(item.error) : ''}</span>
                </span>
                <span class="queue-status ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
            `;
            row.addEventListener('click', () => {
                activeIndex = index;
                renderActivePreview();
            });
            queueList.appendChild(row);
        });
        btnProcess.disabled = !items.length || isProcessing;
        btnDownloadAll.disabled = completedCount() === 0;
    }

    function renderActivePreview() {
        clearPreviewUrls();
        const item = items[activeIndex];
        originalBox.hidden = !showOriginal.checked;
        if (!item) {
            placeholderState.hidden = false;
            processingState.hidden = true;
            compareContainer.hidden = true;
            btnDownload.disabled = true;
            return;
        }

        imgOriginal.src = item.originalUrl;
        currentOriginalUrl = item.originalUrl;
        if (item.resultBlob) {
            imgResult.src = item.resultUrl;
            currentPreviewUrl = item.resultUrl;
            placeholderState.hidden = true;
            processingState.hidden = true;
            compareContainer.hidden = false;
            btnDownload.disabled = false;
        } else if (item.status === 'Processing') {
            imgResult.removeAttribute('src');
            placeholderState.hidden = true;
            compareContainer.hidden = false;
            processingState.hidden = false;
            btnDownload.disabled = true;
        } else {
            imgResult.removeAttribute('src');
            placeholderState.hidden = true;
            processingState.hidden = true;
            compareContainer.hidden = false;
            btnDownload.disabled = true;
        }
    }

    function setProcessingUi(active) {
        progressBar.style.width = active ? '4%' : '0%';
        processingDetail.textContent = active ? 'Preparing image...' : 'Preparing image...';
        processingState.hidden = !active;
        placeholderState.hidden = active || Boolean(items[activeIndex]?.resultBlob);
        btnProcess.disabled = active || !items.length;
    }

    function setPreviewBackground(name) {
        resultBg.classList.remove('checkerboard', 'preview-white', 'preview-black', 'preview-brand');
        if (name === 'white') resultBg.classList.add('preview-white');
        else if (name === 'black') resultBg.classList.add('preview-black');
        else if (name === 'brand') resultBg.classList.add('preview-brand');
        else resultBg.classList.add('checkerboard');
    }

    function downloadCurrent() {
        const item = items[activeIndex];
        if (!item?.resultBlob) return;
        const filename = core.makeOutputName(item.name, outputFormat.value);
        downloadBlob(item.resultBlob, filename);
    }

    async function downloadAll() {
        const done = items.filter(item => item.resultBlob);
        if (!done.length) return;
        if (done.length === 1 || typeof JSZip === 'undefined') {
            downloadBlob(done[0].resultBlob, core.makeOutputName(done[0].name, outputFormat.value));
            if (done.length > 1) statusLine.textContent = 'ZIP library unavailable. Downloaded the first completed image.';
            return;
        }
        const zip = new JSZip();
        done.forEach(item => {
            zip.file(core.makeOutputName(item.name, outputFormat.value), item.resultBlob);
        });
        const blob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(blob, 'background-removed-images.zip');
    }

    function clearAll() {
        items.forEach(item => {
            URL.revokeObjectURL(item.originalUrl);
            if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
        });
        items = [];
        activeIndex = -1;
        fileInput.value = '';
        renderQueue();
        renderActivePreview();
        updateStats();
        statusLine.textContent = 'Select images to begin.';
        statModel.textContent = 'Ready';
    }

    function invalidateResults() {
        if (!items.some(item => item.resultBlob)) return;
        items.forEach(item => {
            if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
            item.resultBlob = null;
            item.resultUrl = '';
            item.status = 'Ready';
            item.error = '';
        });
        statusLine.textContent = 'Output settings changed. Run background removal again.';
        renderQueue();
        renderActivePreview();
        updateStats();
    }

    async function loadSample() {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#4f46e5');
        grad.addColorStop(0.48, '#ec4899');
        grad.addColorStop(1, '#06b6d4');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(320, 145, 62, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(250, 210);
        ctx.quadraticCurveTo(320, 165, 390, 210);
        ctx.lineTo(430, 405);
        ctx.lineTo(210, 405);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.font = '700 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Sample Portrait', 320, 448);
        const blob = await canvasToBlob(canvas, 'image/png', 1);
        addFiles([new File([blob], 'sample-portrait.png', { type: 'image/png' })]);
    }

    function getRemoveBackgroundFunction() {
        if (typeof window.removeBackground === 'function') return window.removeBackground;
        if (window.backgroundRemoval && typeof window.backgroundRemoval.removeBackground === 'function') {
            return window.backgroundRemoval.removeBackground;
        }
        if (window.imglyRemoveBackground && typeof window.imglyRemoveBackground.removeBackground === 'function') {
            return window.imglyRemoveBackground.removeBackground;
        }
        return null;
    }

    function updateStats() {
        statTotal.textContent = String(items.length);
        statDone.textContent = String(completedCount());
        statSize.textContent = formatBytes(items.reduce((sum, item) => sum + item.size, 0));
        btnDownloadAll.disabled = completedCount() === 0;
    }

    function completedCount() {
        return items.filter(item => item.resultBlob).length;
    }

    function statusClass(status) {
        if (status === 'Done') return 'done';
        if (status === 'Error') return 'error';
        return '';
    }

    function userFriendlyError(error) {
        const message = error && error.message ? error.message : String(error);
        if (/network|fetch|load|wasm|model/i.test(message)) {
            return 'The AI model could not load. Check your connection, then retry.';
        }
        if (/memory|allocation|too large/i.test(message)) {
            return 'The image is too large for this browser. Try a smaller max size.';
        }
        return 'Background removal failed for this image.';
    }

    function canvasToBlob(canvas, type, quality) {
        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas export failed'));
            }, type, quality);
        });
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    function formatBytes(bytes) {
        if (!bytes) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
        const value = bytes / Math.pow(1024, index);
        return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function clearPreviewUrls() {
        currentPreviewUrl = '';
        currentOriginalUrl = '';
    }
});
