document.addEventListener('DOMContentLoaded', () => {
    const introMusic = document.getElementById('intro-music');
    const logo = document.querySelector('.logo');
    const scrollContainer = document.querySelector('.scroll-container');
    const crawlText = document.querySelector('.crawl-text');
    const skipButton = document.querySelector('.skip-button');
    
    // Function to redirect to home page
    function goToHomePage() {
        window.location.href = "home.html";
    }
    
    // Function to start the intro sequence
    function startIntro() {
        // Show the skip button
        skipButton.style.display = 'block';
        
        // Try to play the music (browser may block autoplay)
        try {
            introMusic.volume = 0.6;
            introMusic.play().catch(e => console.log('Audio autoplay was prevented by the browser.'));
        } catch (e) {
            console.log('Audio autoplay was prevented by the browser.');
        }
        
        // Show the logo first
        logo.classList.add('animate-fade-in');
        
        // After 2 seconds, fade out the logo
        setTimeout(() => {
            logo.classList.remove('animate-fade-in');
            logo.classList.add('animate-fade-out');
            
            // After logo fades out, start the scroll text
            setTimeout(() => {
                crawlText.classList.add('animate-scroll');
                
                // Listen for the animation end event
                crawlText.addEventListener('animationend', function animEndHandler() {
                    // Remove the event listener to prevent multiple redirects
                    crawlText.removeEventListener('animationend', animEndHandler);
                    // Go to home page immediately after animation completes
                    goToHomePage();
                });
            }, 1000);
        }, 2000);
    }
    
    // Function to skip and go to home page
    function skipIntro() {
        console.log("Skip button clicked, redirecting to home.html");
        // Stop the music if it's playing
        if (introMusic) {
            introMusic.pause();
            introMusic.currentTime = 0;
        }
        
        // Go to home page immediately
        goToHomePage();
    }
    
    // Add click event to skip button
    if (skipButton) {
        skipButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            skipIntro();
        });
    } else {
        console.log("Skip button not found in the DOM");
    }
    
    // Add keyboard events for accessibility
    document.addEventListener('keydown', (event) => {
        // Escape to skip and go to home page
        if (event.key === 'Escape') {
            skipIntro();
        }
    });
    
    // Add touch events for mobile
    document.addEventListener('touchstart', (event) => {
        // If touching the screen during animation, skip to home page
        if (skipButton.style.display === 'block') {
            skipIntro();
        }
    });
    
    // Start the intro automatically when page loads
    startIntro();
}); 