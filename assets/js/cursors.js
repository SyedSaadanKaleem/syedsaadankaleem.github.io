/* Custom cursor: a dot that follows the pointer, pulses over interactive targets,
   and rings on click. Positioning uses left/top on purpose: the .ring keyframes
   animate this element's own transform, so a transform-based follow would be
   overridden for the duration of every ring. The element is out-of-flow
   (position: absolute) and 30px, so the per-move layout is trivial. */
(function () {
  var cursor = document.querySelector('.cursor');
  if (!cursor) return;

  var clientY = 0;
  window.addEventListener('mousemove', function (e) {
    clientY = e.clientY;
    cursor.style.left = e.pageX + 'px';
    cursor.style.top = e.pageY + 'px';
  }, { passive: true });

  // Keep the dot under the pointer when the page scrolls without the mouse moving.
  var scrollQueued = false;
  window.addEventListener('scroll', function () {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(function () {
      scrollQueued = false;
      cursor.style.top = (window.scrollY + clientY) + 'px';
    });
  }, { passive: true });

  document.addEventListener('mouseenter', function () { cursor.style.display = 'block'; });
  document.addEventListener('mouseleave', function () { cursor.style.display = 'none'; });

  // Click ring: one shot per click, re-triggerable. 300ms matches the CSS
  // animation-duration appended to main.css; a timeout (not animationend) so the
  // class also clears when reduced motion turns the animation off.
  var ringT = null;
  window.addEventListener('click', function () {
    if (cursor.classList.contains('ring')) {
      cursor.classList.remove('ring');
      void cursor.offsetWidth; // restart the keyframes for rapid clicks
    }
    cursor.classList.add('ring');
    clearTimeout(ringT);
    ringT = setTimeout(function () { cursor.classList.remove('ring'); }, 300);
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
})();
