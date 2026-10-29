/**
 * GLARS journey map
 * Follows one record through time, stage by stage, and shows which legal
 * powers can reach it at each point. Data comes from /data/journey.json.
 * The chart is ordinary HTML (stages and buttons); an SVG overlay draws the
 * timeline, the branches to each power and the links between powers,
 * measured from where the elements actually sit, so it works at any width.
 */

document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('follow-the-data');
    if (!root) return;

    var chart = root.querySelector('.flow-chart');
    var svg = root.querySelector('.flow-lines');
    var stageList = root.querySelector('.flow-stages');
    var filters = root.querySelector('.flow-filters');
    var summary = root.querySelector('.flow-summary');
    var evidence = root.querySelector('.flow-evidence');
    var SVG_NS = 'http://www.w3.org/2000/svg';

    var data = null;
    var byId = {};
    var links = [];
    var selected = null;   // { type: 'power' | 'stage', id }
    var preview = null;    // hover or focus, shown until the pointer leaves
    var filter = { level: 'All', where: 'All' };

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function safeUrl(url) {
        return /^https:\/\//.test(url) || /^\/(?!\/)/.test(url) ? url : null;
    }

    // ---------- Data ----------

    function prepare(json) {
        data = json;
        data.powers.forEach(function (p) { byId[p.id] = p; });
        var seen = {};
        data.powers.forEach(function (p) {
            (p.links || []).forEach(function (other) {
                if (!byId[other]) return;
                var key = [p.id, other].sort().join('|');
                if (seen[key]) return;
                seen[key] = true;
                links.push({ a: p.id, b: other });
            });
        });
    }

    function linkedTo(id) {
        return links.reduce(function (out, l) {
            if (l.a === id) out.push(l.b);
            if (l.b === id) out.push(l.a);
            return out;
        }, []);
    }

    function stageOf(id) {
        return data.stages.filter(function (s) { return s.id === id; })[0];
    }

    function matchesFilter(p) {
        var levelOk = filter.level === 'All' || p.level === filter.level;
        var whereOk = filter.where === 'All' || p.where.indexOf(filter.where) !== -1;
        return levelOk && whereOk;
    }

    // ---------- Building the chart ----------

    function buildFilters() {
        var levels = ['All', 'High', 'Medium'];
        var places = ['All', 'UK', 'US', 'IN'];

        function group(label, key, values, count) {
            var wrap = el('div', 'flow-filter');
            wrap.setAttribute('role', 'group');
            wrap.setAttribute('aria-label', label);
            wrap.appendChild(el('span', 'flow-filter-label', label));
            values.forEach(function (v) {
                var b = el('button', 'flow-chip');
                b.type = 'button';
                b.dataset.key = key;
                b.dataset.value = v;
                b.setAttribute('aria-pressed', String(filter[key] === v));
                b.appendChild(el('span', '', v === 'All' ? 'All' : v));
                b.appendChild(el('span', 'flow-chip-count', String(count(v))));
                wrap.appendChild(b);
            });
            filters.appendChild(wrap);
        }

        group('Impact', 'level', levels, function (v) {
            return data.powers.filter(function (p) { return v === 'All' || p.level === v; }).length;
        });
        group('Jurisdiction', 'where', places, function (v) {
            return data.powers.filter(function (p) { return v === 'All' || p.where.indexOf(v) !== -1; }).length;
        });
    }

    function buildStages() {
        data.stages.forEach(function (s, i) {
            var li = el('li', 'flow-stage');
            li.dataset.stage = s.id;

            var head = el('button', 'flow-stage-head');
            head.type = 'button';
            head.dataset.type = 'stage';
            head.dataset.id = s.id;
            head.appendChild(el('span', 'flow-dot flow-dot-stage'));
            head.appendChild(el('span', 'flow-when', String(i + 1).padStart(2, '0') + ' · ' + s.when));
            head.appendChild(el('span', 'flow-stage-title', s.title));
            head.appendChild(el('span', 'flow-where', s.where.join(' · ')));
            li.appendChild(head);

            var ul = el('ul', 'flow-powers');
            data.powers.filter(function (p) { return p.stage === s.id; }).forEach(function (p) {
                var item = el('li');
                var b = el('button', 'flow-node');
                b.type = 'button';
                b.dataset.type = 'power';
                b.dataset.id = p.id;
                b.dataset.level = p.level.toLowerCase();
                b.appendChild(el('span', 'flow-dot'));
                b.appendChild(el('span', 'flow-node-name', p.name));
                b.appendChild(el('span', 'flow-node-sub', p.where + ' · ' + p.level + ' · ' + p.kind));
                item.appendChild(b);
                ul.appendChild(item);
            });
            li.appendChild(ul);
            stageList.appendChild(li);
        });
    }

    // ---------- Drawing ----------

    function centreOf(node, box) {
        var r = node.getBoundingClientRect();
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
    }

    function addPath(d, className, attrs) {
        var path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', d);
        path.setAttribute('class', className);
        Object.keys(attrs || {}).forEach(function (k) { path.setAttribute(k, attrs[k]); });
        svg.appendChild(path);
        return path;
    }

    function isRow() {
        var stages = stageList.children;
        return stages.length > 1 &&
            Math.abs(stages[0].getBoundingClientRect().top - stages[1].getBoundingClientRect().top) < 4;
    }

    function draw() {
        var box = chart.getBoundingClientRect();
        svg.setAttribute('width', box.width);
        svg.setAttribute('height', box.height);
        svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
        while (svg.firstChild) svg.removeChild(svg.firstChild);

        var row = isRow();
        var stageDots = Array.prototype.map.call(stageList.querySelectorAll('.flow-dot-stage'), function (d) {
            return centreOf(d, box);
        });

        // The timeline: one line through every stage, in order.
        var axis = stageDots.map(function (p, i) { return (i ? 'L' : 'M') + p.x + ' ' + p.y; }).join(' ');
        if (axis) addPath(axis, 'flow-axis');
        if (row && stageDots.length) {
            var last = stageDots[stageDots.length - 1];
            var end = box.width - 2;
            addPath('M' + last.x + ' ' + last.y + ' L' + end + ' ' + last.y, 'flow-axis');
            addPath('M' + (end - 6) + ' ' + (last.y - 4) + ' L' + end + ' ' + last.y + ' L' + (end - 6) + ' ' + (last.y + 4), 'flow-axis');
        }

        // Branches from each stage to the powers that apply at that point.
        Array.prototype.forEach.call(stageList.children, function (li, i) {
            var from = stageDots[i];
            li.querySelectorAll('.flow-node').forEach(function (node) {
                var to = centreOf(node.querySelector('.flow-dot'), box);
                var bend = (to.y - from.y) * 0.55;
                addPath('M' + from.x + ' ' + from.y + ' C' + from.x + ' ' + (from.y + bend) + ' ' +
                    (to.x - 14) + ' ' + to.y + ' ' + to.x + ' ' + to.y,
                    'flow-branch', { 'data-stage': li.dataset.stage, 'data-power': node.dataset.id });
            });
        });

        // Links between powers in different stages. Left out on narrow
        // screens, where the evidence panel lists them instead.
        if (row) {
            links.forEach(function (l) {
                var a = stageList.querySelector('.flow-node[data-id="' + l.a + '"]');
                var b = stageList.querySelector('.flow-node[data-id="' + l.b + '"]');
                if (!a || !b) return;
                var ra = a.getBoundingClientRect();
                var rb = b.getBoundingClientRect();
                if (rb.left < ra.left) { var t = a; a = b; b = t; var tr = ra; ra = rb; rb = tr; }
                var start = { x: ra.right - box.left - 4, y: centreOf(a.querySelector('.flow-dot'), box).y };
                var finish = centreOf(b.querySelector('.flow-dot'), box);
                var dx = Math.max(24, (finish.x - start.x) / 2);
                addPath('M' + start.x + ' ' + start.y + ' C' + (start.x + dx) + ' ' + start.y + ' ' +
                    (finish.x - dx) + ' ' + finish.y + ' ' + finish.x + ' ' + finish.y,
                    'flow-link', { 'data-a': l.a, 'data-b': l.b });
            });
        }

        applyState();
    }

    // ---------- State ----------

    function focusSet(target) {
        // Which powers and stages count as "on the path" for a selection.
        var powers = {};
        var stages = {};
        if (!target) return null;
        if (target.type === 'stage') {
            stages[target.id] = true;
            data.powers.forEach(function (p) { if (p.stage === target.id) powers[p.id] = true; });
        } else {
            powers[target.id] = true;
            stages[byId[target.id].stage] = true;
            linkedTo(target.id).forEach(function (id) { powers[id] = true; });
        }
        return { powers: powers, stages: stages, target: target };
    }

    function applyState() {
        var active = focusSet(preview || selected);

        stageList.querySelectorAll('.flow-node').forEach(function (node) {
            var p = byId[node.dataset.id];
            node.classList.toggle('is-dim', !matchesFilter(p));
            node.classList.toggle('is-on', !!(active && active.powers[p.id]));
            node.setAttribute('aria-pressed', String(!!(selected && selected.type === 'power' && selected.id === p.id)));
        });
        stageList.querySelectorAll('.flow-stage-head').forEach(function (head) {
            head.classList.toggle('is-on', !!(active && active.stages[head.dataset.id]));
            head.setAttribute('aria-pressed', String(!!(selected && selected.type === 'stage' && selected.id === head.dataset.id)));
        });
        svg.querySelectorAll('.flow-branch').forEach(function (path) {
            var p = byId[path.dataset.power];
            var on = active && (active.target.type === 'stage'
                ? active.stages[path.dataset.stage]
                : active.target.id === p.id);
            path.classList.toggle('is-on', !!on);
            path.classList.toggle('is-dim', !matchesFilter(p));
        });
        svg.querySelectorAll('.flow-link').forEach(function (path) {
            var on = active && active.target.type === 'power' &&
                (path.dataset.a === active.target.id || path.dataset.b === active.target.id);
            path.classList.toggle('is-on', !!on);
            path.classList.toggle('is-dim', !matchesFilter(byId[path.dataset.a]) || !matchesFilter(byId[path.dataset.b]));
        });
        // Draw highlighted lines last so they sit on top.
        svg.querySelectorAll('.is-on').forEach(function (path) { svg.appendChild(path); });

        filters.querySelectorAll('.flow-chip').forEach(function (b) {
            b.setAttribute('aria-pressed', String(filter[b.dataset.key] === b.dataset.value));
        });
    }

    function select(target) {
        selected = target;
        preview = null;
        applyState();
        renderEvidence();
    }

    // ---------- Summary and evidence ----------

    function renderSummary() {
        var visible = data.powers.filter(matchesFilter);
        var high = visible.filter(function (p) { return p.level === 'High'; }).length;
        var text = visible.length + ' of ' + data.powers.length + ' powers shown across ' + data.stages.length +
            ' stages. ' + high + ' are High impact. ';
        text += 'A record stored in India is still within UK and US reach, because the operator and the networks it crosses are.';
        summary.textContent = text;
    }

    function componentList(codes) {
        var p = el('p', 'flow-evidence-row');
        p.appendChild(el('strong', '', 'Feeds the score through: '));
        if (!codes.length) {
            p.appendChild(document.createTextNode('none directly. This affects the data without counting towards the core score.'));
            return p;
        }
        codes.forEach(function (c, i) {
            if (i) p.appendChild(document.createTextNode(', '));
            var code = el('span', 'calc-code', c);
            p.appendChild(code);
            p.appendChild(document.createTextNode(' ' + data.components[c]));
        });
        return p;
    }

    function chooser(ids, label) {
        var p = el('p', 'flow-evidence-row');
        p.appendChild(el('strong', '', label));
        var wrap = el('span', 'flow-jump');
        ids.forEach(function (id) {
            var b = el('button', 'flow-jump-button', byId[id].name);
            b.type = 'button';
            b.dataset.type = 'power';
            b.dataset.id = id;
            wrap.appendChild(b);
        });
        p.appendChild(wrap);
        return p;
    }

    function renderEvidence() {
        evidence.textContent = '';
        if (!selected) {
            evidence.appendChild(el('p', 'flow-evidence-empty', 'Choose any stage or power to see what it allows and why it matters at that point.'));
            return;
        }

        var card = el('article', 'flow-card');
        if (selected.type === 'stage') {
            var s = stageOf(selected.id);
            var index = data.stages.indexOf(s);
            var head = el('div', 'flow-card-head');
            head.appendChild(el('h3', '', s.title));
            head.appendChild(el('span', 'flow-card-tag', s.where.join(' · ')));
            card.appendChild(head);
            card.appendChild(el('p', 'flow-card-meta', 'Stage ' + (index + 1) + ' of ' + data.stages.length + ' · ' + s.when));
            card.appendChild(el('p', '', s.summary));
            var ids = data.powers.filter(function (p) { return p.stage === s.id; }).map(function (p) { return p.id; });
            if (ids.length) card.appendChild(chooser(ids, 'Powers at this stage: '));
        } else {
            var p = byId[selected.id];
            var st = stageOf(p.stage);
            var top = el('div', 'flow-card-head');
            top.appendChild(el('h3', '', p.name));
            top.appendChild(el('span', 'risk-badge risk-badge-' + p.level.toLowerCase(), p.level));
            card.appendChild(top);
            card.appendChild(el('p', 'flow-card-meta', p.where + ' · ' + p.kind + ' · Stage ' +
                (data.stages.indexOf(st) + 1) + ', ' + st.when.toLowerCase()));

            var allows = el('p', 'flow-evidence-row');
            allows.appendChild(el('strong', '', 'What it allows. '));
            allows.appendChild(document.createTextNode(p.allows));
            card.appendChild(allows);

            var here = el('p', 'flow-evidence-row');
            here.appendChild(el('strong', '', 'Why it matters here. '));
            here.appendChild(document.createTextNode(p.here));
            card.appendChild(here);

            card.appendChild(componentList(p.components || []));

            var linked = linkedTo(p.id);
            if (linked.length) card.appendChild(chooser(linked, 'Connects to: '));

            var sources = (p.sources || []).filter(function (src) { return safeUrl(src.url); });
            if (sources.length) {
                var list = el('ul', 'flow-sources');
                sources.forEach(function (src) {
                    var li = el('li');
                    var a = el('a', '', src.label);
                    a.href = safeUrl(src.url);
                    a.rel = 'noopener';
                    li.appendChild(a);
                    list.appendChild(li);
                });
                var label = el('p', 'flow-sources-label', 'Sources');
                card.appendChild(label);
                card.appendChild(list);
            }
        }
        evidence.appendChild(card);
    }

    // ---------- Events ----------

    function targetFrom(e) {
        var b = e.target.closest('[data-type][data-id]');
        return b ? { type: b.dataset.type, id: b.dataset.id } : null;
    }

    root.addEventListener('click', function (e) {
        var chip = e.target.closest('.flow-chip');
        if (chip) {
            filter[chip.dataset.key] = chip.dataset.value;
            applyState();
            renderSummary();
            return;
        }
        var t = targetFrom(e);
        if (!t) return;
        var same = selected && selected.type === t.type && selected.id === t.id;
        select(same && !e.target.closest('.flow-evidence') ? null : t);
        if (e.target.closest('.flow-evidence')) {
            var node = stageList.querySelector('[data-id="' + t.id + '"]');
            if (node) node.focus({ preventScroll: true });
        }
    });

    stageList.addEventListener('mouseover', function (e) {
        var t = targetFrom(e);
        if (!t || (preview && preview.id === t.id)) return;
        preview = t;
        applyState();
    });

    stageList.addEventListener('mouseleave', function () {
        preview = null;
        applyState();
    });

    // ---------- Start ----------

    fetch('/data/journey.json')
        .then(function (res) {
            if (!res.ok) throw new Error('journey data ' + res.status);
            return res.json();
        })
        .then(function (json) {
            prepare(json);
            buildFilters();
            buildStages();
            root.hidden = false;
            selected = { type: 'power', id: 'corporate' };
            renderSummary();
            renderEvidence();
            draw();
            if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
            if ('ResizeObserver' in window) {
                var frame = null;
                new ResizeObserver(function () {
                    cancelAnimationFrame(frame);
                    frame = requestAnimationFrame(draw);
                }).observe(chart);
            } else {
                window.addEventListener('resize', draw);
            }
        })
        .catch(function () {
            // The jurisdiction-by-jurisdiction detail below still covers everything.
            root.hidden = true;
        });
});
