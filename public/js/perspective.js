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
        r.factors.forEach(function (f) {
            var li = el('li');
            var head = el('div', 'persp-factor-head');
            head.appendChild(el('strong', '', f.label));
            head.appendChild(el('span', 'persp-mult' + (f.weight > 1 ? ' up' : f.weight < 1 ? ' down' : ''), '×' + f.weight.toFixed(2)));
            li.appendChild(head);
            li.appendChild(el('p', '', f.detail));
            if (f.source && /^https:\/\//.test(f.source.url)) {
                var a = el('a', '', f.source.label);
                a.href = f.source.url;
                a.rel = 'noopener';
                var p = el('p', 'persp-source');
                p.appendChild(document.createTextNode('Source: '));
                p.appendChild(a);
                li.appendChild(p);
            }
            list.appendChild(li);
        });

        var lines = [];
        lines.push('M      = ' + (r.factors.length ? r.factors.map(function (f) { return f.weight.toFixed(2); }).join(' × ') : '1') +
            ' = ' + round2(r.product) + (r.clamped ? ', limited to ' + round2(r.M) : ''));
        lines.push('Legal  = Base × M = ' + round2(r.legal));
        lines.push('EI     = ' + round2(r.ei) + (state.r.EI !== 1 ? ' (relevance ' + state.r.EI + ')' : ''));
        lines.push('SS     = ' + round2(r.ss) + (state.r.SS !== 1 ? ' (relevance ' + state.r.SS + ')' : ''));
        lines.push('GLARS-P = max(Legal, EI, SS) = ' + rounded);
        $('p-working').textContent = lines.join('\n');
        $('p-changed').hidden = tokens().filter(function (t) { return /^[WR]:/.test(t); }).length === 0;
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
