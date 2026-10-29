/**
 * GLARS calculator
 * Implements the scoring methodology in the Deep Dive:
 *   Base  = JO×0.20 + AP×0.25 + TR×0.15 + EX×0.25 + TP×0.15
 *   GLARS = max(Base, EI, SS)
 *   A High embargo or sanction makes the overall level High.
 * Examples are loaded from /data/examples.json.
 */

document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('glars-form');
    if (!form) return;

    var VERSION = '1.0';
    var WEIGHTS = { JO: 0.20, AP: 0.25, TR: 0.15, EX: 0.25, TP: 0.15 };
    var CORE = Object.keys(WEIGHTS);
    var TRADE = ['EI', 'SS'];
    var KEYS = CORE.concat(TRADE);

    var LEVELS = {
        low: { label: 'Low', range: '0–40', controls: 'Standard security measures and routine compliance monitoring.' },
        medium: { label: 'Medium', range: '41–65', controls: 'Enhanced encryption, data minimisation, jurisdictional isolation and regular compliance reviews.' },
        high: { label: 'High', range: '66–100', controls: 'Data localisation in lower-risk jurisdictions, entity separation, zero-knowledge architectures, or avoiding the jurisdiction.' }
    };

    var $ = function (id) { return document.getElementById(id); };
    var examples = [];
    var activeExample = null;
    var copyTimer = null;
    var touched = false;

    // ---------- Scoring ----------

    function levelFor(score) {
        var n = Math.round(score);
        if (n <= 40) return 'low';
        if (n <= 65) return 'medium';
        return 'high';
    }

    function compute(v) {
        var base = CORE.reduce(function (sum, k) { return sum + v[k] * WEIGHTS[k]; }, 0);
        var score = Math.max(base, v.EI, v.SS);
        var level = levelFor(score);
        var tradeHigh = levelFor(v.EI) === 'high' || levelFor(v.SS) === 'high';
        if (tradeHigh) level = 'high';

        var driver = 'base';
        if (v.EI >= score && v.EI > base) driver = 'EI';
        if (v.SS >= score && v.SS > base && v.SS >= v.EI) driver = 'SS';

        return { base: base, score: score, level: level, driver: driver, tradeHigh: tradeHigh };
    }

    function toVector(v) {
        return 'GLARS:' + VERSION + '/B:' + KEYS.map(function (k) { return k + ':' + v[k]; }).join('/');
    }

    function parseVector(text) {
        var tokens = text.trim().split('/');
        if (!/^GLARS:\d+(\.\d+)?$/.test(tokens[0] || '')) {
            return { error: 'A vector starts with GLARS and a version, e.g. GLARS:1.0/B:JO:57/…' };
        }
        var values = {};
        var ignored = [];
        tokens.slice(1).forEach(function (raw) {
            var token = raw.replace(/^B:/, '');
            var m = /^([A-Z]{2}):(\d{1,3}(?:\.\d+)?)$/.exec(token);
            if (m && KEYS.indexOf(m[1]) !== -1) {
                values[m[1]] = Math.min(100, Math.round(parseFloat(m[2])));
            } else if (raw) {
                ignored.push(raw);
            }
        });
        var missing = KEYS.filter(function (k) { return !(k in values); });
        if (missing.length) {
            return { error: 'Missing ' + missing.join(', ') + '.' };
        }
        return { values: values, ignored: ignored };
    }

    // ---------- Inputs ----------

    function read() {
        var v = {};
        KEYS.forEach(function (k) { v[k] = clamp($('f-' + k).value); });
        return v;
    }

    function clamp(x) {
        var n = Math.round(Number(x));
        if (!isFinite(n)) return 0;
        return Math.max(0, Math.min(100, n));
    }

    function setField(k, value) {
        var n = clamp(value);
        $('f-' + k).value = n;
        $('n-' + k).value = n;
        $('f-' + k).style.setProperty('--fill', n + '%');
    }

    function apply(values, isResult) {
        touched = isResult !== false;
        KEYS.forEach(function (k) { setField(k, values[k] || 0); });
        update();
    }

    KEYS.forEach(function (k) {
        var range = $('f-' + k);
        var number = $('n-' + k);
        range.addEventListener('input', function () {
            touched = true;
            setField(k, range.value);
            update();
        });
        number.addEventListener('input', function () {
            if (number.value === '') return;
            touched = true;
            range.value = clamp(number.value);
            range.style.setProperty('--fill', range.value + '%');
            update();
        });
        number.addEventListener('change', function () {
            touched = true;
            setField(k, number.value);
            update();
        });
    });

    // ---------- Rendering ----------

    function fmt(n) {
        return (Math.round(n * 100) / 100).toFixed(2);
    }

    function setLevelBadge(el, level) {
        el.className = 'level-badge ' + level;
        el.textContent = LEVELS[level].label;
    }

    function showEmpty() {
        $('score').textContent = '–';
        $('mini-score').textContent = '–';
        $('level').hidden = true;
        $('mini-level').hidden = true;
        $('result-empty').hidden = false;
        $('result-body').hidden = true;
        $('save-body').hidden = true;
        try {
            history.replaceState(null, '', location.pathname + location.search);
        } catch (e) {
            /* Not available: nothing to clear. */
        }
    }

    function update() {
        var v = read();
        syncRationale(v);
        if (!touched) {
            showEmpty();
            return;
        }

        var r = compute(v);
        var rounded = Math.round(r.score);
        $('level').hidden = false;
        $('mini-level').hidden = false;
        $('result-empty').hidden = true;
        $('result-body').hidden = false;
        $('save-body').hidden = false;

        $('score').textContent = rounded;
        $('mini-score').textContent = rounded;
        setLevelBadge($('level'), r.level);
        setLevelBadge($('mini-level'), r.level);
        $('level-note').textContent = 'Recommended controls: ' + LEVELS[r.level].controls;

        $('base').textContent = fmt(r.base);
        $('ei').textContent = v.EI;
        $('ss').textContent = v.SS;
        ['base', 'EI', 'SS'].forEach(function (k) {
            $('row-' + k).classList.toggle('is-driver', r.driver === k);
        });

        var driverText = {
            base: 'The weighted legal base score sets the GLARS score.',
            EI: 'Embargo Impact exceeds the legal base score, so it sets the GLARS score.',
            SS: 'Sanction Severity exceeds the legal base score, so it sets the GLARS score.'
        }[r.driver];
        if (r.tradeHigh) driverText += ' A High embargo or sanction makes the overall level High.';
        $('driver').textContent = driverText;

        var vector = toVector(v);
        $('vector').textContent = vector;
        $('working').textContent = working(v, r);

        try {
            history.replaceState(null, '', '#' + vector);
        } catch (e) {
            /* file:// or sandboxed: sharing via URL just won't work. */
        }
    }

    function working(v, r) {
        var terms = CORE.map(function (k) { return k + ' ' + v[k] + ' × ' + WEIGHTS[k].toFixed(2); });
        var parts = CORE.map(function (k) { return fmt(v[k] * WEIGHTS[k]); });
        return [
            'Base  = ' + terms.join('\n      + '),
            '      = ' + parts.join(' + '),
            '      = ' + fmt(r.base),
            '',
            'GLARS = max(Base ' + fmt(r.base) + ', EI ' + v.EI + ', SS ' + v.SS + ')',
            '      = ' + Math.round(r.score) + '  →  ' + LEVELS[r.level].label + ' (' + LEVELS[r.level].range + ')'
        ].join('\n');
    }

    // ---------- Examples ----------

    function safeUrl(url) {
        return typeof url === 'string' && (/^https:\/\//.test(url) || /^\/(?!\/)/.test(url)) ? url : null;
    }

    function renderExample(ex) {
        var box = $('example-explainer');
        activeExample = ex;
        if (!ex) {
            box.hidden = true;
            syncRationale(read());
            return;
        }

        $('example-kind').textContent = (ex.kind || 'Example') + ' · loaded into the calculator';
        $('example-title').textContent = ex.title;
        $('example-summary').textContent = ex.summary || '';

        var body = $('example-body');
        body.textContent = '';
        (ex.explainer || []).forEach(function (para) {
            var p = document.createElement('p');
            p.textContent = para;
            body.appendChild(p);
        });
        var link = ex.link && safeUrl(ex.link.url);
        if (link) {
            var p = document.createElement('p');
            var a = document.createElement('a');
            a.href = link;
            a.textContent = ex.link.label || link;
            p.appendChild(a);
            body.appendChild(p);
        }

        var list = $('example-source-list');
        list.textContent = '';
        (ex.sources || []).forEach(function (s) {
            var url = safeUrl(s.url);
            if (!url) return;
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.href = url;
            a.rel = 'noopener';
            a.textContent = s.label || url;
            li.appendChild(a);
            list.appendChild(li);
        });
        $('example-sources').hidden = !list.children.length;
        box.hidden = false;
    }

    function syncRationale(v) {
        var ex = activeExample;
        var changed = false;
        KEYS.forEach(function (k) {
            var el = $('r-' + k);
            var note = ex && ex.rationale && ex.rationale[k];
            var matches = ex && ex.values && ex.values[k] === v[k];
            if (ex && !matches) changed = true;
            el.hidden = !(note && matches);
            el.textContent = note && matches ? note : '';
        });
        if (ex) {
            $('example-kind').textContent = (ex.kind || 'Example') + (changed ? ' · you have changed some scores' : ' · loaded into the calculator');
        }
    }

    function markTemplate(id) {
        document.querySelectorAll('#example-buttons .template-button').forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.getAttribute('data-example') === (id || '')));
        });
    }

    function selectExample(id) {
        var ex = examples.filter(function (e) { return e.id === id; })[0] || null;
        markTemplate(ex ? ex.id : '');
        renderExample(ex);
        if (ex) {
            apply(ex.values);
        } else {
            apply({}, false);
        }
    }

    function matchingExample(values) {
        return examples.filter(function (e) {
            return KEYS.every(function (k) { return e.values && e.values[k] === values[k]; });
        })[0] || null;
    }

    $('example-buttons').addEventListener('click', function (e) {
        var button = e.target.closest('.template-button');
        if (button) selectExample(button.getAttribute('data-example'));
    });

    // ---------- Actions ----------

    function flash(id, message) {
        var el = $(id);
        el.textContent = message;
        clearTimeout(copyTimer);
        copyTimer = setTimeout(function () { el.textContent = ''; }, 2500);
    }

    function copy(text, label) {
        if (!navigator.clipboard) {
            flash('copy-status', 'Copying is not available in this browser.');
            return;
        }
        navigator.clipboard.writeText(text).then(function () {
            flash('copy-status', label + ' copied.');
        }, function () {
            flash('copy-status', 'Could not copy. Select the text instead.');
        });
    }

    $('copy-vector').addEventListener('click', function () {
        copy($('vector').textContent, 'Vector');
    });

    $('copy-link').addEventListener('click', function () {
        copy(location.origin + location.pathname + '#' + $('vector').textContent, 'Link');
    });

    $('reset').addEventListener('click', function () {
        selectExample('');
        $('calculator').scrollIntoView({ block: 'start' });
    });

    function loadVector(text, quiet) {
        var parsed = parseVector(text);
        if (parsed.error) {
            if (!quiet) $('vector-status').textContent = parsed.error;
            return false;
        }
        var ex = matchingExample(parsed.values);
        markTemplate(ex ? ex.id : '');
        renderExample(ex);
        apply(parsed.values);
        if (!quiet) {
            $('vector-status').textContent = parsed.ignored.length
                ? 'Loaded. Not yet scored by the calculator: ' + parsed.ignored.join(', ')
                : 'Loaded.';
        }
        return true;
    }

    $('load-vector').addEventListener('click', function () {
        loadVector($('vector-input').value);
    });

    $('vector-input').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            loadVector(this.value);
        }
    });

    // ---------- Mobile score bar ----------

    var mini = $('calc-mini');
    if ('IntersectionObserver' in window) {
        var inCalc = false;
        var resultVisible = false;
        var refresh = function () { mini.classList.toggle('is-visible', touched && inCalc && !resultVisible); };
        new IntersectionObserver(function (e) { inCalc = e[0].isIntersecting; refresh(); })
            .observe(form);
        new IntersectionObserver(function (e) { resultVisible = e[0].isIntersecting; refresh(); })
            .observe(document.querySelector('.calc-score'));
    }

    // ---------- Start ----------

    function start() {
        var hash = decodeURIComponent(location.hash.slice(1));
        if (hash && loadVector(hash, true)) return;
        apply({}, false);
    }

    fetch('/data/examples.json')
        .then(function (res) { return res.ok ? res.json() : { examples: [] }; })
        .catch(function () { return { examples: [] }; })
        .then(function (data) {
            examples = (data.examples || []).filter(function (e) { return e.id && e.title && e.values; });
            var group = $('example-buttons');
            examples.forEach(function (e) {
                var b = document.createElement('button');
                b.type = 'button';
                b.className = 'template-button';
                b.setAttribute('data-example', e.id);
                b.setAttribute('aria-pressed', 'false');
                b.textContent = e.title;
                group.appendChild(b);
            });
            start();
        });
});
