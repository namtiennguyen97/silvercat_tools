(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.BackgroundRemoverCore = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const VALID_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

    function validateImageFile(file, maxSizeMb) {
        if (!file || !VALID_TYPES.has(file.type)) {
            return { ok: false, message: 'Please select a JPG, PNG, or WebP image.' };
        }
        const limit = Number(maxSizeMb) || 10;
        if (file.size > limit * 1024 * 1024) {
            return { ok: false, message: `Image is larger than the ${limit} MB limit.` };
        }
        return { ok: true };
    }

    function makeOutputName(originalName, format) {
        const base = String(originalName || 'image')
            .replace(/\.[^.]+$/, '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .replace(/[^a-zA-Z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-{2,}/g, '-')
            .toLowerCase() || 'image';
        return `${base}-no-bg.${format === 'webp' ? 'webp' : 'png'}`;
    }

    function getResizePlan(width, height, maxDimension) {
        const max = Number(maxDimension) || 2048;
        const longest = Math.max(width, height);
        if (longest <= max) {
            return { width, height, scale: 1 };
        }
        const scale = max / longest;
        return {
            width: Math.round(width * scale),
            height: Math.round(height * scale),
            scale
        };
    }

    function findAlphaBounds(data, width, height, alphaThreshold) {
        const threshold = Number(alphaThreshold) || 1;
        let minX = width;
        let minY = height;
        let maxX = -1;
        let maxY = -1;

        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                const alpha = data[(y * width + x) * 4 + 3];
                if (alpha >= threshold) {
                    if (x < minX) minX = x;
                    if (y < minY) minY = y;
                    if (x > maxX) maxX = x;
                    if (y > maxY) maxY = y;
                }
            }
        }

        if (maxX < minX || maxY < minY) {
            return { x: 0, y: 0, width, height };
        }

        return {
            x: minX,
            y: minY,
            width: maxX - minX + 1,
            height: maxY - minY + 1
        };
    }

    function progressMessage(key, percent) {
        const pct = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
        if (key === 'download') return `Loading AI model... ${pct}%`;
        if (key === 'compute') return `Removing background... ${pct}%`;
        return `Preparing image... ${pct}%`;
    }

    return {
        findAlphaBounds,
        getResizePlan,
        makeOutputName,
        progressMessage,
        validateImageFile
    };
}));
