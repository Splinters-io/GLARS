/* Apply a saved theme before first paint. Loaded synchronously in <head>.
   With no saved choice the stylesheet follows prefers-color-scheme. */
(function () {
    try {
        var saved = localStorage.getItem('glars-theme');
        if (saved === 'light' || saved === 'dark') {
            document.documentElement.setAttribute('data-theme', saved);
        }
    } catch (e) {
        /* Storage unavailable: fall back to the OS preference. */
    }
})();
