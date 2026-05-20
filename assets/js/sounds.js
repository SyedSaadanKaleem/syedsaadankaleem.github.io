/* =============================================================
   Click Sound Effects
   -----------------------------------------------------------
   Plays one of two sounds when interactive elements are clicked:
     • click-back  → navigation/menu items
     • click       → all other buttons, cards, links

   Add a selector to NAV_BACK_SELECTORS or CLICK_SELECTORS arrays
   to extend behavior to new elements. Anything not matched stays
   silent.
   ============================================================= */

(function () {
    'use strict';

    /* ---------- Config ---------- */

    const CLICK_SOUND_PATH      = './assets/sounds/click.mp3';
    const CLICK_BACK_SOUND_PATH = './assets/sounds/click-back.mp3';
    const VOLUME                = 0.4;          // 0.0 – 1.0
    const STORAGE_KEY           = 'sfx-muted';  // localStorage key for mute pref

    // Navigation / menu elements → click-back sound
    const NAV_BACK_SELECTORS = [
        '.leftSidebar .list .list-item a',
        '#rightSidebar .list .list-item a',
        '#navigationDivContainer .navigation ul li a',
        '#nav > ul > li > a',
        '#nav2 > ul > li > a',
        '.game-card',
        '#videoModal .modal-close',
        '.leftSidebar .logo-menu .toggle-btn'   // burger toggle
    ];

    // Everything else interactive → click sound
    const CLICK_SELECTORS = [
        'button',
        '.button',
        'input[type="button"]',
        'input[type="submit"]',
        'input[type="reset"]',
        '.skill-chip',
        '.ss-panel',
        '.ContactSocial',
        '.contact-socials a'
    ];

    /* ---------- Setup ---------- */

    const navBackSelector = NAV_BACK_SELECTORS.join(', ');
    const clickSelector   = CLICK_SELECTORS.join(', ');

    const clickSfx     = new Audio(CLICK_SOUND_PATH);
    const clickBackSfx = new Audio(CLICK_BACK_SOUND_PATH);

    clickSfx.preload     = 'auto';
    clickBackSfx.preload = 'auto';
    clickSfx.volume      = VOLUME;
    clickBackSfx.volume  = VOLUME;

    // Restore mute preference from a previous visit
    let muted = false;
    try {
        muted = localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (e) {
        /* localStorage may be blocked (private mode / sandboxed) — ignore */
    }

    /* ---------- Helpers ---------- */

    function play(audio) {
        if (muted || !audio) return;

        // Reset so rapid clicks always play, instead of being skipped because
        // the element is "already playing"
        try {
            audio.currentTime = 0;
        } catch (e) { /* some browsers throw before metadata loads */ }

        audio.play().catch(() => {
            /* Browsers block audio until the first user gesture.
               After the first real click, subsequent plays will work. */
        });
    }

    function setMuted(value) {
        muted = !!value;
        try {
            localStorage.setItem(STORAGE_KEY, muted ? 'true' : 'false');
        } catch (e) { /* ignore */ }

        // Update any UI toggle that exists
        document.querySelectorAll('[data-sfx-toggle]').forEach(el => {
            el.setAttribute('aria-pressed', muted ? 'true' : 'false');
            el.classList.toggle('is-muted', muted);
        });
    }

    /* ---------- Click delegation ---------- */

    // Capture phase so we fire before any handler that calls stopPropagation()
    document.addEventListener('click', function (e) {
        if (muted) return;

        const target = e.target;
        if (!target || !target.closest) return;

        // Nav-back wins if both match
        if (target.closest(navBackSelector)) {
            play(clickBackSfx);
            return;
        }
        if (target.closest(clickSelector)) {
            play(clickSfx);
        }
    }, true);
/* ---------- Delay internal navigation until sound finishes (game cards + back-to-home) ---------- */

const NAV_DELAY_MS = 180;

document.addEventListener('click', function (e) {
    if (muted) return;

    // Match game cards OR back-to-home buttons
    const trigger = e.target.closest('.game-card, .back-to-home, [data-back-home]');
    if (!trigger) return;

    // Resolve the link being clicked
    const link = trigger.tagName === 'A' ? trigger : trigger.querySelector('a[href]');
    if (!link) return;

    const href   = link.getAttribute('href');
    const target = link.getAttribute('target');

    if (!href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        target === '_blank' ||
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
    }

    let url;
    try {
        url = new URL(href, window.location.href);
    } catch (err) {
        return;
    }
    if (url.origin !== window.location.origin) return;

    e.preventDefault();
    setTimeout(() => { window.location.href = url.href; }, NAV_DELAY_MS);
}, true);
    /* ---------- Optional mute toggle ----------
       Add an element with [data-sfx-toggle] anywhere in your HTML
       and clicking it will mute/unmute. Example:

         <button data-sfx-toggle aria-label="Toggle sound">🔊</button>

       Toggle gets `aria-pressed="true"` and class `is-muted` when muted,
       so you can style the two states however you want.
    ------------------------------------------------ */

    document.addEventListener('click', function (e) {
        const toggle = e.target.closest && e.target.closest('[data-sfx-toggle]');
        if (!toggle) return;
        e.preventDefault();
        setMuted(!muted);
    });

    // Sync initial UI state once DOM is ready
    function syncToggles() {
        document.querySelectorAll('[data-sfx-toggle]').forEach(el => {
            el.setAttribute('aria-pressed', muted ? 'true' : 'false');
            el.classList.toggle('is-muted', muted);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncToggles);
    } else {
        syncToggles();
    }

    /* ---------- Expose tiny API for debugging / external control ---------- */

    window.SFX = {
        mute:      () => setMuted(true),
        unmute:    () => setMuted(false),
        toggle:    () => setMuted(!muted),
        isMuted:   () => muted,
        playClick:     () => play(clickSfx),
        playClickBack: () => play(clickBackSfx)
    };

})();