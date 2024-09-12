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















// Function to create homepage navigation
function createHomepageNavigation() {
    var $navigationDivContainer = $('<div id="navigationDivContainer">');
    var $navigationDiv = $('<div class="navigation">');
    var $ul = $('<ul>');

    // Define navigation items for homepage
    var navItems = [
        { href: '#header', iconClass: 'bx bxs-home', text: 'Start' },
        { href: '#introTittle', iconClass: 'bx bxs-notepad', text: 'Intro' },
        { href: '#mainTittle', iconClass: 'bx bxs-briefcase', text: 'Details' },
        { href: '#CertificationTittle', iconClass: 'bx bxs-food-menu', text: 'Cert' },
        { href: '#highlightsTittle', iconClass: 'bx bxs-dashboard', text: 'Work' },
        { href: '#footerTittle', iconClass: 'bx bxs-phone-call', text: 'Contact' }
    ];

    // Create each nav item
    $.each(navItems, function(index, item) {
        var $li = $('<li>', { class: 'list' });
        var $a = $('<a>', { href: item.href });
        var $spanIcon = $('<span>', { class: 'icon' });
        var $spanText = $('<span>', { class: 'text', text: item.text });
        var $icon = $('<i>', { class: item.iconClass });

        $spanIcon.append($icon);
        $a.append($spanIcon).append($spanText);
        $li.append($a);
        $ul.append($li);
    });

    // Append the ul element to the main container div
    $navigationDiv.append($ul);
    $navigationDivContainer.append($navigationDiv);
    $navigationDivContainer.appendTo($('body'));
}

// Function to create project page navigation
function createProjectNavigation() {
    var $navigationDivContainer = $('<div id="navigationDivContainer">');
    var $navigationDiv = $('<div class="navigation">');
    var $ul = $('<ul>');

    // Define navigation items for project page
    var navItems = [
        { href: '#header', iconClass: 'bx bxs-home', text: 'Start' },
        { href: '#gameOverviewTittle', iconClass: 'bx bxs-notepad', text: 'Overview' },
        { href: '#ScreenshotGalleryTittle', iconClass: 'bx bxs-camera', text: 'Screenshots' },
        { href: '#footerTittle', iconClass: 'bx bxs-phone-call', text: 'Contact' }
    ];

    // Create each nav item
    $.each(navItems, function(index, item) {
        var $li = $('<li>', { class: 'list' });
        var $a = $('<a>', { href: item.href });
        var $spanIcon = $('<span>', { class: 'icon' });
        var $spanText = $('<span>', { class: 'text', text: item.text });
        var $icon = $('<i>', { class: item.iconClass });

        $spanIcon.append($icon);
        $a.append($spanIcon).append($spanText);
        $li.append($a);
        $ul.append($li);
    });

    // Append the ul element to the main container div
    $navigationDiv.append($ul);
    $navigationDivContainer.append($navigationDiv);
    $navigationDivContainer.appendTo($('body'));
}

// Create navigation based on the page class
if ($('body').hasClass('homepage')) {
    createHomepageNavigation();
} else if ($('body').hasClass('project')) {
    createProjectNavigation();
}











		
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






document.addEventListener("DOMContentLoaded", function() {
    function rearrangeBanner() {
        const certificationSection = document.getElementById("Certification");

        if (certificationSection) {
            const containerDiv = certificationSection.querySelector(".container");

            if (containerDiv) {
                const secondBanner = containerDiv.querySelector(".banner2");

                if (secondBanner) {
                    const bannerContent = secondBanner.querySelector(".banner-content");
                    const bannerImage = secondBanner.querySelector(".banner-image");

                    if (window.innerWidth < 980) {
                        if (bannerContent && bannerImage) {
                            // Rearrange elements for mobile
                            secondBanner.removeChild(bannerContent);
                            secondBanner.removeChild(bannerImage);
                            secondBanner.appendChild(bannerImage);
                            secondBanner.appendChild(bannerContent);
                        }
                    } else {
                        if (bannerContent && bannerImage) {
                            // Ensure default order for larger screens
                            secondBanner.removeChild(bannerImage);
                            secondBanner.removeChild(bannerContent);
                            secondBanner.appendChild(bannerContent);
                            secondBanner.appendChild(bannerImage);
                        }
                    }
                } else {
                    console.error("Second banner with class 'banner2' not found.");
                }
            } else {
                console.error("Container with class 'container' not found in the section with id 'Certification'.");
            }
        } else {
            console.error("Section with id 'Certification' not found.");
        }
    }

    // Call rearrangeBanner on page load
    rearrangeBanner();

    // Call rearrangeBanner on window resize
    window.addEventListener("resize", rearrangeBanner);
});
