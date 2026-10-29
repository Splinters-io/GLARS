/**
 * GLARS Perspective score
 * The Base score is the same for everyone. The Perspective score adjusts it
 * for where the question is asked from (the asker's jurisdiction) and where
 * the data is held:
 *
 *   M        = clamp(product of the factors that apply, 0.8, 1.3)
 *   GLARS-P  = min(100, max(Base × M, EI × rEI, SS × rSS))
 *
 * Factors: Five Eyes sharing, CLOUD Act agreements and adequacy findings
 * (treaty facts, GLARS default weights), and the governance gap from the
 * World Bank Worldwide Governance Indicators: 1 + k × max(0, gap) / 100.
 * rEI and rSS say how far the scored embargoes and sanctions bind the asker.
 * Inputs and default weights are in /data/perspective.json.
 *
 * Exposes window.GLARSPerspective for calculator.js.
 */

(function () {
    var data = null;
    var state = { asker: '', held: '', w: {}, r: { EI: 1, SS: 1 } };
    var pending = null;      // tokens from a link, applied once data loads
    var onChange = function () {};
    var lastResult = null;
    var names = null;

    function countryName(code) {
        try {
            if (!names) names = new Intl.DisplayNames(['en'], { type: 'region' });
            return names.of(code) || code;
        } catch (e) {
            return code;
        }
    }

    function weight(id) {
        return id in state.w ? state.w[id] : data.factors[id].weight;
    }

    function round2(n) {
        return Math.round(n * 100) / 100;
    }

    function levelFor(score) {
        var n = Math.round(score);
        if (n <= 40) return 'low';
        if (n <= 65) return 'medium';
        return 'high';
    }

    // ---------- The calculation ----------

    // Returns the factors that apply between asker A and held-in J.
    function factorsFor(A, J) {
        var f = data.factors;
        var out = [];
        if (!A || !J || A === J) return out;

        if (f.FVEY.members.indexOf(A) !== -1 && f.FVEY.members.indexOf(J) !== -1) {
            out.push({ id: 'FVEY', label: f.FVEY.label, weight: weight('FVEY'), detail: f.FVEY.explain, source: f.FVEY.source });
        }

        f.CLOUD.pairs.forEach(function (p) {
            if ((p.a === A && p.b === J) || (p.a === J && p.b === A)) {
                out.push({ id: 'CLOUD', label: f.CLOUD.label, weight: weight('CLOUD'),
                    detail: f.CLOUD.explain + ' In force since ' + p.in_force + '.', source: p.source });
            }
        });

        f.ADQ.regimes.forEach(function (reg) {
            if (reg.askers.indexOf(A) !== -1 && reg.held.indexOf(J) !== -1) {
                var detail = reg.name + ' for ' + countryName(J) + '.';
                if (reg.partial && reg.partial[J]) detail += ' Covers ' + reg.partial[J] + '.';
                out.push({ id: 'ADQ', label: f.ADQ.label, weight: weight('ADQ'), detail: detail, source: reg.source });
            }
        });

        var g = data.governance.values;
        if (g[A] && g[J]) {
            var gapRL = g[A][0] - g[J][0];
            var gapPV = g[A][1] - g[J][1];
            var gap = Math.max(0, (gapRL + gapPV) / 2);
            var k = weight('GOV');
            var m = 1 + k * gap / 100;
            out.push({
                id: 'GOV', label: f.GOV.label, weight: round2(m), k: k,
                detail: 'Rule of Law ' + g[A][0] + ' (' + countryName(A) + ') vs ' + g[J][0] + ' (' + countryName(J) + '); ' +
                    'Political Stability ' + g[A][1] + ' vs ' + g[J][1] + '. Average gap ' + round2(gap) +
                    ', so 1 + ' + k + ' × ' + round2(gap) + ' / 100 = ' + round2(m) + '.',
                source: { label: data.governance.label + ', ' + data.governance.licence, url: data.governance.url }
            });
        }
        return out;
    }

    function compute(base, v) {
        if (!data || !state.asker || !state.held) return null;
        var factors = factorsFor(state.asker, state.held);
        var product = factors.reduce(function (m, f) { return m * f.weight; }, 1);
        var lo = data.clamp[0];
        var hi = data.clamp[1];
        var M = Math.min(hi, Math.max(lo, product));
        var legal = base * M;
        var ei = v.EI * state.r.EI;
        var ss = v.SS * state.r.SS;
        var score = Math.min(100, Math.max(legal, ei, ss));
        var driver = 'base';
        if (ei >= score && ei > legal) driver = 'EI';
        if (ss >= score && ss > legal && ss >= ei) driver = 'SS';
        return {
            base: base, v: v,
            score: score, level: levelFor(score), M: M, product: product, clamped: product !== M,
            legal: legal, ei: ei, ss: ss, driver: driver, factors: factors, same: state.asker === state.held
        };
    }

    // ---------- Vector tokens ----------

    // P:GB (asker), J:IN (held in), W:FVEY:1.15 (changed weight), R:SS:0.5 (relevance)
    function tokens() {
        if (!data) return pending || [];
        var out = [];
        if (state.asker) out.push('P:' + state.asker);
        if (state.held) out.push('J:' + state.held);
        Object.keys(state.w).forEach(function (id) {
            if (state.w[id] !== data.factors[id].weight) out.push('W:' + id + ':' + state.w[id]);
        });
        ['EI', 'SS'].forEach(function (k) {
            if (state.r[k] !== 1) out.push('R:' + k + ':' + state.r[k]);
        });
        return out;
    }

    // Returns true if the token is a perspective token (so it is not "ignored").
    function isToken(raw) {
        return /^(P|J):[A-Z]{2}$/.test(raw) || /^W:[A-Z]{2,5}:\d+(\.\d+)?$/.test(raw) || /^R:(EI|SS):\d+(\.\d+)?$/.test(raw);
    }

    function applyTokens(list) {
        if (!data) {
            pending = list.slice();
            return;
        }
        state = { asker: '', held: '', w: {}, r: { EI: 1, SS: 1 } };
        list.forEach(function (raw) {
            var m;
            if ((m = /^P:([A-Z]{2})$/.exec(raw))) state.asker = m[1];
            else if ((m = /^J:([A-Z]{2})$/.exec(raw))) state.held = m[1];
            else if ((m = /^W:([A-Z]{2,5}):(\d+(?:\.\d+)?)$/.exec(raw)) && data.factors[m[1]]) state.w[m[1]] = clampWeight(parseFloat(m[2]));
            else if ((m = /^R:(EI|SS):(\d+(?:\.\d+)?)$/.exec(raw))) state.r[m[1]] = Math.min(1, parseFloat(m[2]));
        });
        syncInputs();
    }

    function clampWeight(n) {
        return isFinite(n) ? Math.min(3, Math.max(0, round2(n))) : 1;
    }

    // ---------- Page ----------

    var $ = function (id) { return document.getElementById(id); };

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function fillSelect(select) {
        var codes = Object.keys(data.governance.values);
        // Add any treaty jurisdictions WGI does not cover (e.g. Gibraltar)
        data.factors.ADQ.regimes.forEach(function (r) {
            r.held.concat(r.askers).forEach(function (c) { if (codes.indexOf(c) === -1) codes.push(c); });
        });
        codes.map(function (c) { return { code: c, name: countryName(c) }; })
            .sort(function (a, b) { return a.name.localeCompare(b.name); })
            .forEach(function (c) {
                var o = el('option', '', c.name);
                o.value = c.code;
                select.appendChild(o);
            });
    }

    function syncInputs() {
        if (!$('p-asker')) return;
        $('p-asker').value = state.asker;
        $('p-held').value = state.held;
        ['FVEY', 'CLOUD', 'ADQ', 'GOV'].forEach(function (id) {
            $('pw-' + id).value = weight(id);
        });
        $('pr-EI').value = state.r.EI;
        $('pr-SS').value = state.r.SS;
    }

    function render(r) {
        var body = $('persp-body');
        var empty = $('persp-empty');
        if (!r) {
            body.hidden = true;
            empty.hidden = false;
            return;
        }
        body.hidden = false;
        empty.hidden = true;
        var rounded = Math.round(r.score);
        $('p-score').textContent = rounded;
        var badge = $('p-level');
        badge.className = 'level-badge ' + r.level;
        badge.textContent = r.level.charAt(0).toUpperCase() + r.level.slice(1);
        $('p-who').textContent = 'Asking from: ' + countryName(state.asker) + ' · Data held in: ' + countryName(state.held);

        var list = $('p-factors');
        list.textContent = '';
        if (r.same) {
            list.appendChild(el('li', 'persp-none', 'Same jurisdiction: no cross-border factors apply, so the Perspective score equals the Base score unless you change the embargo and sanctions relevance.'));
        } else if (!r.factors.length) {
            list.appendChild(el('li', 'persp-none', 'No agreements, adequacy findings or governance gap apply between these two jurisdictions.'));
        }
        // Each factor, with its source, is itemised in the weight receipt below

        renderReceipt(r, rounded);
        $('p-changed').hidden = tokens().filter(function (t) { return /^[WR]:/.test(t); }).length === 0;
    }

    // ---------- Weight receipt ----------
    // Every number in the Perspective score, what kind of number it is, and
    // where it comes from.

    var KIND = {
        computed: 'Calculated',
        scored: 'Your scores',
        treaty: 'Treaty fact · GLARS default weight',
        measured: 'Measured · World Bank WGI',
        changed: 'Your change',
        judgement: 'Your judgement',
        rule: 'GLARS rule'
    };

    function receiptRow(list, label, value, kind, basis, source, total) {
        var li = el('li', total ? 'receipt-total' : '');
        var line = el('div', 'receipt-line');
        line.appendChild(el('span', 'receipt-label', label));
        line.appendChild(el('span', 'receipt-leader'));
        line.appendChild(el('span', 'receipt-value', value));
        li.appendChild(line);
        var note = el('p', 'receipt-note');
        if (kind) note.appendChild(el('span', 'receipt-kind receipt-kind-' + kind, KIND[kind]));
        if (basis) note.appendChild(document.createTextNode((kind ? ' · ' : '') + basis + ' '));
        if (source && /^https:\/\//.test(source.url)) {
            var a = el('a', '', 'Source');
            a.href = source.url;
            a.rel = 'noopener';
            a.title = source.label;
            note.appendChild(a);
        }
        li.appendChild(note);
        list.appendChild(li);
    }

    // Short basis for each factor; the factor list above has the full explanation
    function factorBasis(f) {
        var fx = data.factors;
        if (f.id === 'FVEY') return 'Both are Five Eyes members (' + fx.FVEY.members.join(', ') + ').';
        if (f.id === 'CLOUD') return f.detail.replace(/^.*In force since/, 'Agreement in force since');
        if (f.id === 'ADQ') return f.detail;
        if (f.id === 'GOV') return f.detail.replace(/ Average gap.*$/, '') + ' 1 + k × gap / 100, k = ' + f.k + '.';
        return f.detail;
    }

    function renderReceipt(r, rounded) {
        var list = $('p-receipt-body');
        list.textContent = '';
        var v = r.v;
        receiptRow(list, 'Base score', round2(r.base).toFixed(2), 'scored',
            'JO ' + v.JO + '×0.20 + AP ' + v.AP + '×0.25 + TR ' + v.TR + '×0.15 + EX ' + v.EX + '×0.25 + TP ' + v.TP + '×0.15.');

        r.factors.forEach(function (f) {
            var changed = (f.id in state.w) && state.w[f.id] !== data.factors[f.id].weight;
            var kind = changed ? 'changed' : (f.id === 'GOV' ? 'measured' : 'treaty');
            var basis = factorBasis(f);
            if (changed) basis = 'Default ' + data.factors[f.id].weight + (f.id === 'GOV' ? ' for k' : '') + '. ' + basis;
            receiptRow(list, '× ' + f.label, f.weight.toFixed(2), kind, basis, f.source);
        });

        receiptRow(list, '= Multiplier', round2(r.M).toFixed(2), 'rule',
            (r.clamped ? 'Factors multiply to ' + round2(r.product) + '; ' : '') + 'limited to ' + data.clamp[0] + '–' + data.clamp[1] + '.');
        receiptRow(list, 'Legal score', round2(r.legal).toFixed(2), 'computed', 'Base score × multiplier.');

        ['EI', 'SS'].forEach(function (k) {
            var rel = state.r[k];
            receiptRow(list, k === 'EI' ? 'Embargo Impact' : 'Sanction Severity', String(round2(k === 'EI' ? r.ei : r.ss)),
                rel !== 1 ? 'judgement' : 'scored',
                rel !== 1 ? 'Scored ' + v[k] + ' × ' + rel + ', how far it binds you.' : 'Scored ' + v[k] + ', counted in full.');
        });

        receiptRow(list, 'Perspective score', String(rounded), '',
            'Highest of the legal score, Embargo Impact and Sanction Severity' +
            (Math.max(r.legal, r.ei, r.ss) > 100 ? ', capped at 100' : ', rounded') + ': ' + r.level.charAt(0).toUpperCase() + r.level.slice(1) + '.', null, true);

        $('p-receipt-data').textContent = 'Inputs: perspective data v' + data.version + ' (' + data.updated + '); ' + data.governance.label + ', ' + data.governance.licence + '.';
    }

    function init() {
        if (!$('perspective')) return;
        fetch('/data/perspective.json')
            .then(function (res) {
                if (!res.ok) throw new Error('perspective data ' + res.status);
                return res.json();
            })
            .then(function (json) {
                data = json;
                fillSelect($('p-asker'));
                fillSelect($('p-held'));
                $('p-wgi').textContent = data.governance.label + ' (' + data.governance.licence + ')';
                $('p-wgi').href = data.governance.url;
                if (pending) {
                    var list = pending;
                    pending = null;
                    applyTokens(list);
                } else {
                    syncInputs();
                }
                $('perspective').hidden = false;
                onChange();
            })
            .catch(function () {
                $('perspective').hidden = true;
            });

        function changed() {
            onChange();
        }

        $('p-asker').addEventListener('change', function () { state.asker = this.value; changed(); });
        $('p-held').addEventListener('change', function () { state.held = this.value; changed(); });
        ['FVEY', 'CLOUD', 'ADQ', 'GOV'].forEach(function (id) {
            $('pw-' + id).addEventListener('input', function () {
                if (this.value === '') return;
                state.w[id] = clampWeight(parseFloat(this.value));
                changed();
            });
        });
        ['EI', 'SS'].forEach(function (k) {
            $('pr-' + k).addEventListener('input', function () {
                if (this.value === '') return;
                var n = parseFloat(this.value);
                state.r[k] = isFinite(n) ? Math.min(1, Math.max(0, round2(n))) : 1;
                changed();
            });
        });
        $('p-reset').addEventListener('click', function () {
            state.w = {};
            state.r = { EI: 1, SS: 1 };
            syncInputs();
            changed();
        });
    }

    window.GLARSPerspective = {
        // calculator.js calls this after every change to the Base inputs
        update: function (r, v) {
            lastResult = compute(r.base, v);
            if (data) render(lastResult);
            return lastResult;
        },
        clear: function () {
            if (data && $('persp-body')) render(null);
        },
        tokens: tokens,
        isToken: isToken,
        applyTokens: applyTokens,
        setOnChange: function (fn) { onChange = fn; },
        compute: compute
    };

    document.addEventListener('DOMContentLoaded', init);
})();
