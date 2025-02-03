document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Feature items interaction
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach(item => {
        item.addEventListener('click', () => {
            const wasActive = item.classList.contains('active');
            
            // Close all feature items
            featureItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Toggle the clicked item
            if (!wasActive) {
                item.classList.add('active');
            }
        });
    });

    // Demo carousel functionality
    const carousel = document.querySelector('.screenshot-carousel');
    const images = carousel.querySelectorAll('.demo-img');
    const dots = document.querySelectorAll('.control-dot');
    let currentIndex = 0;
    let intervalId;

    function showImage(index) {
        images.forEach(img => img.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        images[index].classList.add('active');
        dots[index].classList.add('active');
        currentIndex = index;
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    }

    // Add click events to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showImage(index);
            resetInterval();
        });
    });

    function resetInterval() {
        clearInterval(intervalId);
        intervalId = setInterval(nextImage, 5000);
    }

    // Initialize carousel
    showImage(0);
    resetInterval();

    // Pause carousel on hover
    carousel.addEventListener('mouseenter', () => clearInterval(intervalId));
    carousel.addEventListener('mouseleave', resetInterval);

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mobile menu functionality
    const mobileLogo = document.querySelector('.nav-logo.mobile');
    const navLinks = document.querySelector('.nav-links');

    // Toggle menu on mobile logo click
    mobileLogo.addEventListener('click', function(event) {
        event.preventDefault();
        this.classList.toggle('active');
        navLinks.classList.toggle('show');
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                mobileLogo.classList.remove('active');
                navLinks.classList.remove('show');
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', event => {
        if (window.innerWidth <= 768 && !event.target.closest('.nav-container') && navLinks.classList.contains('show')) {
            mobileLogo.classList.remove('active');
            navLinks.classList.remove('show');
        }
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768) {
                mobileLogo.classList.remove('active');
                navLinks.classList.remove('show');
            }
        }, 250);
    });
});
