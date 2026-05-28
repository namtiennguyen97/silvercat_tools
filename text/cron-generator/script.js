(function () {
    'use strict';

    // ============================================================
    // CRON UTILITIES
    // ============================================================

    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    function parseCronField(field, min, max) {
        if (field === '*' || field === '?') return { type: 'every', values: [] };
        if (field.includes(',')) {
            const vals = field.split(',').map(Number).filter(n => !isNaN(n) && n >= min && n <= max);
            return { type: 'specific', values: vals };
        }
        if (field.includes('/')) {
            const parts = field.split('/');
            const start = parts[0] === '*' ? min : parseInt(parts[0], 10);
            const step = parseInt(parts[1], 10);
            if (!isNaN(start) && !isNaN(step) && step > 0) return { type: 'step', start, step };
        }
        if (field.includes('-')) {
            const parts = field.split('-');
            const from = parseInt(parts[0], 10);
            const to = parseInt(parts[1], 10);
            if (!isNaN(from) && !isNaN(to) && from >= min && to <= max && from <= to) return { type: 'range', from, to };
        }
        const single = parseInt(field, 10);
        if (!isNaN(single) && single >= min && single <= max) return { type: 'specific', values: [single] };
        return { type: 'every', values: [] };
    }

    function buildCronField(type, values, fieldMin, fieldMax) {
        if (type === 'every') return '*';
        if (type === 'specific') {
            if (!values || values.length === 0) return '*';
            return values.sort((a, b) => a - b).join(',');
        }
        if (type === 'range') {
            const v = values || {};
            if (v.from !== undefined && v.to !== undefined) return v.from + '-' + v.to;
            return '*';
        }
        if (type === 'step') {
            const v = values || {};
            if (v.step !== undefined) {
                const start = v.start !== undefined ? v.start : fieldMin;
                return start + '/' + v.step;
            }
            return '*';
        }
        return '*';
    }

    function humanizeField(field, name, min, max) {
        if (field === '*' || field === '?') return 'every';
        if (field.includes('/')) {
            const parts = field.split('/');
            const step = parts[1];
            const start = parts[0] === '*' ? min : parts[0];
            if (name === 'minute') return 'every ' + step + ' min';
            if (name === 'hour') return 'every ' + step + ' hour(s)';
            return 'every ' + step + ' ' + name + '(s) (start ' + start + ')';
        }
        if (field.includes(',')) {
            const vals = field.split(',').map(Number);
            if (name === 'dow') return vals.map(v => DAY_NAMES[v] || v).join(', ');
            if (name === 'month') return vals.map(v => MONTH_NAMES[v - 1] || v).join(', ');
            return vals.join(', ');
        }
        if (field.includes('-')) {
            const parts = field.split('-');
            if (name === 'dow') return DAY_NAMES[parseInt(parts[0])] + '-' + DAY_NAMES[parseInt(parts[1])];
            if (name === 'month') return MONTH_NAMES[parseInt(parts[0]) - 1] + '-' + MONTH_NAMES[parseInt(parts[1]) - 1];
            return parts[0] + '-' + parts[1];
        }
        const v = parseInt(field, 10);
        if (!isNaN(v)) {
            if (name === 'dow') return DAY_NAMES[v] || v;
            if (name === 'month') return MONTH_NAMES[v - 1] || v;
            return String(v);
        }
        return field;
    }

    function humanizeCron(expr) {
        const parts = expr.trim().split(/\s+/);
        if (parts.length !== 5) return 'Invalid cron expression (must have 5 fields)';

        const [minute, hour, dom, month, dow] = parts;

        const hMin = humanizeField(minute, 'minute', 0, 59);
        const hHour = humanizeField(hour, 'hour', 0, 23);
        const hDom = humanizeField(dom, 'day of month', 1, 31);
        const hMonth = humanizeField(month, 'month', 1, 12);
        const hDow = humanizeField(dow, 'dow', 0, 6);

        const detail = [
            { name: 'Minute', val: hMin },
            { name: 'Hour', val: hHour },
            { name: 'Day of Month', val: hDom },
            { name: 'Month', val: hMonth },
            { name: 'Day of Week', val: hDow }
        ];

        // Build readable sentence
        let readable = '';

        // Check if all *
        if (minute === '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') {
            readable = 'Every minute';
            return { readable, detail };
        }

        // Handle step patterns: */N * * * *
        if (minute.startsWith('*/') && hour === '*' && dom === '*' && month === '*' && dow === '*') {
            const n = minute.split('/')[1];
            readable = 'Every ' + n + ' minutes';
            return { readable, detail };
        }

        // Handle 0 * * * * → every hour
        if ((minute === '0' || minute === '0') && hour === '*' && dom === '*' && month === '*' && dow === '*') {
            readable = 'Every hour (at minute 0)';
            return { readable, detail };
        }

        // Build time component
        let timePart = '';
        if (minute !== '*' && hour !== '*' && !minute.includes('/') && !hour.includes('/')) {
            const m = parseInt(minute, 10);
            const h = parseInt(hour, 10);
            if (!isNaN(m) && !isNaN(h)) {
                const ampm = h >= 12 ? 'PM' : 'AM';
                const h12 = h % 12 || 12;
                const minStr = m < 10 ? '0' + m : '' + m;
                timePart = 'at ' + h12 + ':' + minStr + ' ' + ampm;
            } else {
                timePart = 'at ' + hour + ':' + minute;
            }
        } else if (minute !== '*' && hour === '*') {
            if (minute.startsWith('*/')) {
                timePart = 'every ' + minute.split('/')[1] + ' minutes past the hour';
            } else if (minute.includes('-') || minute.includes(',')) {
                timePart = 'at minute ' + hMin;
            } else {
                timePart = 'at minute ' + hMin;
            }
        } else if (hour !== '*' && minute === '*') {
            if (hour.startsWith('*/')) {
                timePart = 'every ' + hour.split('/')[1] + ' hours';
            } else if (hour.includes('-') || hour.includes(',')) {
                timePart = 'every hour between ' + hHour.replace(/,/g, ', ');
            } else {
                const h = parseInt(hour, 10);
                if (!isNaN(h)) {
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    const h12 = h % 12 || 12;
                    timePart = 'at ' + h12 + ':00 ' + ampm;
                } else {
                    timePart = 'at hour ' + hHour;
                }
            }
        } else if (hour !== '*' && minute !== '*') {
            // both specific but with ranges or steps
            if (minute.includes('/') || hour.includes('/')) {
                timePart = 'minute ' + hMin + ', hour ' + hHour;
            } else if (minute.includes('-') || hour.includes('-')) {
                timePart = hMin + ' min, ' + hHour + ' hour';
            } else {
                const m = parseInt(minute, 10);
                const h = parseInt(hour, 10);
                if (!isNaN(m) && !isNaN(h)) {
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    const h12 = h % 12 || 12;
                    const minStr = m < 10 ? '0' + m : '' + m;
                    timePart = 'at ' + h12 + ':' + minStr + ' ' + ampm;
                } else {
                    timePart = 'at ' + hour + ':' + minute;
                }
            }
        }

        let daysPart = '';
        if (dow !== '*' && dom !== '*') {
            // Both specified: combine
            const dowStr = hDow.includes(',') ? hDow : hDow;
            const domStr = hDom.includes(',') ? hDom : hDom;
            if (dow.includes(',')) daysPart = 'on ' + dowStr;
            else daysPart = 'on ' + dowStr;
            if (dom !== '*' && dom !== '?') daysPart += ' and day ' + domStr + ' of month';
        } else if (dow !== '*') {
            if (dow.startsWith('*/')) {
                daysPart = 'every ' + dow.split('/')[1] + ' day(s) of week';
            } else if (dow.includes('-')) {
                daysPart = 'on ' + hDow;
            } else if (dow.includes(',')) {
                daysPart = 'on ' + hDow;
            } else {
                daysPart = 'on ' + hDow + 's';
            }
        } else if (dom !== '*') {
            daysPart = 'on day ' + hDom + ' of month';
        }

        let monthPart = '';
        if (month !== '*') {
            monthPart = 'in ' + hMonth;
        }

        readable = [timePart, daysPart, monthPart].filter(Boolean).join(', ');
        if (!readable) readable = 'At ' + hMin + ' minute(s), ' + hHour + ' hour(s), on ' + hDom + ', ' + hMonth + ', ' + hDow;

        return { readable, detail };
    }

    function getNextExecutions(expr, count) {
        count = count || 5;
        const parts = expr.trim().split(/\s+/);
        if (parts.length !== 5) return [];

        const [minute, hour, dom, month, dow] = parts;
        const cronParts = parts;

        const results = [];
        const now = new Date();
        now.setSeconds(0, 0);

        let current = new Date(now);
        // Start from the next minute
        current.setMinutes(current.getMinutes() + 1, 0, 0);

        const maxIter = 525600; // 1 year of minutes
        let iter = 0;

        while (results.length < count && iter < maxIter) {
            iter++;

            const m = current.getMinutes();
            const h = current.getHours();
            const d = current.getDate();
            const mo = current.getMonth() + 1; // 1-12
            const dw = current.getDay(); // 0-6

            let match = true;

            // Check minute
            if (!matchField(minute, m, 0, 59)) match = false;
            // Check hour
            if (match && !matchField(hour, h, 0, 23)) match = false;
            // Check day of month
            if (match && !matchField(dom, d, 1, 31)) match = false;
            // Check month
            if (match && !matchField(month, mo, 1, 12)) match = false;
            // Check day of week
            if (match && !matchField(dow, dw, 0, 6)) match = false;

            if (match) {
                results.push(new Date(current));
            }

            current.setMinutes(current.getMinutes() + 1);
        }

        return results;
    }

    function matchField(pattern, value, min, max) {
        if (pattern === '*' || pattern === '?') return true;

        if (pattern.includes(',')) {
            const parts = pattern.split(',');
            for (const p of parts) {
                if (matchField(p.trim(), value, min, max)) return true;
            }
            return false;
        }

        if (pattern.includes('/')) {
            const [startStr, stepStr] = pattern.split('/');
            const step = parseInt(stepStr, 10);
            if (isNaN(step) || step <= 0) return false;
            const start = startStr === '*' ? min : parseInt(startStr, 10);
            if (isNaN(start)) return false;
            if (value < start) return false;
            return (value - start) % step === 0;
        }

        if (pattern.includes('-')) {
            const [fromStr, toStr] = pattern.split('-');
            const from = parseInt(fromStr, 10);
            const to = parseInt(toStr, 10);
            if (isNaN(from) || isNaN(to)) return false;
            return value >= from && value <= to;
        }

        const num = parseInt(pattern, 10);
        if (isNaN(num)) return false;
        return value === num;
    }

    // ============================================================
    // DOM REFS
    // ============================================================

    const tabs = document.querySelectorAll('.cron-tab');
    const panels = {
        generator: document.getElementById('panel-generator'),
        humanizer: document.getElementById('panel-humanizer'),
        cheatsheet: document.getElementById('panel-cheatsheet')
    };

    // Generator fields
    const minuteType = document.getElementById('cron-minute-type');
    const hourType = document.getElementById('cron-hour-type');
    const domType = document.getElementById('cron-dom-type');
    const monthType = document.getElementById('cron-month-type');
    const dowType = document.getElementById('cron-dow-type');

    const minuteEvery = document.getElementById('cron-minute-every');
    const hourEvery = document.getElementById('cron-hour-every');
    const domEvery = document.getElementById('cron-dom-every');
    const monthEvery = document.getElementById('cron-month-every');
    const dowSpecific = document.getElementById('cron-dow-specific');

    const cronOutput = document.getElementById('cron-expression-output');
    const cronHumanized = document.getElementById('cron-humanized-output');
    const cronCopyBtn = document.getElementById('cron-copy-btn');
    const nextExecs = document.getElementById('next-executions');

    // Humanizer refs
    const humanizerInput = document.getElementById('humanizer-input');
    const humanizerDisplay = document.getElementById('humanizer-expr-display');
    const humanizerReadable = document.getElementById('humanizer-readable');
    const humanizerDetail = document.getElementById('humanizer-detail');
    const humanizerClearBtn = document.getElementById('humanizer-clear-btn');

    const presetBtns = document.querySelectorAll('[data-preset]');
    const exampleBtns = document.querySelectorAll('.humanizer-example-btn');

    // ============================================================
    // BUILDER LOGIC
    // ============================================================

    function getFieldValue(typeEl, everyEl, fieldMin, fieldMax, extra) {
        const type = typeEl.value;
        switch (type) {
            case 'every':
                return { type: 'every', values: {} };
            case 'specific':
                if (extra) {
                    const selected = Array.from(extra.selectedOptions).map(o => parseInt(o.value, 10));
                    return { type: 'specific', values: selected };
                }
                return { type: 'specific', values: [fieldMin] };
            case 'range':
                return { type: 'range', values: { from: fieldMin, to: fieldMax } };
            case 'step':
                const val = parseInt(everyEl.value, 10);
                return { type: 'step', values: { start: fieldMin, step: val || 1 } };
            default:
                return { type: 'every', values: {} };
        }
    }

    function buildCronString() {
        const minute = buildField(minuteType, minuteEvery, 0, 59, null);
        const hour = buildField(hourType, hourEvery, 0, 23, null);
        const dom = buildField(domType, domEvery, 1, 31, null);
        const month = buildField(monthType, monthEvery, 1, 12, null);
        const dow = buildField(dowType, null, 0, 6, dowSpecific);

        return minute + ' ' + hour + ' ' + dom + ' ' + month + ' ' + dow;
    }

    function buildField(typeEl, everyEl, fieldMin, fieldMax, extra) {
        const type = typeEl.value;
        switch (type) {
            case 'every':
                return '*';
            case 'specific':
                if (extra) {
                    const selected = Array.from(extra.selectedOptions).map(o => parseInt(o.value, 10));
                    if (selected.length === 0) return '*';
                    return selected.join(',');
                }
                return '*';
            case 'range':
                return fieldMin + '-' + fieldMax;
            case 'step':
                const val = parseInt(everyEl ? everyEl.value : 1, 10);
                return '*/' + (val || 1);
            default:
                return '*';
        }
    }

    function updateGenerator() {
        const expr = buildCronString();
        cronOutput.textContent = expr;

        const humanized = humanizeCron(expr);
        cronHumanized.textContent = humanized.readable;

        // Update next executions
        const nextDates = getNextExecutions(expr, 5);
        const rows = nextExecs.querySelectorAll('.next-run-row');
        if (nextDates.length === 0) {
            rows.forEach(r => r.querySelector('.next-run-date').textContent = '—');
        } else {
            rows.forEach((r, i) => {
                if (i < nextDates.length) {
                    const d = nextDates[i];
                    const pad = n => String(n).padStart(2, '0');
                    r.querySelector('.next-run-date').textContent =
                        d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
                        pad(d.getHours()) + ':' + pad(d.getMinutes());
                } else {
                    r.querySelector('.next-run-date').textContent = '—';
                }
            });
        }
    }

    // ============================================================
    // HUMANIZER LOGIC
    // ============================================================

    function updateHumanizer() {
        const expr = humanizerInput.value.trim();
        if (!expr) {
            humanizerDisplay.textContent = '—';
            humanizerReadable.textContent = 'Enter a cron expression above';
            humanizerDetail.innerHTML = '';
            return;
        }
        const parts = expr.split(/\s+/);
        if (parts.length !== 5) {
            humanizerDisplay.textContent = expr;
            humanizerReadable.textContent = '❌ Invalid: must have 5 fields';
            humanizerDetail.innerHTML = '';
            return;
        }

        humanizerDisplay.textContent = expr;
        const humanized = humanizeCron(expr);
        humanizerReadable.textContent = humanized.readable;
        humanizerDetail.innerHTML = humanized.detail.map(d =>
            '<span class="detail-item"><strong>' + d.name + ':</strong> ' + d.val + '</span>'
        ).join('');
    }

    // ============================================================
    // EVENTS
    // ============================================================

    // Tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            Object.keys(panels).forEach(k => panels[k].classList.toggle('active', k === tab.dataset.tab));
        });
    });

    // Generator field changes
    [minuteType, hourType, domType, monthType, dowType].forEach(el => {
        el.addEventListener('change', updateGenerator);
    });
    [minuteEvery, hourEvery, domEvery, monthEvery].forEach(el => {
        el.addEventListener('input', updateGenerator);
    });
    dowSpecific.addEventListener('change', updateGenerator);

    // Presets
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const preset = btn.dataset.preset;
            switch (preset) {
                case 'everymin':
                    minuteType.value = 'every';
                    hourType.value = 'every';
                    domType.value = 'every';
                    monthType.value = 'every';
                    dowType.value = 'every';
                    break;
                case 'everyhour':
                    minuteType.value = 'specific';
                    hourType.value = 'every';
                    domType.value = 'every';
                    monthType.value = 'every';
                    dowType.value = 'every';
                    minuteEvery.value = 0;
                    break;
                case 'daily':
                    minuteType.value = 'specific';
                    hourType.value = 'specific';
                    domType.value = 'every';
                    monthType.value = 'every';
                    dowType.value = 'every';
                    minuteEvery.value = 0;
                    hourEvery.value = 0;
                    break;
                case 'weekdays':
                    minuteType.value = 'specific';
                    hourType.value = 'specific';
                    domType.value = 'every';
                    monthType.value = 'every';
                    dowType.value = 'range';
                    minuteEvery.value = 0;
                    hourEvery.value = 9;
                    break;
                case 'monthly':
                    minuteType.value = 'specific';
                    hourType.value = 'specific';
                    domType.value = 'specific';
                    monthType.value = 'every';
                    dowType.value = 'every';
                    minuteEvery.value = 0;
                    hourEvery.value = 0;
                    break;
                case 'custom':
                    // Reset to *
                    minuteType.value = 'every';
                    hourType.value = 'every';
                    domType.value = 'every';
                    monthType.value = 'every';
                    dowType.value = 'every';
                    break;
            }
            updateGenerator();
        });
    });

    // Copy button
    cronCopyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(cronOutput.textContent).then(() => {
            cronCopyBtn.classList.add('copied');
            cronCopyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
            setTimeout(() => {
                cronCopyBtn.classList.remove('copied');
                cronCopyBtn.innerHTML =
                    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
            }, 1500);
        });
    });

    // Humanizer input
    humanizerInput.addEventListener('input', updateHumanizer);

    humanizerClearBtn.addEventListener('click', () => {
        humanizerInput.value = '';
        updateHumanizer();
    });

    // Humanizer example buttons
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            humanizerInput.value = btn.dataset.expr;
            updateHumanizer();
        });
    });

    // ============================================================
    // INIT
    // ============================================================

    updateGenerator();
    updateHumanizer();

})();