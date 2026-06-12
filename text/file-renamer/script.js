document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const core = window.FileRenamerCore;
    const fileInput = document.getElementById('file-input');
    const dropzone = document.getElementById('dropzone');
    const previewBody = document.getElementById('preview-body');
    const previewEmpty = document.getElementById('preview-empty');
    const previewTableWrap = document.getElementById('preview-table-wrap');
    const statusLine = document.getElementById('status-line');
    const btnBuildZip = document.getElementById('btn-build-zip');
    const btnReport = document.getElementById('btn-report');
    const btnCopyReport = document.getElementById('btn-copy-report');
    const btnClearFiles = document.getElementById('btn-clear-files');
    const settingsPanel = document.getElementById('panel-settings');
    const previewPanel = document.getElementById('panel-preview');
    const statFiles = document.getElementById('stat-files');
    const statDuplicates = document.getElementById('stat-duplicates');
    const statCleanable = document.getElementById('stat-cleanable');
    const statSize = document.getElementById('stat-size');

    const controls = {
        template: document.getElementById('template-input'),
        prefix: document.getElementById('prefix-input'),
        suffix: document.getElementById('suffix-input'),
        sequenceStart: document.getElementById('sequence-start'),
        sequencePad: document.getElementById('sequence-pad'),
        dateFormat: document.getElementById('date-format'),
        metadataMode: document.getElementById('metadata-mode'),
        findText: document.getElementById('find-input'),
        replaceText: document.getElementById('replace-input'),
        lowercase: document.getElementById('lowercase-toggle'),
        slugify: document.getElementById('slugify-toggle'),
        removeAccents: document.getElementById('accent-toggle'),
        skipDuplicates: document.getElementById('skip-duplicates-toggle')
    };

    let selectedFiles = [];
    let fileMeta = [];
    let plan = [];

    setupMobileTabs();
    setupDropzone();
    setupControls();

    btnBuildZip.addEventListener('click', buildZip);
    btnReport.addEventListener('click', downloadReport);
    btnCopyReport.addEventListener('click', copyReport);
    btnClearFiles.addEventListener('click', clearFiles);

    function setupMobileTabs() {
        document.querySelectorAll('.mobile-tab-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.mobile-tab-btn').forEach(item => item.classList.remove('active'));
                button.classList.add('active');
                settingsPanel.classList.toggle('active-panel', button.dataset.target === 'panel-settings');
                previewPanel.classList.toggle('active-panel', button.dataset.target === 'panel-preview');
            });
        });
    }

    function setupDropzone() {
        fileInput.addEventListener('change', () => addFiles(fileInput.files));

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, event => {
                event.preventDefault();
                dropzone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, event => {
                event.preventDefault();
                dropzone.classList.remove('drag-over');
            });
        });

        dropzone.addEventListener('drop', event => addFiles(event.dataTransfer.files));
    }

    function setupControls() {
        Object.values(controls).forEach(control => {
            const eventName = control.type === 'checkbox' ? 'change' : 'input';
            control.addEventListener(eventName, updatePlan);
        });
    }

    async function addFiles(fileList) {
        const incoming = Array.from(fileList || []);
        if (!incoming.length) return;

        selectedFiles = selectedFiles.concat(incoming);
        statusLine.textContent = `Hashing ${incoming.length} file(s) locally...`;
        setButtons(false);

        fileMeta = await Promise.all(selectedFiles.map(async file => {
            const hash = await hashFile(file);
            return {
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                hash
            };
        }));

        updatePlan();
        statusLine.textContent = `${selectedFiles.length} file(s) ready. Review the plan before downloading.`;
    }

    function getOptions() {
        return {
            template: controls.template.value || '{seq}-{name}',
            prefix: controls.prefix.value,
            suffix: controls.suffix.value,
            sequenceStart: Number(controls.sequenceStart.value) || 1,
            sequencePad: Number(controls.sequencePad.value) || 3,
            dateFormat: controls.dateFormat.value,
            metadataMode: controls.metadataMode.value,
            findText: controls.findText.value,
            replaceText: controls.replaceText.value,
            lowercase: controls.lowercase.checked,
            slugify: controls.slugify.checked,
            removeAccents: controls.removeAccents.checked
        };
    }

    function updatePlan() {
        plan = core.planRenames(fileMeta, getOptions());
        renderPreview();
        updateStats();
        setButtons(plan.length > 0);
    }

    function renderPreview() {
        previewBody.innerHTML = '';
        previewEmpty.hidden = plan.length > 0;
        previewTableWrap.hidden = plan.length === 0;

        plan.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><div class="file-name">${escapeHtml(row.originalName)}</div><small>${formatBytes(row.size)}</small></td>
                <td><div class="file-name">${escapeHtml(row.newName)}</div></td>
                <td>${buildBadges(row)}</td>
            `;
            if (row.isDuplicate) tr.classList.add('duplicate-row');
            tr.dataset.index = String(index);
            previewBody.appendChild(tr);
        });
    }

    function buildBadges(row) {
        const badges = [];
        if (row.metadataAction === 'strip-image-metadata') {
            badges.push('<span class="badge badge-clean">Metadata stripped</span>');
        } else {
            badges.push('<span class="badge badge-keep">Original bytes</span>');
        }
        if (row.isDuplicate) {
            badges.push(`<span class="badge badge-copy">Duplicate of ${escapeHtml(row.duplicateOf)}</span>`);
        }
        return badges.join('');
    }

    function updateStats() {
        const duplicates = plan.filter(row => row.isDuplicate).length;
        const cleanable = plan.filter(row => row.metadataAction === 'strip-image-metadata').length;
        const totalSize = fileMeta.reduce((sum, item) => sum + item.size, 0);

        statFiles.textContent = String(plan.length);
        statDuplicates.textContent = String(duplicates);
        statCleanable.textContent = String(cleanable);
        statSize.textContent = formatBytes(totalSize);
    }

    async function buildZip() {
        if (!plan.length) return;
        if (typeof JSZip === 'undefined') {
            statusLine.textContent = 'ZIP library is not available. Download the CSV report or reconnect and try again.';
            return;
        }

        btnBuildZip.disabled = true;
        statusLine.textContent = 'Building clean ZIP locally...';

        try {
            const zip = new JSZip();
            const report = core.buildCsvReport(plan);
            zip.file('rename-report.csv', report);

            for (let i = 0; i < plan.length; i += 1) {
                const row = plan[i];
                if (row.isDuplicate && controls.skipDuplicates.checked) continue;

                statusLine.textContent = `Preparing ${i + 1} of ${plan.length}: ${row.originalName}`;
                const source = fileMeta[i].file;
                const blob = row.metadataAction === 'strip-image-metadata'
                    ? await stripImageMetadata(source)
                    : source;
                zip.file(row.newName, blob);
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            downloadBlob(zipBlob, 'clean-renamed-files.zip');
            statusLine.textContent = 'ZIP created. Files never left your browser.';
        } catch (error) {
            statusLine.textContent = `Could not build ZIP: ${error.message}`;
        } finally {
            btnBuildZip.disabled = plan.length === 0;
        }
    }

    async function stripImageMetadata(file) {
        if (!file.type || !/^image\/(jpeg|png|webp)$/i.test(file.type)) return file;
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();
        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas export failed'));
            }, file.type, file.type === 'image/jpeg' ? 0.92 : undefined);
        });
    }

    function downloadReport() {
        if (!plan.length) return;
        downloadBlob(new Blob([core.buildCsvReport(plan)], { type: 'text/csv;charset=utf-8' }), 'rename-report.csv');
    }

    async function copyReport() {
        if (!plan.length) return;
        await navigator.clipboard.writeText(core.buildCsvReport(plan));
        btnCopyReport.textContent = 'Copied!';
        setTimeout(() => {
            btnCopyReport.textContent = 'Copy Report';
        }, 1600);
    }

    function clearFiles() {
        selectedFiles = [];
        fileMeta = [];
        plan = [];
        fileInput.value = '';
        renderPreview();
        updateStats();
        setButtons(false);
        statusLine.textContent = 'Select files to build a private batch plan.';
    }

    function setButtons(enabled) {
        btnBuildZip.disabled = !enabled;
        btnReport.disabled = !enabled;
        btnCopyReport.disabled = !enabled;
    }

    async function hashFile(file) {
        const buffer = await file.arrayBuffer();
        const digest = await crypto.subtle.digest('SHA-256', buffer);
        return Array.from(new Uint8Array(digest))
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
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
});
