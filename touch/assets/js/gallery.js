/* Lightbox for project-page .shot galleries */
// (function () {
// 	var shots = Array.prototype.slice.call(document.querySelectorAll('.shot'));
// 	if (!shots.length) return;

// 	var lb = document.createElement('div');
// 	lb.className = 'lightbox';
// 	lb.innerHTML =
// 		'<button class="lightbox-btn lightbox-close" aria-label="Close">&times;</button>' +
// 		'<button class="lightbox-btn lightbox-prev" aria-label="Previous">&#8249;</button>' +
// 		'<img alt="Screenshot">' +
// 		'<button class="lightbox-btn lightbox-next" aria-label="Next">&#8250;</button>' +
// 		'<div class="lightbox-count"></div>';
// 	document.body.appendChild(lb);

// 	var img = lb.querySelector('img');
// 	var count = lb.querySelector('.lightbox-count');
// 	var i = 0;

// 	function show(n) {
// 		i = (n + shots.length) % shots.length;
// 		img.src = shots[i].getAttribute('href');
// 		count.textContent = (i + 1) + ' / ' + shots.length;
// 	}
// 	function open(n) {
// 		show(n);
// 		lb.classList.add('open');
// 		document.body.style.overflow = 'hidden';
// 	}
// 	function close() {
// 		lb.classList.remove('open');
// 		document.body.style.overflow = '';
// 	}

// 	shots.forEach(function (s, n) {
// 		s.addEventListener('click', function (e) {
// 			e.preventDefault();
// 			open(n);
// 		});
// 	});
// 	lb.querySelector('.lightbox-close').addEventListener('click', close);
// 	lb.querySelector('.lightbox-prev').addEventListener('click', function () { show(i - 1); });
// 	lb.querySelector('.lightbox-next').addEventListener('click', function () { show(i + 1); });
// 	lb.addEventListener('click', function (e) {
// 		if (e.target === lb) close();
// 	});
// 	document.addEventListener('keydown', function (e) {
// 		if (!lb.classList.contains('open')) return;
// 		if (e.key === 'Escape') close();
// 		else if (e.key === 'ArrowLeft') show(i - 1);
// 		else if (e.key === 'ArrowRight') show(i + 1);
// 	});
// })();
