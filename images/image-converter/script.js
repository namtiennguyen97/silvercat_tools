document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const queueBox = document.getElementById('queue-box');
    const queueList = document.getElementById('queue-list');
    const targetFormatSelect = document.getElementById('target-format');
    const btnConvertAll = document.getElementById('btn-convert-all');
    const btnDownloadAll = document.getElementById('btn-download-all');
    const btnClearQueue = document.getElementById('btn-clear-queue');

    let imageQueue = []; // Queue of file structures

    // Format bytes helper
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function applyLocalTranslation() {
        if (window.translatePage && window.getCurrentLang) {
            window.translatePage(window.getCurrentLang());
        }
    }

    // Bind triggers
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
            addFilesToQueue(e.dataTransfer.files);
        }
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            addFilesToQueue(e.target.files);
        }
    });

    // Add uploaded files to queue data structure
    function addFilesToQueue(files) {
        for (let file of files) {
            if (!file.type.match('image.*')) continue;

            const id = 'img-item-' + Math.random().toString(36).substr(2, 9);
            const fileObj = {
                id: id,
                file: file,
                name: file.name,
                size: file.size,
                thumbnailSrc: '',
                status: 'pending', // pending, converting, success, error
                outputBlob: null,
                outputUrl: null
            };

            imageQueue.push(fileObj);

            // Load local thumbnail image representation
            const reader = new FileReader();
            reader.onload = (e) => {
                fileObj.thumbnailSrc = e.target.result;
                updateQueueUI();
            };
            reader.readAsDataURL(file);
        }

        queueBox.style.display = 'block';
        updateQueueUI();
    }

    // Sync queue list to HTML
    function updateQueueUI() {
        queueList.innerHTML = '';
        
        if (imageQueue.length === 0) {
            queueBox.style.display = 'none';
            btnDownloadAll.style.display = 'none';
            return;
        }

        imageQueue.forEach((item) => {
            const el = document.createElement('div');
            el.className = 'queue-item';
            el.id = item.id;

            const fileExt = item.name.substring(item.name.lastIndexOf('.') + 1).toUpperCase();
            const targetFormatName = targetFormatSelect.value.split('/')[1].toUpperCase();

            // Status details
            let statusBadgeHTML = '';
            if (item.status === 'pending') {
                statusBadgeHTML = `<span class="item-status-badge badge-pending" data-i18n="status-pending">Đang chờ</span>`;
            } else if (item.status === 'converting') {
                statusBadgeHTML = `<span class="item-status-badge badge-converting" data-i18n="status-converting">Đang xử lý...</span>`;
            } else if (item.status === 'success') {
                statusBadgeHTML = `<span class="item-status-badge badge-success" data-i18n="status-success">Thành công</span>`;
            } else {
                statusBadgeHTML = `<span class="item-status-badge badge-error" data-i18n="status-error">Lỗi</span>`;
            }

            // Action buttons
            let actionsHTML = '';
            if (item.status === 'success' && item.outputUrl) {
                actionsHTML = `
                    <button class="btn-icon btn-download" title="Download" onclick="window.downloadSingle('${item.id}')">
                        <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>
                    </button>
                `;
            } else {
                actionsHTML = `
                    <button class="btn-icon btn-convert" title="Convert" onclick="window.convertSingle('${item.id}')">
                        <svg viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
                    </button>
                `;
            }

            actionsHTML += `
                <button class="btn-icon btn-delete" title="Delete" onclick="window.removeSingle('${item.id}')">
                    <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
            `;

            el.innerHTML = `
                <div class="item-info">
                    <img class="item-thumbnail" src="${item.thumbnailSrc || 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23334155\'><rect width=\'24\' height=\'24\'/></svg>'}" alt="Thumb">
                    <div class="item-details">
                        <span class="item-name">${item.name}</span>
                        <div class="item-meta">
                            <span>${formatBytes(item.size)}</span>
                            <span>•</span>
                            <span style="font-weight: 700; color: var(--accent-indigo);">${fileExt} → ${targetFormatName}</span>
                            <span>•</span>
                            ${statusBadgeHTML}
                        </div>
                    </div>
                </div>
                <div class="item-actions">
                    ${actionsHTML}
                </div>
            `;
            queueList.appendChild(el);
        });

        // Check if any success converted files exist to show Download All button
        const successCount = imageQueue.filter(x => x.status === 'success').length;
        if (successCount > 0) {
            btnDownloadAll.style.display = 'inline-flex';
        } else {
            btnDownloadAll.style.display = 'none';
        }

        // Apply translations on newly added elements
        applyLocalTranslation();
    }

    // Convert Single Image Flow
    window.convertSingle = function(itemId) {
        const item = imageQueue.find(x => x.id === itemId);
        if (!item) return;

        item.status = 'converting';
        updateQueueUI();

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const targetMime = targetFormatSelect.value;
            canvas.toBlob((blob) => {
                if (blob) {
                    item.status = 'success';
                    item.outputBlob = blob;
                    item.outputUrl = URL.createObjectURL(blob);
                } else {
                    item.status = 'error';
                }
                updateQueueUI();
            }, targetMime, 0.95);
        };
        img.onerror = () => {
            item.status = 'error';
            updateQueueUI();
        };
        img.src = item.thumbnailSrc;
    };

    // Remove Single Item
    window.removeSingle = function(itemId) {
        imageQueue = imageQueue.filter(x => x.id !== itemId);
        updateQueueUI();
    };

    // Download Single File
    window.downloadSingle = function(itemId) {
        const item = imageQueue.find(x => x.id === itemId);
        if (!item || !item.outputUrl) return;

        const link = document.createElement('a');
        link.href = item.outputUrl;
        
        const targetExt = targetFormatSelect.value.split('/')[1];
        const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
        link.download = `${baseName}.${targetExt}`;
        link.click();
    };

    // Convert All Items in Queue
    btnConvertAll.addEventListener('click', () => {
        imageQueue.forEach((item) => {
            if (item.status !== 'success') {
                window.convertSingle(item.id);
            }
        });
    });

    // Download All Action
    btnDownloadAll.addEventListener('click', () => {
        imageQueue.forEach((item) => {
            if (item.status === 'success' && item.outputUrl) {
                setTimeout(() => {
                    window.downloadSingle(item.id);
                }, 100);
            }
        });
    });

    // Clear Queue List
    btnClearQueue.addEventListener('click', () => {
        imageQueue = [];
        updateQueueUI();
    });

    // Load Sample Local Images using Canvas Drawing
    const sampleBtn = document.getElementById('btn-load-samples');
    sampleBtn.addEventListener('click', () => {
        // Draw Sample 1 (Indigo Gradient Rectangle)
        const c1 = document.createElement('canvas');
        c1.width = 800;
        c1.height = 600;
        const ctx1 = c1.getContext('2d');
        const g1 = ctx1.createLinearGradient(0, 0, 800, 600);
        g1.addColorStop(0, '#4f46e5');
        g1.addColorStop(1, '#06b6d4');
        ctx1.fillStyle = g1;
        ctx1.fillRect(0, 0, 800, 600);
        ctx1.font = 'bold 36px sans-serif';
        ctx1.fillStyle = 'white';
        ctx1.textAlign = 'center';
        ctx1.fillText('Sample Indigo Card (800x600)', 400, 300);

        // Draw Sample 2 (Pink Circular Graphic)
        const c2 = document.createElement('canvas');
        c2.width = 600;
        c2.height = 600;
        const ctx2 = c2.getContext('2d');
        ctx2.fillStyle = '#0f172a';
        ctx2.fillRect(0, 0, 600, 600);
        ctx2.beginPath();
        ctx2.arc(300, 300, 200, 0, 2 * Math.PI);
        ctx2.fillStyle = '#ec4899';
        ctx2.fill();
        ctx2.font = 'bold 28px sans-serif';
        ctx2.fillStyle = 'white';
        ctx2.textAlign = 'center';
        ctx2.fillText('Pink Circle Sample', 300, 310);

        // Push samples as files to queue
        c1.toBlob((blob1) => {
            const file1 = new File([blob1], 'indigo-card.png', { type: 'image/png' });
            c2.toBlob((blob2) => {
                const file2 = new File([blob2], 'pink-circle.png', { type: 'image/png' });
                addFilesToQueue([file1, file2]);
            }, 'image/png');
        }, 'image/png');
    });

    // Automatically re-update extension text in items if target selection drops down
    targetFormatSelect.addEventListener('change', () => {
        // If anything is changed, reset success status to pending for safety so they re-trigger clean convert
        imageQueue.forEach(item => {
            item.status = 'pending';
            item.outputBlob = null;
            item.outputUrl = null;
        });
        updateQueueUI();
    });

    window.addEventListener('languageChanged', () => {
        applyLocalTranslation();
        updateQueueUI();
    });

    // Init translations
    setTimeout(() => {
        applyLocalTranslation();
    }, 100);
});
