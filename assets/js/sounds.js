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

    const CLICK_SOUND_PATH = './assets/sounds/click.mp3';
    const CLICK_BACK_SOUND_PATH = './assets/sounds/click-back.mp3';
    const VOLUME = 0.4;          // 0.0 – 1.0
    const STORAGE_KEY = 'sfx-muted';  // localStorage key for mute pref

    // Navigation / menu elements → click-back sound
    const NAV_BACK_SELECTORS = [
        '.leftSidebar .list .list-item a',
        '#rightSidebar .list .list-item a',
        '#navigationDivContainer .navigation ul li a',
        '#nav > ul > li > a',
        '#nav2 > ul > li > a',
        '.game-card',
        '.banner-zoom',                              
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
        '.ss-panel',
        '.ContactSocial',
        '.contact-socials a'
    ];

    /* ---------- Setup ---------- */

    const navBackSelector = NAV_BACK_SELECTORS.join(', ');
    const clickSelector = CLICK_SELECTORS.join(', ');

    const clickSfx = new Audio(CLICK_SOUND_PATH);
    const clickBackSfx = new Audio(CLICK_BACK_SOUND_PATH);

    clickSfx.preload = 'auto';
    clickBackSfx.preload = 'auto';
    clickSfx.volume = VOLUME;
    clickBackSfx.volume = VOLUME;

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
        const trigger = e.target.closest('.game-card, .back-to-home, [data-back-home], .banner-zoom');
        if (!trigger) return;

        // Resolve the link being clicked
        const link = trigger.tagName === 'A' ? trigger : trigger.querySelector('a[href]');
        if (!link) return;

        const href = link.getAttribute('href');
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
        mute: () => setMuted(true),
        unmute: () => setMuted(false),
        toggle: () => setMuted(!muted),
        isMuted: () => muted,
        playClick: () => play(clickSfx),
        playClickBack: () => play(clickBackSfx),
        rerollPad: () => initSkillChipPad()
    };
    /* =============================================================
       DJ Pad Mode — pitch-shifted clicks on skill chips
       ============================================================= */

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    let clickBuffer = null;       // decoded click sound, ready to be re-pitched
    let clickBufferLoading = null;

    // Lazily create the AudioContext on first user gesture (browsers require this)
    function getAudioContext() {
        if (!audioCtx && AudioCtx) {
            audioCtx = new AudioCtx();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Fetch + decode the click sound into an AudioBuffer (once)
    function loadClickBuffer() {
        if (clickBuffer) return Promise.resolve(clickBuffer);
        if (clickBufferLoading) return clickBufferLoading;

        const ctx = getAudioContext();
        if (!ctx) return Promise.reject(new Error('Web Audio not supported'));

        clickBufferLoading = fetch(CLICK_SOUND_PATH)
            .then(r => r.arrayBuffer())
            .then(buf => ctx.decodeAudioData(buf))
            .then(decoded => {
                clickBuffer = decoded;
                return decoded;
            })
            .catch(err => {
                clickBufferLoading = null;   // allow retry
                throw err;
            });

        return clickBufferLoading;
    }

    // Play the click sound at a given pitch offset (in semitones)
    function playPitched(semitones) {
        if (muted) return;

        const ctx = getAudioContext();
        if (!ctx) return;

        loadClickBuffer().then(buffer => {
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.detune.value = semitones * 100;   // semitones → cents

            const gain = ctx.createGain();
            gain.gain.value = VOLUME;

            source.connect(gain).connect(ctx.destination);
            source.start(0);
        }).catch(() => { /* fail silently */ });
    }

/* --- Pad pitch generation ---
       Each page load picks a random scale and a random starting octave,
       so the chips play a different little instrument every visit.
    --- */

    const SCALES = {
        majorPentatonic:   [0, 2, 4, 7, 9],
        minorPentatonic:   [0, 3, 5, 7, 10],
        bluesScale:        [0, 3, 5, 6, 7, 10],
        wholeTone:         [0, 2, 4, 6, 8, 10],
        lydian:            [0, 2, 4, 6, 7, 9, 11],
        dorian:            [0, 2, 3, 5, 7, 9, 10],
        japaneseHirajoshi: [0, 2, 3, 7, 8],
        arabicHijaz:       [0, 1, 4, 5, 7, 8, 11]
    };

    function buildPitchSet(scaleIntervals, length, rootOffset) {
        const pitches = [];
        for (let i = 0; i < length; i++) {
            const degree = i % scaleIntervals.length;
            const octave = Math.floor(i / scaleIntervals.length);
            pitches.push(rootOffset + scaleIntervals[degree] + octave * 12);
        }
        return pitches;
    }

    function generateRandomPitches(chipCount) {
        const scaleNames = Object.keys(SCALES);
        const scaleName  = scaleNames[Math.floor(Math.random() * scaleNames.length)];
        const scale      = SCALES[scaleName];
        const rootOffset = Math.floor(Math.random() * 11) - 5;   // -5 to +5
        console.log(`🎵 Pad mode: ${scaleName}, root ${rootOffset >= 0 ? '+' : ''}${rootOffset} semitones`);
        return buildPitchSet(scale, chipCount, rootOffset);
    }

    // Bind pitches to chips — picks a new random scale on each call
    function initSkillChipPad() {
        const chips = document.querySelectorAll('.skill-chip');
        if (!chips.length) return;

        const pitches = generateRandomPitches(chips.length);
        chips.forEach((chip, i) => {
            chip.dataset.padPitch = pitches[i];
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSkillChipPad);
    } else {
        initSkillChipPad();
    }

    // Click handler — intercept skill chips BEFORE the generic click sound fires
    document.addEventListener('click', function (e) {
        if (muted) return;
        const chip = e.target.closest('.skill-chip');
        if (!chip) return;

        const pitch = parseFloat(chip.dataset.padPitch);
        if (isNaN(pitch)) return;

        e.stopImmediatePropagation();   // suppress the generic click sound for this chip
        playPitched(pitch);
    }, true);   // capture phase — runs before the existing delegated click handler
})();

