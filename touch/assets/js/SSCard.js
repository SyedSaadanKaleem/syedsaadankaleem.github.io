(function() {
    document.querySelectorAll('.ss-panel').forEach(panel => {
        panel.addEventListener('click', function() {
            // If this panel is already active, do nothing (keep something showing)
            if (this.classList.contains('active')) return;
            
            // Find this panel's parent gallery, deactivate siblings, activate this one
            const gallery = this.closest('.ss-gallery');
            gallery.querySelectorAll('.ss-panel').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
        });
    });
})();