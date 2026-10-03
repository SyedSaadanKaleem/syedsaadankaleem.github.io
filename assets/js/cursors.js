/* Custom cursor: a dot that follows the pointer, pulses over interactive targets,
   and rings on click. Positioning uses left/top on purpose: the .ring keyframes
   animate this element's own transform, so a transform-based follow would be
   overridden for the duration of every ring. The element is out-of-flow and
   30px, so the per-move layout is trivial.

   CLIENT coordinates, and .cursor is position: fixed (see main.css). It used to
   be absolute in page coordinates, which meant scrolling moved it and a scroll
   handler had to put it back - on an rAF, so for a frame or more the dot and the
   trail both rendered a scroll-delta behind the page. Measured mid-scroll: the
   page at y=3028 while the dot still sat at 2418 and the tail was 100px adrift.
   Fixed positioning makes scroll a non-event: nothing has to chase it. */
(function () {
  var cursor = document.querySelector('.cursor');
  if (!cursor) return;

  window.addEventListener('mousemove', function (e) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  }, { passive: true });

  document.addEventListener('mouseenter', function () { cursor.style.display = 'block'; });
  document.addEventListener('mouseleave', function () {
    cursor.style.display = 'none';
    cursor.classList.remove('press');   // a button released outside the window never fires mouseup here
  });

  // Press feedback on mousedown, the ring on release, so the two halves of a
  // click read as one gesture: the dot reacts under the finger immediately,
  // the ring is the system answering back.
  document.addEventListener('mousedown', function () { cursor.classList.add('press'); }, { passive: true });
  document.addEventListener('mouseup', function () { cursor.classList.remove('press'); }, { passive: true });

  // Click ring: one shot per click, re-triggerable. Held 500ms, which outlasts
  // the 480ms cursorRing in main.css so the ring completes instead of being
  // yanked mid-flight the way main pulls it at 300ms against 500ms of keyframes.
  // A timeout rather than animationend, so the class still clears when reduced
  // motion turns the animation off.
  var ringT = null;
  window.addEventListener('click', function () {
    if (cursor.classList.contains('ring')) {
      cursor.classList.remove('ring');
      void cursor.offsetWidth; // restart the keyframes for rapid clicks
    }
    cursor.classList.add('ring');
    clearTimeout(ringT);
    ringT = setTimeout(function () { cursor.classList.remove('ring'); }, 500);
  });

  // Hover pulse: CSS loops it; JS only marks presence over an interactive target.
  // Delegated so links/buttons added after load (e.g. the slider's game cards) get it too.
  var HOVER_TARGETS = 'a, button, .toggle-btn, input[type="submit"], input[type="reset"], input[type="button"], .cert-card, .venture-card:has(a[href]), .video-banner';
  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(HOVER_TARGETS)) cursor.classList.add('hover');
  });
  document.addEventListener('mouseout', function (e) {
    var el = e.target.closest(HOVER_TARGETS);
    if (el && !el.contains(e.relatedTarget)) cursor.classList.remove('hover');
  });
  // Scrolling moves the page under a still pointer, and no mouseover/mouseout
  // fires for it - so the pulse stayed on over whatever the pointer had LEFT.
  // As the page scrolls, ask what is under the pointer now.
  var px = -1, py = -1, checkQueued = false;
  window.addEventListener('mousemove', function (e) { px = e.clientX; py = e.clientY; }, { passive: true });
  window.addEventListener('scroll', function () {
    if (checkQueued || px < 0) return;
    checkQueued = true;
    requestAnimationFrame(function () {
      checkQueued = false;
      var under = document.elementFromPoint(px, py);
      cursor.classList.toggle('hover', !!(under && under.closest(HOVER_TARGETS)));
    });
  }, { passive: true });
  /* Trail. The 22 empty divs inside .cursor have been in the markup from the
     start; the loop meant to drive them reads an undeclared `currenty` and
     throws on its first frame, so not one of them has ever been positioned.
     Nineteen become a chained comet here - each link eases toward the one ahead
     of it rather than toward the pointer, which is what makes the tail bend
     through a curve instead of smearing in a straight line. The last three stay
     reserved for the two pulse emitters and the click ring.

     This is the one part of the cursor that cannot be CSS: the positions come
     out of pointer history, so there are no predetermined keyframes to write.
     It is therefore rAF, but ONE loop for all nineteen rather than the twenty-two
     the original started, transform-only so nothing touches layout, and it
     switches itself off as soon as the pointer is still and every link has
     caught up. */
  var coarse = window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!coarse && !reduce) {
    var LINKS = 19;
    var FOLLOW = 0.36;            // per-link easing; higher = shorter, snappier tail
    var trail = [];

    for (var i = 0; i < LINKS && i < cursor.children.length; i++) {
      var k = i / (LINKS - 1);
      var el = cursor.children[i];
      // Accent red at the head, cooling to black down the tail, like an ember.
      // The tail keeps a real opacity rather than fading to nothing, because
      // black only reads as black where there is something behind it - over the
      // hero artwork it registers, over the flat near-black sections it is the
      // background, which is its own kind of fade-out.
      el.style.backgroundColor =
        'rgb(' + Math.round(238 - 238 * k) + ',' + Math.round(43 - 43 * k) + ',' + Math.round(43 - 43 * k) + ')';
      el.style.opacity = (0.62 * (1 - k) + 0.22).toFixed(3);
      trail.push({ el: el, x: 0, y: 0, s: (1 - 0.72 * k).toFixed(3) });
    }

    var pointerX = 0, pointerY = 0, seeded = false, running = false;

    function step() {
      // Each link is drawn as an offset from .cursor, which is itself parked on
      // the pointer, so the pointer position IS the origin. Same client space as
      // the dot, so the two cannot drift apart.
      var cx = pointerX;
      var cy = pointerY;
      var tx = pointerX, ty = pointerY, moving = false;

      for (var i = 0; i < trail.length; i++) {
        var t = trail[i];
        var dx = tx - t.x, dy = ty - t.y;
        if (dx > 0.1 || dx < -0.1 || dy > 0.1 || dy < -0.1) moving = true;
        t.x += dx * FOLLOW;
        t.y += dy * FOLLOW;
        t.el.style.transform =
          'translate3d(' + (t.x - cx).toFixed(2) + 'px,' + (t.y - cy).toFixed(2) + 'px,0) scale(' + t.s + ')';
        tx = t.x; ty = t.y;
      }

      if (moving) requestAnimationFrame(step);
      else running = false;
    }

    function wake() {
      if (running) return;
      running = true;
      requestAnimationFrame(step);
    }

    window.addEventListener('mousemove', function (e) {
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (!seeded) {   // start collapsed on the pointer, not flying in from 0,0
        seeded = true;
        for (var i = 0; i < trail.length; i++) { trail[i].x = pointerX; trail[i].y = pointerY; }
      }
      wake();
    }, { passive: true });

    // No scroll handling at all. In client space a scroll does not move the
    // pointer, the dot or the links, so there is nothing to correct and nothing
    // that can fall behind - which also means the trail no longer fires on
    // scroll, only on actual pointer movement.
  }

})();
