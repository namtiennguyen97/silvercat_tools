(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.FileRenamerCore = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const DEFAULT_OPTIONS = {
        template: '{seq}-{name}',
        prefix: '',
        suffix: '',
        sequenceStart: 1,
        sequencePad: 3,
        dateSource: 'modified',
        dateFormat: 'yyyy-mm-dd',
        lowercase: true,
        slugify: true,
        removeAccents: true,
        findText: '',
        replaceText: '',
        metadataMode: 'strip-images'
    };

    function getExtension(name) {
        const lastDot = name.lastIndexOf('.');
        if (lastDot <= 0 || lastDot === name.length - 1) return '';
        return name.slice(lastDot + 1).toLowerCase();
    }

    function getBaseName(name) {
        const lastDot = name.lastIndexOf('.');
        if (lastDot <= 0) return name;
        return name.slice(0, lastDot);
    }

    function removeAccents(value) {
        return String(value)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
    }

    function slugifyName(value) {
        return removeAccents(value)
            .replace(/[^a-zA-Z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-{2,}/g, '-')
            .toLowerCase();
    }

    function padNumber(value, width) {
        return String(value).padStart(Math.max(1, Number(width) || 1), '0');
    }

    function formatDate(date, format) {
        const d = date instanceof Date ? date : new Date(date);
        const year = d.getFullYear();
        const month = padNumber(d.getMonth() + 1, 2);
        const day = padNumber(d.getDate(), 2);
        if (format === 'yyyymmdd') return `${year}${month}${day}`;
        if (format === 'dd-mm-yyyy') return `${day}-${month}-${year}`;
        return `${year}-${month}-${day}`;
    }

    function normalizeName(baseName, options) {
        let value = String(baseName || '').trim();
        if (options.removeAccents) value = removeAccents(value);
        if (options.findText) {
            const pattern = escapeRegExp(options.findText);
            value = value.replace(new RegExp(pattern, 'gi'), options.replaceText || '');
        }
        if (options.slugify) {
            value = slugifyName(value);
        } else {
            value = value.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim();
            if (options.lowercase) value = value.toLowerCase();
        }
        if (options.lowercase) value = value.toLowerCase();
        return value || 'file';
    }

    function escapeRegExp(value) {
        return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function planRenames(files, rawOptions) {
        const options = Object.assign({}, DEFAULT_OPTIONS, rawOptions || {});
        const seenHashes = new Map();
        const seenNames = new Map();
        const start = Number(options.sequenceStart) || 1;

        return files.map((file, index) => {
            const extension = getExtension(file.name);
            const baseName = getBaseName(file.name);
            const normalized = normalizeName(baseName, options);
            const seq = padNumber(start + index, Number(options.sequencePad) || 1);
            const dateValue = formatDate(new Date(file.lastModified || Date.now()), options.dateFormat);
            const metadataAction = shouldStripImageMetadata(file, options) ? 'strip-image-metadata' : 'keep-original';

            let stem = String(options.template || '{seq}-{name}')
                .replace(/\{seq\}/g, seq)
                .replace(/\{name\}/g, normalized)
                .replace(/\{date\}/g, dateValue)
                .replace(/\{ext\}/g, extension);

            stem = `${options.prefix || ''}${stem}${options.suffix || ''}`;
            stem = normalizeName(stem, Object.assign({}, options, { findText: '', replaceText: '' }));

            let newName = extension ? `${stem}.${extension}` : stem;
            const originalNewName = newName;
            let collision = 2;
            while (seenNames.has(newName)) {
                newName = extension ? `${stem}-${collision}.${extension}` : `${stem}-${collision}`;
                collision += 1;
            }
            seenNames.set(newName, true);

            const duplicateOf = file.hash && seenHashes.has(file.hash) ? seenHashes.get(file.hash) : '';
            if (file.hash && !seenHashes.has(file.hash)) seenHashes.set(file.hash, file.name);

            return {
                originalName: file.name,
                newName,
                requestedName: originalNewName,
                size: file.size || 0,
                type: file.type || '',
                extension,
                hash: file.hash || '',
                isDuplicate: Boolean(duplicateOf),
                duplicateOf,
                metadataAction
            };
        });
    }

    function shouldStripImageMetadata(file, options) {
        if (options.metadataMode === 'keep') return false;
        const type = String(file.type || '').toLowerCase();
        return type === 'image/jpeg' || type === 'image/png' || type === 'image/webp';
    }

    function csvEscape(value) {
        return `"${String(value == null ? '' : value).replace(/"/g, '""')}"`;
    }

    function buildCsvReport(rows) {
        const headers = ['originalName', 'newName', 'size', 'type', 'duplicateOf', 'metadataAction'];
        const lines = [headers.map(csvEscape).join(',')];
        rows.forEach(row => {
            lines.push(headers.map(key => csvEscape(row[key])).join(','));
        });
        return lines.join('\n');
    }

    return {
        DEFAULT_OPTIONS,
        buildCsvReport,
        formatDate,
        getBaseName,
        getExtension,
        planRenames,
        removeAccents,
        slugifyName
    };
}));
