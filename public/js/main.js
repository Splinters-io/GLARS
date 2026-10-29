/**
 * GLARS UI
 * Theme toggle and table-of-contents scroll tracking.
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
});
