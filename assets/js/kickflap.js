// The kicker's own split-flap.
//
// Deliberately NOT the heading's module. That one caches glyph advances per type
// size in one module-level variable, and a second board at a different size would
// thrash it. This needs none of that machinery: the kicker is one short line at
// one size, and a cell sized to the wider of its own two glyphs never reflows, so
// there is nothing to measure.
(function () {
	if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	var CH = " ABCDEFGHIJKLMNOPQRSTUVWXYZ·";
	var IDX = {};
	for (var c = 0; c < CH.length; c++) IDX[CH[c]] = c;

	// Quicker and tighter than the heading's: this is a 0.7rem line handing over
	// under a heading that has just finished its own walk, not the walk itself.
	var STEP_MS = 42, STAGGER = 11, MIN_SPIN = 3, BUDGET = 380;
	var strip = null;

	function drum(ch) { var u = (ch || " ").toUpperCase(); return (u in IDX) ? IDX[u] : 0; }
	function show(ch) { return ch === " " ? " " : ch.toUpperCase(); }

	// The strip is always as wide as the LONGER sentence, and while the heading is up
	// the whole strip is centred on the slide - so the shorter one, packed against
	// its left end with the icon, reads as a kicker sitting well left of the middle.
	//
	// Padding the short one into the middle of the cells does not fix it: the icon
	// is cell zero and would stay at the far left, stranded from its own text. So
	// the strip keeps its left-aligned content and is SHIFTED by half of whatever it
	// is not using. The CSS only applies that while the heading is enlarged, so at
	// rest the kicker is left-aligned in its column exactly as before.
	function slack(s, state) {
		if (s.plain) { s.el.style.setProperty("--kick-slack", "0px"); return; }
		var last = -1;
		for (var i = 0; i < s.cells.length; i++) {
			if (target(s.cells[i], state).trim() !== "") last = i;
		}
		if (last < 0) { s.el.style.setProperty("--kick-slack", "0px"); return; }
		// Only on one line. Wrapped, the strip already fills its column and there
		// is no tail of blank cells on the right to take up.
		if (s.cells[last].el.offsetTop !== s.cells[0].el.offsetTop) {
			s.el.style.setProperty("--kick-slack", "0px"); return;
		}
		var stripW = s.el.getBoundingClientRect().width;
		var inked = s.cells[last].el.getBoundingClientRect().right - s.el.getBoundingClientRect().left;
		s.el.style.setProperty("--kick-slack", Math.max(0, (stripW - inked) / 2).toFixed(1) + "px");
	}

	// Whether the strip fits its column on ONE line. Measured as the sum of the
	// cells against the width of the copy column, NOT by looking at where the cells
	// have landed: the centring that this gates is a margin-left of 50%, which eats
	// the strip's own room and makes it wrap harder - so reading the wrap back while
	// it is applied answers a question the answer has already changed.
	// A board only exists where it was measured to fit, so it is always centred; the
	// text fallback never is. The earlier version re-derived this from the cells and
	// disagreed with the decision that had already been made.
	function fit(s) {
		s.el.style.setProperty("--kick-center", s.plain ? "0" : "1");
	}

	// Would the board fit this column on one line? A cell per character, each sized
	// to the wider of its two glyphs, is about twice the width of the same sentence
	// set as text - so at 388 it wrapped to three lines where the plain kicker took
	// two, and that made this beat's copy column 22px taller than the one it hands
	// over to. The two columns matching is the whole reason the crossfade between
	// them is invisible, so where the board does not fit, there is no board.
	function fits(el, n) {
		var probe = document.createElement("span");
		probe.style.cssText = "position:absolute;visibility:hidden;white-space:pre";
		probe.textContent = (el.getAttribute("data-b") || "").toUpperCase();
		el.appendChild(probe);
		var textW = probe.getBoundingClientRect().width;
		probe.remove();
		var col = el.closest(".hl-slide-content");
		var room = col ? col.getBoundingClientRect().width : textW;
		var iconW = 0;
		var ic = el.querySelector(".kick-cell--icon");
		if (ic) iconW = ic.getBoundingClientRect().width + 11;
		// A cell board runs about 1.9x the set width of the same sentence.
		return (textW * 1.9 + iconW) <= room;
	}

	// Plain text, for a column too narrow to hold the board. Same two sentences,
	// same icon, swapped rather than walked.
	function buildPlain(el) {
		var span = document.createElement("span");
		span.className = "kick-plain";
		el.classList.add("is-plain");
		el.appendChild(span);

		// Held at the height of the LONGER sentence. The two wrap to a different
		// number of lines in a narrow column, and a kicker that changes height mid
		// beat moves everything under it - which put this beat's heading 5px off the
		// one it hands over to. The old two-label version got this for free by
		// stacking both in one box; this measures it once instead.
		span.textContent = el.getAttribute("data-b") || "";
		el.style.minHeight = el.getBoundingClientRect().height.toFixed(1) + "px";
		span.textContent = el.getAttribute("data-a") || "";
		var ic = el.querySelector(".kick-cell--icon");
		return {
			el: el, cells: [], plain: span, state: "a", raf: 0, t0: 0,
			icon: ic,
			iconFace: ic && ic.querySelector(".kick-face i"),
			iconLeaf: ic && ic.querySelector(".kick-leaf"),
			iconLeafI: ic && ic.querySelector(".kick-leaf i")
		};
	}

	function build(el) {
		var a = el.getAttribute("data-a") || "", b = el.getAttribute("data-b") || "";
		var n = Math.max(a.length, b.length), cells = [];
		for (var i = 0; i < n; i++) {
			var ca = a.charAt(i) || " ", cb = b.charAt(i) || " ";
			var cell = document.createElement("span");
			cell.className = "kick-cell";

			// Two struts, stacked in one grid area and never written to. The cell is
			// whichever of them is wider, so a W passing through where an I will land
			// cannot shove the rest of the line sideways.
			[ca, cb].forEach(function (g) {
				var s = document.createElement("span");
				s.className = "kick-strut";
				s.textContent = show(g);
				cell.appendChild(s);
			});

			var face = document.createElement("span");
			face.className = "kick-face";
			face.textContent = show(ca);

			var leaf = document.createElement("span");
			leaf.className = "kick-leaf";
			leaf.style.visibility = "hidden";
			var leafF = document.createElement("span");
			leafF.textContent = show(ca);
			leaf.appendChild(leafF);

			cell.appendChild(face);
			cell.appendChild(leaf);
			el.appendChild(cell);

			cells.push({
				el: cell, a: ca, b: cb, face: face, leaf: leaf, leafF: leafF,
				glyph: drum(ca), from: 0, steps: 0, stepMs: STEP_MS
			});
		}

		var ic = el.querySelector(".kick-cell--icon");
		return {
			el: el, cells: cells, state: "a", raf: 0, t0: 0,
			icon: ic,
			iconFace: ic && ic.querySelector(".kick-face i"),
			iconLeaf: ic && ic.querySelector(".kick-leaf"),
			iconLeafI: ic && ic.querySelector(".kick-leaf i")
		};
	}

	function target(cell, state) { return state === "b" ? cell.b : cell.a; }

	function setIcon(s, state, mid) {
		if (!s.icon) return;
		var want = s.icon.getAttribute(state === "b" ? "data-icon-b" : "data-icon-a");
		var other = s.icon.getAttribute(state === "b" ? "data-icon-a" : "data-icon-b");
		if (s.iconFace) s.iconFace.className = want;
		// The leaf carries the OLD icon on its way down and matches the face at rest,
		// so there is never a frame with both icons readable at once.
		if (s.iconLeafI) s.iconLeafI.className = mid ? other : want;
	}

	function land(s, state) {
		cancelAnimationFrame(s.raf);
		if (s.plain) {
			s.plain.textContent = s.el.getAttribute(state === "b" ? "data-b" : "data-a") || "";
			setIcon(s, state, false);
			s.state = state;
			return;
		}
		for (var k = 0; k < s.cells.length; k++) {
			var cell = s.cells[k], ch = target(cell, state);
			cell.glyph = drum(ch);
			cell.face.textContent = show(ch);
			cell.leafF.textContent = show(ch);
			cell.leaf.style.transform = "rotateX(0deg)";
			cell.leaf.style.visibility = "hidden";
			cell.steps = 0;
		}
		if (s.iconLeaf) {
			s.iconLeaf.style.transform = "rotateX(0deg)";
			s.iconLeaf.style.visibility = "hidden";
		}
		setIcon(s, state, false);
		s.state = state;
		slack(s, state);
		s.el.classList.remove("is-kicking");
	}

	function run(s, state) {
		if (s.plain) { land(s, state); return; }
		cancelAnimationFrame(s.raf);
		s.state = state;
		slack(s, state);
		s.el.classList.add("is-kicking");

		var len = CH.length, k, cell;
		for (k = 0; k < s.cells.length; k++) {
			cell = s.cells[k];
			var to = drum(target(cell, state));
			var raw = (to - cell.glyph + len) % len;
			// Floored, so a cell whose letter is the same either side still flaps
			// rather than sitting the move out and breaking the line.
			cell.steps = Math.max(raw, MIN_SPIN);
			cell.from = cell.glyph;
			cell.stepMs = Math.min(STEP_MS, BUDGET / cell.steps);
		}

		if (s.iconLeaf) s.iconLeaf.style.visibility = "visible";
		setIcon(s, state, true);

		var iconMs = s.cells.length ? s.cells[0].steps * s.cells[0].stepMs : 200;
		s.t0 = performance.now();

		var tick = function (now) {
			var running = false;

			// The icon has two states and no alphabet to travel through, so it is one
			// flap over the length of the first cell's walk rather than a drum.
			if (s.iconLeaf) {
				var ip = (now - s.t0) / iconMs;
				if (ip >= 1) {
					s.iconLeaf.style.transform = "rotateX(0deg)";
					s.iconLeaf.style.visibility = "hidden";
					setIcon(s, s.state, false);
				} else {
					running = true;
					s.iconLeaf.style.transform = "rotateX(" + (-90 * ip).toFixed(1) + "deg)";
				}
			}

			for (var j = 0; j < s.cells.length; j++) {
				var cl = s.cells[j];
				if (cl.steps === 0) continue;

				var elapsed = now - s.t0 - j * STAGGER;
				if (elapsed < 0) { running = true; continue; }

				var step = Math.floor(elapsed / cl.stepMs);
				if (step >= cl.steps) {
					var done = target(cl, s.state);
					cl.glyph = drum(done);
					cl.face.textContent = show(done);
					// At rest the leaf carries the same glyph as the face, so the seam
					// disappears instead of stacking the last letter over it.
					cl.leafF.textContent = show(done);
					cl.leaf.style.transform = "rotateX(0deg)";
					cl.leaf.style.visibility = "hidden";
					cl.steps = 0;
					continue;
				}

				running = true;
				var shown = (cl.from + step) % len, next = (shown + 1) % len;
				var f = (elapsed % cl.stepMs) / cl.stepMs;
				cl.face.textContent = show(CH[next]);
				cl.leafF.textContent = show(CH[shown]);
				cl.leaf.style.visibility = "visible";
				cl.leaf.style.transform = "rotateX(" + (-90 * f).toFixed(1) + "deg)";
				cl.glyph = shown;
			}

			if (running) s.raf = requestAnimationFrame(tick);
			else s.el.classList.remove("is-kicking");
		};
		s.raf = requestAnimationFrame(tick);
	}

	function ready(reel) {
		if (strip) return strip;
		var el = reel.querySelector(".kick-strip");
		if (!el) return null;
		var n = Math.max((el.getAttribute("data-a") || "").length, (el.getAttribute("data-b") || "").length);
		strip = fits(el, n) ? build(el) : buildPlain(el);
		fit(strip);
		slack(strip, "a");
		return strip;
	}

	window.__kick = {
		// Walk to a state. Called from the driver off the bridge's own progress, so
		// scrubbing back up walks it the other way rather than leaving it landed.
		to: function (reel, state) {
			var s = ready(reel);
			if (!s || s.state === state) return;
			run(s, state);
		},
		// Set without walking, for a beat that is simply already over.
		set: function (reel, state) {
			var s = ready(reel);
			if (s) land(s, state);
		}
	};

	// Built NOW, not on the first scroll. The reel measures this kicker against the
	// heading it hands over to while calibrating, and a strip that has not been
	// filled in yet is one icon tall - so the gap it worked out was a gap above the
	// wrong box, and the kicker came to rest 10px INTO the heading at 388.
	if (document.getElementById("reel")) ready(document.getElementById("reel"));

	window.addEventListener("resize", function () {
		if (strip) { fit(strip); slack(strip, strip.state); }
	}, { passive: true });

})();
