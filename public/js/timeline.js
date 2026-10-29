/**
 * Journey timeline: follow a power's path.
 * Pointing at, tapping or tabbing to a power dims and slightly blurs
 * everything that is not on its path, and outlines the powers that are.
 * A tap pins the path until you tap again, tap elsewhere or press Escape.
 * Without this script the timeline is fully readable, just not highlighted.
 */

document.addEventListener('DOMContentLoaded', function () {
    var list = document.querySelector('.tl-stages');
    if (!list) return;

    var powers = Array.prototype.slice.call(list.querySelectorAll('.tl-power[data-path]'));
    var stages = Array.prototype.slice.call(list.querySelectorAll('.tl-stage'));
    var pinned = null;
    var hovered = null;

    function show(power) {
        if (!power) {
            list.classList.remove('has-path');
            powers.forEach(function (p) { p.classList.remove('is-path', 'is-origin'); });
            stages.forEach(function (s) { s.classList.remove('is-path'); });
            return;
        }
        var ids = power.getAttribute('data-path').split(' ');
        list.classList.add('has-path');
        powers.forEach(function (p) {
            p.classList.toggle('is-path', ids.indexOf(p.id.replace('power-', '')) !== -1);
            p.classList.toggle('is-origin', p === power);
        });
        stages.forEach(function (s) {
            s.classList.toggle('is-path', !!s.querySelector('.tl-power.is-path'));
        });
    }

    function refresh() {
        show(pinned || hovered);
    }

    powers.forEach(function (p) {
        p.addEventListener('pointerenter', function () { hovered = p; refresh(); });
        p.addEventListener('pointerleave', function () { if (hovered === p) hovered = null; refresh(); });
        p.addEventListener('focus', function () { hovered = p; refresh(); });
        p.addEventListener('blur', function () { if (hovered === p) hovered = null; refresh(); });
        p.addEventListener('click', function (e) {
            if (e.target.closest('a')) return; // source references still work as links
            pinned = pinned === p ? null : p;
            refresh();
        });
        p.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                pinned = pinned === p ? null : p;
                refresh();
            }
        });
    });

    document.addEventListener('click', function (e) {
        if (pinned && !e.target.closest('.tl-power')) {
            pinned = null;
            refresh();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && (pinned || hovered)) {
            pinned = null;
            hovered = null;
            refresh();
        }
    });
});
