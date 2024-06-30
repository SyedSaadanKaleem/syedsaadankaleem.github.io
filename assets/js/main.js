/*
	Escape Velocity by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body');

	// Breakpoints.
		breakpoints({
			xlarge:  [ '1281px',  '1680px' ],
			large:   [ '981px',   '1280px' ],
			medium:  [ '737px',   '980px'  ],
			small:   [ null,      '736px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Dropdowns.
		$('#nav > ul').dropotron({
			mode: 'fade',
			noOpenerFade: true,
			alignment: 'center',
			detach: false
		});

	// Nav.

		// Create the main container div with the class 'navigation'
var $navigationDivContainer = $('<div id="navigationDivContainer">');
// Create the main container div with the class 'navigation'
var $navigationDiv = $('<div class="navigation">');

// Create the ul element
var $ul = $('<ul>');

// Create the li element with the class 'list'
var $li = $('<li>', { class: 'list' });

// Create the a element with the href attribute
var $a = $('<a>', { href: '#header' });

// Create the span elements with their respective classes
var $spanIcon = $('<span>', { class: 'icon' });
var $spanText = $('<span>', { class: 'text', text: 'Start' });

// Create the i element with the classes 'bx bxs-home' and append it to the span with class 'icon'
var $icon = $('<i>', { class: 'bx bxs-home' });
$spanIcon.append($icon);

// Append the span elements to the a element
$a.append($spanIcon).append($spanText)

// Append the a element to the li element
$li.append($a);

// Append the li element to the ul element
$ul.append($li);

// Create the li element with the class 'list'
var $li = $('<li>', { class: 'list' });

// Create the a element with the href attribute
var $a = $('<a>', { href: '#introTittle' });

// Create the span elements with their respective classes
var $spanIcon = $('<span>', { class: 'icon' });
var $spanText = $('<span>', { class: 'text', text: 'The Introduction' });

// Create the i element with the classes 'bx bxs-home' and append it to the span with class 'icon'
var $icon = $('<i>', { class: 'bx bxs-notepad' });
$spanIcon.append($icon);

// Append the span elements to the a element
$a.append($spanIcon).append($spanText)

// Append the a element to the li element
$li.append($a);

// Append the li element to the ul element
$ul.append($li);

// Create the li element with the class 'list'
var $li = $('<li>', { class: 'list' });

// Create the a element with the href attribute
var $a = $('<a>', { href: '#mainTittle' });

// Create the span elements with their respective classes
var $spanIcon = $('<span>', { class: 'icon' });
var $spanText = $('<span>', { class: 'text', text: 'The Details' });

// Create the i element with the classes 'bx bxs-home' and append it to the span with class 'icon'
var $icon = $('<i>', { class: 'bx bxs-briefcase' });
$spanIcon.append($icon);

// Append the span elements to the a element
$a.append($spanIcon).append($spanText)

// Append the a element to the li element
$li.append($a);

// Append the li element to the ul element
$ul.append($li);

// Create the li element with the class 'list'
var $li = $('<li>', { class: 'list' });

// Create the a element with the href attribute
var $a = $('<a>', { href: '#footerTittle' });

// Create the span elements with their respective classes
var $spanIcon = $('<span>', { class: 'icon' });
var $spanText = $('<span>', { class: 'text', text: 'Get in Touch' });

// Create the i element with the classes 'bx bxs-home' and append it to the span with class 'icon'
var $icon = $('<i>', { class: 'bx bxs-phone-call' });
$spanIcon.append($icon);

// Append the span elements to the a element
$a.append($spanIcon).append($spanText)
// Append the a element to the li element
$li.append($a);

// Append the li element to the ul element
$ul.append($li);

// Append the ul element to the main container div
$navigationDiv.append($ul);

// Append the entire structure to the body or any other desired parent element
$navigationDiv.appendTo($navigationDivContainer);


// Append the entire structure to the body or any other desired parent element
$navigationDivContainer.appendTo($('body'));

		
document.addEventListener('DOMContentLoaded', function() {
    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    if (isTouchDevice()) {
        document.body.classList.add('touch-device');
    } else {
        document.body.classList.add('no-touch-device');
    }
});

})(jQuery);
