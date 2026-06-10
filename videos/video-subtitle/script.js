// ==========================================================================
// VIDEO SUBTITLE - Subtitle Editor & Video Overlay Tool
// ==========================================================================

// ─── i18n ─────────────────────────────────────────────────────────────────
const localDict = {
    vi: {
        'subtitle-title-page': 'Video Subtitle - Chỉnh Sửa Phụ Đề - Silver Cat Tools',
        'back-home': 'Quay lại Home',
        'subtitle-head': 'Video',
        'subtitle-head-sub': 'Subtitle',
        'subtitle-desc': 'Create subtitles from scratch like CapCut or upload existing SRT/VTT files. Edit timing, content, and preview in sync.',
        'subtitle-upload-title': 'Video Download & Phụ Đề',
        'subtitle-drop-video': 'Drag & drop a video here or click to browse',
        'subtitle-drop-video-desc': 'Supports MP4, WebM. 100% browser-side processing.',
        'subtitle-drop-srt': 'Tải file phụ đề có sẵn (.srt, .vtt) — không bắt buộc',
        'subtitle-drop-srt-desc': 'Can create subtitles from scratch below. Supports SRT, VTT.',
        'subtitle-status-novideo': '❌ Chưa có video',
        'subtitle-status-nosub': '💡 Có thể tạo phụ đề từ đầu bên dưới',
        'subtitle-status-okvideo': '✅ Video: {name}',
        'subtitle-status-oksub': '✅ Phụ đề: {count} dòng ({format})',
        'subtitle-add': 'Thêm phụ đề',
        'subtitle-add-now': '➕ Thêm tại thời điểm hiện tại',
        'subtitle-entries': 'Danh sách phụ đề',
        'subtitle-th-id': '#',
        'subtitle-th-start': 'Bắt đầu',
        'subtitle-th-end': 'Kết thúc',
        'subtitle-th-text': 'Nội dung',
        'subtitle-export-video': 'Video Download + Phụ Đề',
        'subtitle-export-srt': 'Tải File .srt',
        'subtitle-preview-title': 'Preview',
        'subtitle-preview-empty': 'Tải video lên trước, sau đó thêm phụ đề hoặc tải file .srt/.vtt',
        'subtitle-stat-video': 'Video:',
        'subtitle-stat-subs': 'Phụ đề:',
        'subtitle-exporting': 'Exporting video...',
        'subtitle-export-done': 'Download complete',
        'subtitle-no-video': 'Vui lòng tải video trước.',
        'subtitle-no-subs': 'Vui lòng thêm ít nhất 1 phụ đề.',
        'subtitle-mob-upload': 'Upload',
        'subtitle-mob-preview': 'Preview',
        'subtitle-placeholder': 'Enter subtitle content...',
        'footer-copyright': '© 2026 Silver Cat Tools.',
    },
    en: {
        'subtitle-title-page': 'Video Subtitle Editor - Silver Cat Tools',
        'back-home': 'Back to Home',
        'subtitle-head': 'Video',
        'subtitle-head-sub': 'Subtitle',
        'subtitle-desc': 'Create subtitles from scratch like CapCut or import SRT/VTT files. Edit timing, text, preview in real-time.',
        'subtitle-upload-title': 'Upload Video & Subtitle',
        'subtitle-drop-video': 'Drag & drop video here or click to select',
        'subtitle-drop-video-desc': 'Supports MP4, WebM. 100% browser-side processing.',
        'subtitle-drop-srt': 'Upload subtitle file (.srt, .vtt) — optional',
        'subtitle-drop-srt-desc': 'Or create subtitles from scratch below. Supports SRT, VTT.',
        'subtitle-status-novideo': '❌ No video loaded',
        'subtitle-status-nosub': '💡 You can create subtitles from scratch below',
        'subtitle-status-okvideo': '✅ Video: {name}',
        'subtitle-status-oksub': '✅ Subtitle: {count} lines ({format})',
        'subtitle-add': 'Add subtitle',
        'subtitle-add-now': '➕ Add at current time',
        'subtitle-entries': 'Subtitle Entries',
        'subtitle-th-id': '#',
        'subtitle-th-start': 'Start',
        'subtitle-th-end': 'End',
        'subtitle-th-text': 'Content',
        'subtitle-export-video': 'Download Video + Subs',
        'subtitle-export-srt': 'Download .srt File',
        'subtitle-preview-title': 'Preview',
        'subtitle-preview-empty': 'Upload video first, then add subtitles or load .srt/.vtt',
        'subtitle-stat-video': 'Video:',
        'subtitle-stat-subs': 'Subtitles:',
        'subtitle-exporting': 'Exporting video...',
        'subtitle-export-done': 'Download complete',
        'subtitle-no-video': 'Please upload a video first.',
        'subtitle-no-subs': 'Please add at least 1 subtitle.',
        'subtitle-mob-upload': 'Upload',
        'subtitle-mob-preview': 'Preview',
        'subtitle-placeholder': 'Enter subtitle text...',
        'footer-copyright': '© 2026 Silver Cat Tools.',
    }
};

function getCurrentLang() { return localStorage.getItem('preferred-lang') || 'vi'; }

function applyLocalTranslation(lang) {
    const dict = localDict[lang] || localDict['vi'];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = dict[key];
        if (translation !== undefined) {
            if (translation.includes('<') && translation.includes('>')) {
                el.innerHTML = translation;
            } else {
                el.textContent = translation;
            }
        }
    });
    const titleEl = document.querySelector('title[data-i18n]');
    if (titleEl && dict[titleEl.getAttribute('data-i18n')]) {
        document.title = dict[titleEl.getAttribute('data-i18n')];
    }
}

// ==========================================================================
// MAIN APP
// ==========================================================================
(function () {
    'use strict';

    // DOM refs
    const dropVideo = document.getElementById('dropzone-video');
    const fileVideo = document.getElementById('file-video');
    const dropSub = document.getElementById('dropzone-subtitle');
    const fileSub = document.getElementById('file-subtitle');
    const canvas = document.getElementById('preview-canvas');
    const ctx = canvas.getContext('2d');
    const previewBox = document.getElementById('preview-box');
    const noPreview = document.getElementById('no-preview-placeholder');
    const statusVideo = document.getElementById('status-video');
    const statusSub = document.getElementById('status-subtitle');
    const subTableContainer = document.getElementById('subtitle-table-container');
    const subTbody = document.getElementById('subtitle-tbody');
    const subCount = document.getElementById('subtitle-count');
    const actionBtns = document.getElementById('action-buttons');
    const btnPlay = document.getElementById('btn-play');
    const seekSlider = document.getElementById('seek-slider');
    const timeDisplay = document.getElementById('time-display');
    const btnExportVideo = document.getElementById('btn-export-video');
    const btnExportSrt = document.getElementById('btn-export-srt');
    const previewVideoName = document.getElementById('preview-video-name');
    const previewSubCount = document.getElementById('preview-sub-count');
    const subtitleToolbar = document.getElementById('subtitle-toolbar');
    const btnAddSub = document.getElementById('btn-add-sub');
    const btnAddNow = document.getElementById('btn-add-now');
    const styleControls = document.getElementById('style-controls');
    const styleBold = document.getElementById('style-bold');
    const styleItalic = document.getElementById('style-italic');
    const fontSizeSlider = document.getElementById('font-size-slider');
    const fontSizeVal = document.getElementById('font-size-val');
    const fontColorPicker = document.getElementById('font-color-picker');

    // Style state
    let subtitleBold = true;
    let subtitleItalic = false;
    let subtitleFontSize = 24;
    let subtitleColor = '#ffffff';

    // State
    let videoElement = null;
    let videoFile = null;
    let subtitles = [];
    let isPlaying = false;
    let animFrameId = null;
    let mediaRecorder = null;
    let recordedChunks = [];
    let isExporting = false;

    // ======================================================================
    // UTILITY
    // ======================================================================
    function parseTime(str) {
        str = str.replace(',', '.');
        const parts = str.split(':');
        let ms = 0;
        if (parts.length === 3) ms = parseFloat(parts[0]) * 3600000 + parseFloat(parts[1]) * 60000 + parseFloat(parts[2]) * 1000;
        else if (parts.length === 2) ms = parseFloat(parts[0]) * 60000 + parseFloat(parts[1]) * 1000;
        return Math.round(ms);
    }

    function formatTime(ms) {
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        const ml = Math.floor(ms % 1000);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ml).padStart(3, '0')}`;
    }

    function formatTimeShort(ms) {
        const s = Math.floor(ms / 1000);
        return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    }

    function parseSubtitle(text, format) {
        const entries = [];
        let blocks = text.trim().split(/\n\s*\n/);
        if (format === 'vtt') blocks = text.replace(/^WEBVTT\s*.*\n/i, '').trim().split(/\n\s*\n/);

        for (let block of blocks) {
            const lines = block.trim().split('\n');
            if (lines.length < 2) continue;

            let timeIdx = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('-->')) { timeIdx = i; break; }
            }
            if (timeIdx === -1) continue;

            const m = lines[timeIdx].match(/(\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d+)?)\s*-->\s*(\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d+)?)/);
            if (!m) continue;

            entries.push({
                id: String(entries.length + 1),
                startMs: parseTime(m[1]),
                endMs: parseTime(m[2]),
                text: lines.slice(timeIdx + 1).filter(l => l.trim() && !l.includes('NOTE')).join('\n').trim()
            });
        }
        return entries;
    }

    // ======================================================================
    // RENDER TABLE
    // ======================================================================
    function renderSubtitleTable() {
        subTbody.innerHTML = '';
        if (subtitles.length === 0) {
            subTableContainer.style.display = 'none';
            subCount.textContent = '0';
            previewSubCount.textContent = '0';
            return;
        }
        subTableContainer.style.display = 'flex';
        subCount.textContent = subtitles.length;
        previewSubCount.textContent = subtitles.length;

        const lang = getCurrentLang();
        const placeholder = (localDict[lang] && localDict[lang]['subtitle-placeholder']) || 'Enter subtitle text...';

        subtitles.forEach((sub, idx) => {
            const tr = document.createElement('tr');
            tr.dataset.index = idx;

            const tdId = document.createElement('td');
            tdId.textContent = idx + 1;
            tdId.style.cssText = 'color:var(--text-muted);font-size:0.7rem;';
            tr.appendChild(tdId);

            // Start time
            const tdStart = document.createElement('td');
            const inpStart = document.createElement('input');
            inpStart.type = 'text'; inpStart.className = 'time-input'; inpStart.value = formatTime(sub.startMs);
            inpStart.addEventListener('change', () => {
                const v = parseTime(inpStart.value);
                if (!isNaN(v) && v >= 0) { subtitles[idx].startMs = v; if (isPlaying) drawFrame(); }
            });
            tdStart.appendChild(inpStart); tr.appendChild(tdStart);

            // End time
            const tdEnd = document.createElement('td');
            const inpEnd = document.createElement('input');
            inpEnd.type = 'text'; inpEnd.className = 'time-input'; inpEnd.value = formatTime(sub.endMs);
            inpEnd.addEventListener('change', () => {
                const v = parseTime(inpEnd.value);
                if (!isNaN(v) && v >= 0) { subtitles[idx].endMs = v; if (isPlaying) drawFrame(); }
            });
            tdEnd.appendChild(inpEnd); tr.appendChild(tdEnd);

            // Text
            const tdText = document.createElement('td');
            const inpText = document.createElement('input');
            inpText.type = 'text'; inpText.className = 'text-input'; inpText.value = sub.text;
            inpText.placeholder = placeholder;
            inpText.addEventListener('input', () => {
                subtitles[idx].text = inpText.value;
                if (isPlaying) drawFrame();
            });
            tdText.appendChild(inpText); tr.appendChild(tdText);

            // Delete
            const tdDel = document.createElement('td');
            const delBtn = document.createElement('button');
            delBtn.innerHTML = '✕';
            delBtn.style.cssText = 'background:none;border:1px solid rgba(255,255,255,0.1);border-radius:4px;color:#ef4444;cursor:pointer;font-size:0.7rem;padding:2px 6px;';
            delBtn.addEventListener('mouseenter', () => delBtn.style.background = 'rgba(239,68,68,0.15)');
            delBtn.addEventListener('mouseleave', () => delBtn.style.background = 'none');
            delBtn.addEventListener('click', () => {
                subtitles.splice(idx, 1);
                renderSubtitleTable();
                updateStatusUI();
                checkActionButtons();
                drawFrame();
            });
            tdDel.appendChild(delBtn); tr.appendChild(tdDel);

            subTbody.appendChild(tr);
        });
    }

    // ======================================================================
    // TEXT WRAPPING UTILITY
    // ======================================================================
    function wrapText(context, text, maxWidth) {
        if (!text) return [];
        const lines = text.split(/<br\s*\/?>|\n/);
        const result = [];
        for (let line of lines) {
            line = line.trim();
            if (!line) { result.push(''); continue; }
            if (context.measureText(line).width <= maxWidth) {
                result.push(line);
                continue;
            }
            // Need to wrap at word boundaries
            const words = line.split(/\s+/);
            let current = '';
            for (const word of words) {
                const test = current ? current + ' ' + word : word;
                if (context.measureText(test).width <= maxWidth) {
                    current = test;
                } else {
                    if (current) result.push(current);
                    // If a single word is wider than maxWidth, need to break it character by character
                    if (context.measureText(word).width > maxWidth) {
                        let charLine = '';
                        for (const ch of word) {
                            const testChar = charLine + ch;
                            if (context.measureText(testChar).width <= maxWidth) {
                                charLine = testChar;
                            } else {
                                result.push(charLine);
                                charLine = ch;
                            }
                        }
                        current = charLine;
                    } else {
                        current = word;
                    }
                }
            }
            if (current) result.push(current);
        }
        return result;
    }

    // ======================================================================
    // CANVAS DRAW
    // ======================================================================
    function drawFrame() {
        if (!videoElement) return;
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(videoElement, 0, 0, w, h);

        const cur = Math.floor(videoElement.currentTime * 1000);
        const active = subtitles.find(s => cur >= s.startMs && cur < s.endMs);
        if (active && active.text) {
            ctx.shadowColor = 'rgba(0,0,0,0.9)';
            ctx.shadowBlur = 6;
            ctx.fillStyle = subtitleColor;
            const fw = subtitleBold ? 'bold' : 'normal';
            const fs = subtitleItalic ? 'italic' : 'normal';
            const sz = Math.max(14, Math.min(subtitleFontSize, Math.round(w / 14)));
            ctx.font = `${fs} ${fw} ${sz}px Inter, sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';

            // Wrap text to fit within video width (with 40px padding on each side)
            const maxTextWidth = Math.max(80, w - 80);
            const lines = wrapText(ctx, active.text, maxTextWidth);
            const lh = Math.round(sz * 1.3);
            const sy = h - 30;

            lines.forEach((l, i) => {
                ctx.fillText(l.trim(), w / 2, sy - (lines.length - 1 - i) * lh);
            });
            ctx.shadowBlur = 0;
        }
    }

    // ======================================================================
    // STATUS & BUTTONS
    // ======================================================================
    function updateStatusUI() {
        const lang = getCurrentLang();
        const dict = localDict[lang] || localDict['vi'];
        if (subtitles.length > 0) {
            statusSub.textContent = dict['subtitle-status-oksub'].replace('{count}', subtitles.length).replace('{format}', 'SRT');
        } else {
            statusSub.textContent = '💡 ' + (dict['subtitle-add'] || 'Create subtitles below');
        }
    }

    function checkActionButtons() {
        if (videoElement && subtitles.length > 0) {
            actionBtns.style.display = 'flex';
        } else if (videoElement) {
            actionBtns.style.display = 'flex';
        } else {
            actionBtns.style.display = 'none';
        }
    }

    // ======================================================================
    // HANDLE VIDEO
    // ======================================================================
    function handleVideo(file) {
        if (!file || !file.type.startsWith('video/')) return;
        videoFile = file;
        videoElement = document.createElement('video');
        videoElement.src = URL.createObjectURL(file);
        videoElement.crossOrigin = 'anonymous';
        videoElement.preload = 'auto';

        videoElement.addEventListener('loadedmetadata', () => {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            seekSlider.max = Math.floor(videoElement.duration * 1000);

            const dict = localDict[getCurrentLang()] || localDict['vi'];
            // Show tip about preview tab (especially helpful on mobile)
            statusVideo.textContent = '✅ ' + file.name + ' — ' + (dict['subtitle-mob-preview-hint'] || '🎬 Xem video ở tab Preview');
            previewVideoName.textContent = file.name;
            noPreview.style.display = 'none';
            previewBox.style.display = 'block';
            subtitleToolbar.style.display = 'flex';
            styleControls.style.display = 'flex';

            videoElement.currentTime = 0;
            videoElement.addEventListener('seeked', drawFrame, { once: true });
            videoElement.addEventListener('loadeddata', drawFrame, { once: true });
            videoElement.addEventListener('timeupdate', () => {
                if (isPlaying) {
                    seekSlider.value = Math.floor(videoElement.currentTime * 1000);
                    updateTimeDisplay();
                    drawFrame();
                }
            });
            videoElement.addEventListener('ended', () => {
                isPlaying = false;
                btnPlay.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
                if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
            });

            checkActionButtons();
        });
    }

    // ======================================================================
    // HANDLE SUBTITLE FILE
    // ======================================================================
    function handleSubtitle(file) {
        const n = file.name.toLowerCase();
        if (!n.endsWith('.srt') && !n.endsWith('.vtt')) return;
        const fmt = n.endsWith('.vtt') ? 'vtt' : 'srt';
        const reader = new FileReader();
        reader.onload = (e) => {
            subtitles = parseSubtitle(e.target.result, fmt);
            renderSubtitleTable();
            updateStatusUI();
            if (videoElement) {
                subtitleToolbar.style.display = 'flex';
                styleControls.style.display = 'flex';
            }
            checkActionButtons();
            drawFrame();
        };
        reader.readAsText(file);
    }

    // ======================================================================
    // ADD SUBTITLE (CapCut-style)
    // ======================================================================
    btnAddSub.addEventListener('click', () => {
        if (!videoElement) { alert(localDict[getCurrentLang()]['subtitle-no-video']); return; }
        const dur = Math.floor((videoElement.duration || 10) * 1000);
        const st = subtitles.length > 0 ? subtitles[subtitles.length - 1].endMs : 0;
        subtitles.push({ id: String(subtitles.length + 1), startMs: st, endMs: Math.min(st + 3000, dur), text: '' });
        renderSubtitleTable();
        updateStatusUI();
        checkActionButtons();
        drawFrame();
    });

    btnAddNow.addEventListener('click', () => {
        if (!videoElement) { alert(localDict[getCurrentLang()]['subtitle-no-video']); return; }
        const cur = Math.floor(videoElement.currentTime * 1000);
        const dur = Math.floor((videoElement.duration || 10) * 1000);
        subtitles.push({ id: String(subtitles.length + 1), startMs: cur, endMs: Math.min(cur + 3000, dur), text: '' });
        renderSubtitleTable();
        updateStatusUI();
        checkActionButtons();
        drawFrame();
    });

    // ======================================================================
    // STYLE CONTROLS
    // ======================================================================
    styleBold.addEventListener('click', () => {
        subtitleBold = !subtitleBold;
        styleBold.classList.toggle('active');
        if (isPlaying) drawFrame();
    });

    styleItalic.addEventListener('click', () => {
        subtitleItalic = !subtitleItalic;
        styleItalic.classList.toggle('active');
        if (isPlaying) drawFrame();
    });

    fontSizeSlider.addEventListener('input', () => {
        subtitleFontSize = parseInt(fontSizeSlider.value);
        fontSizeVal.textContent = subtitleFontSize;
        if (isPlaying) drawFrame();
    });

    fontColorPicker.addEventListener('input', () => {
        subtitleColor = fontColorPicker.value;
        if (isPlaying) drawFrame();
    });

    // ======================================================================
    // DROPZONE SETUP
    // ======================================================================
    function setupDZ(el, inp, handler) {
        el.addEventListener('click', () => inp.click());
        el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('dragover'); });
        el.addEventListener('dragleave', () => el.classList.remove('dragover'));
        el.addEventListener('drop', e => { e.preventDefault(); el.classList.remove('dragover'); if (e.dataTransfer.files[0]) handler(e.dataTransfer.files[0]); });
        inp.addEventListener('change', () => { if (inp.files[0]) handler(inp.files[0]); });
    }
    setupDZ(dropVideo, fileVideo, handleVideo);
    setupDZ(dropSub, fileSub, handleSubtitle);

    // ======================================================================
    // PLAYBACK
    // ======================================================================
    btnPlay.addEventListener('click', () => {
        if (!videoElement) return;
        if (isPlaying) {
            videoElement.pause(); isPlaying = false;
            btnPlay.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
        } else {
            videoElement.play(); isPlaying = true;
            btnPlay.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
            (function loop() { drawFrame(); animFrameId = requestAnimationFrame(loop); })();
        }
    });

    seekSlider.addEventListener('input', () => {
        if (!videoElement) return;
        videoElement.currentTime = parseInt(seekSlider.value) / 1000;
        updateTimeDisplay();
        drawFrame();
    });

    function updateTimeDisplay() {
        if (!videoElement) return;
        const cur = Math.floor(videoElement.currentTime * 1000);
        const tot = Math.floor((videoElement.duration || 0) * 1000);
        timeDisplay.textContent = `${formatTimeShort(cur)} / ${formatTimeShort(tot)}`;
    }

    // ======================================================================
    // EXPORT VIDEO
    // ======================================================================
    btnExportVideo.addEventListener('click', async () => {
        if (!videoElement || !subtitles.length) {
            const dict = localDict[getCurrentLang()] || localDict['vi'];
            alert(!videoElement ? dict['subtitle-no-video'] : dict['subtitle-no-subs']);
            return;
        }
        if (isExporting) return;
        isExporting = true;
        btnExportVideo.disabled = true;
        btnExportVideo.innerHTML = '<span>' + (localDict[getCurrentLang()]['subtitle-exporting'] || 'Exporting...') + '</span>';

        videoElement.pause(); isPlaying = false;
        btnPlay.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
        videoElement.currentTime = 0;
        await new Promise(r => { videoElement.addEventListener('seeked', r, { once: true }); if (videoElement.currentTime === 0) setTimeout(r, 100); });

        const stream = canvas.captureStream(30);
        const audio = videoElement.captureStream().getAudioTracks();
        if (audio.length > 0) stream.addTrack(audio[0]);

        const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream, { mimeType: mime });
        mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = (videoFile ? videoFile.name.replace(/\.[^.]+$/, '') : 'video') + '_with_subtitles.webm';
            a.click();
            URL.revokeObjectURL(url);
            isExporting = false;
            btnExportVideo.disabled = false;
            btnExportVideo.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span>${localDict[getCurrentLang()]['subtitle-export-video']}</span>`;
        };

        mediaRecorder.start(100);
        videoElement.play(); isPlaying = true;
        btnPlay.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
        (function loop() { drawFrame(); animFrameId = requestAnimationFrame(loop); })();
        videoElement.addEventListener('ended', () => {
            mediaRecorder.stop();
            isPlaying = false;
            btnPlay.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
            drawFrame();
        }, { once: true });
    });

    // ======================================================================
    // EXPORT SRT
    // ======================================================================
    btnExportSrt.addEventListener('click', () => {
        if (!subtitles.length) { alert(localDict[getCurrentLang()]['subtitle-no-subs']); return; }
        let srt = '';
        subtitles.forEach((s, i) => {
            srt += `${i + 1}\n${formatTime(s.startMs)} --> ${formatTime(s.endMs)}\n${s.text}\n\n`;
        });
        const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = (videoFile ? videoFile.name.replace(/\.[^.]+$/, '') : 'subtitle') + '.srt';
        a.click();
        URL.revokeObjectURL(a.href);
    });

    // ======================================================================
    // MOBILE TABS
    // ======================================================================
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mobile-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active-panel'));
            btn.classList.add('active');
            const t = document.getElementById(btn.dataset.target);
            if (t) t.classList.add('active-panel');
        });
    });

    // ======================================================================
    // INIT
    // ======================================================================
    applyLocalTranslation(getCurrentLang());
    window.addEventListener('languageChanged', e => {
        applyLocalTranslation(e.detail?.lang || getCurrentLang());
        updateStatusUI();
        renderSubtitleTable();
    });
})();