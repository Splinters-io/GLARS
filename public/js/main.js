/**
 * GLARS UI
 * Theme toggle, table-of-contents scroll tracking, and the hover note on
 * links to Juri (juri.host), which open in a new window.
 */

document.addEventListener('DOMContentLoaded', function () {
    var root = document.documentElement;
    var themeToggle = document.getElementById('theme-toggle');

    function currentTheme() {
        var explicit = root.getAttribute('data-theme');
        if (explicit) return explicit;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var next = currentTheme() === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try {
                localStorage.setItem('glars-theme', next);
            } catch (e) {
                /* Preference just won't persist. */
            }
        });
    }

    // Highlight the TOC entry for the section currently in view
    var tocLinks = document.querySelectorAll('.toc a[href^="#"]');
    if (tocLinks.length && 'IntersectionObserver' in window) {
        var linkFor = {};
        tocLinks.forEach(function (link) {
            linkFor[link.getAttribute('href').slice(1)] = link;
        });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var link = linkFor[entry.target.id];
                if (!link) return;
                tocLinks.forEach(function (l) { l.classList.remove('active'); });
                link.classList.add('active');
            });
        }, { rootMargin: '0px 0px -70% 0px' });

        Object.keys(linkFor).forEach(function (id) {
            var section = document.getElementById(id);
            if (section) observer.observe(section);
        });
    }

    // Juri links: a short note on hover or keyboard focus, read by screen
    // readers as the link's description. Escape or moving away closes it,
    // and the pointer can move onto the note without it disappearing.
    var juriLinks = document.querySelectorAll('a.juri-link');
    if (juriLinks.length) {
        var tip = document.createElement('div');
        tip.id = 'juri-tip';
        tip.className = 'juri-tip';
        tip.setAttribute('role', 'tooltip');
        tip.hidden = true;
        var tipTitle = document.createElement('strong');
        tipTitle.textContent = 'Juri · juri.host';
        var tipText = document.createElement('span');
        tipText.textContent = 'Applies GLARS to real infrastructure. Enter a domain or IP address, or a list of them, and Juri finds the hosting, CDN, corporate and TLD jurisdictions, with results you can export.';
        var tipNote = document.createElement('small');
        tipNote.textContent = 'A separate site. Opens in a new window.';
        tip.appendChild(tipTitle);
        tip.appendChild(tipText);
        tip.appendChild(tipNote);
        document.body.appendChild(tip);

        var hideTimer = null;
        var tipFor = null;

        function placeTip(link) {
            var r = link.getBoundingClientRect();
            var margin = 16;
            tip.style.maxWidth = Math.min(320, window.innerWidth - margin * 2) + 'px';
            var w = tip.offsetWidth;
            var h = tip.offsetHeight;
            var left = Math.min(Math.max(margin, r.left), window.innerWidth - w - margin);
            var top = r.bottom + 8;
            if (top + h > window.innerHeight - margin && r.top - h - 8 > margin) top = r.top - h - 8;
            tip.style.left = left + 'px';
            tip.style.top = top + 'px';
        }

        function showTip(link) {
            clearTimeout(hideTimer);
            tipFor = link;
            tip.hidden = false;
            placeTip(link);
        }

        function hideTip(delay) {
            clearTimeout(hideTimer);
            hideTimer = setTimeout(function () { tip.hidden = true; }, delay || 0);
        }

        juriLinks.forEach(function (link) {
            link.setAttribute('aria-describedby', 'juri-tip');
            link.addEventListener('mouseenter', function () { showTip(link); });
            link.addEventListener('mouseleave', function () { hideTip(150); });
            link.addEventListener('focus', function () { showTip(link); });
            link.addEventListener('blur', function () { hideTip(); });
        });
        tip.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
        tip.addEventListener('mouseleave', function () { hideTip(150); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') hideTip();
        });
        window.addEventListener('scroll', function () {
            if (!tip.hidden && tipFor) placeTip(tipFor);
        }, { passive: true });
    }
});
