// Wait for the entire HTML document to be loaded and parsed before running the script.
document.addEventListener('DOMContentLoaded', () => {
    // Get references to all the necessary HTML elements.
    const typewriterTextarea = document.getElementById('typewriter-text');
    const startTypingButton = document.getElementById('start-typing');
    const typewriterOutput = document.getElementById('typewriter-output');
    const effectTimeoutRadio = document.getElementById('effect-timeout');
    const effectRafRadio = document.getElementById('effect-raf');

    // Initialize variables to manage the typing process.
    let currentText = ''; // The full string to be typed out.
    let charIndex = 0; // The index of the character to be typed next.
    let typingSpeed = 100; // Delay in milliseconds between characters for the setTimeout effect.
    let animationFrameId; // To store the ID returned by requestAnimationFrame.
    let colorChangeIntervalId; // To store the ID for the color-changing setInterval.
    let isTypingComplete = false; // Flag to indicate if the typing animation has finished.
    const changeColorDuration = 1500; // Duration for character to change its color.

    // This function now picks a random color from a predefined palette.
    function getRandomColor() {
        const colorPalette = [
            '#E57373', // Light Red
            '#FFD54F', // Light Yellow
            '#81D4FA', // Light Blue
            '#A5D6A7', // Light Green
            '#F48FB1', // Light Pink
            '#FFAB91', // Light Orange
            '#B39DDB'  // Light Purple
        ];
        return colorPalette[Math.floor(Math.random() * colorPalette.length)];
    }

    // This helper function creates a <span> for a character, timestamping it for the animation.
    function appendColoredChar(char) {
        const span = document.createElement('span');
        span.className = 'type-char';
        span.textContent = char;
        // Store the creation time on the element itself.
        span.dataset.createdAt = Date.now();
        span.style.color = getRandomColor();
        typewriterOutput.appendChild(span);
    }
    
    // This function updates character colors based on their age.
    function updateAllColors() {
        const now = Date.now();
        const chars = typewriterOutput.querySelectorAll('.type-char:not(.done-coloring)');

        chars.forEach(char => {
            const createdAt = parseInt(char.dataset.createdAt, 10);
            if (now - createdAt > changeColorDuration) {
                // If 3 seconds have passed, turn it black and mark it as done.
                char.style.color = 'black';
                char.classList.add('done-coloring');
            } else {
                // Otherwise, give it a new random color.
                char.style.color = getRandomColor();
            }
        });

        // If typing is complete, check if all characters are done coloring.
        if (isTypingComplete) {
            const allChars = typewriterOutput.querySelectorAll('.type-char');
            const doneChars = typewriterOutput.querySelectorAll('.done-coloring');
            if (allChars.length > 0 && allChars.length === doneChars.length) {
                // If all are done, stop the color-changing loop.
                clearInterval(colorChangeIntervalId);
                colorChangeIntervalId = null;
            }
        }
    }

    // This function stops the typing animation loops.
    function stopTypingAnimations() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        isTypingComplete = true; // Set flag indicating typing is done.
    }

    // --- Typewriter Effect using setTimeout ---
    function typeWriterEffectTimeout() {
        if (charIndex < currentText.length) {
            appendColoredChar(currentText.charAt(charIndex));
            charIndex++;
            setTimeout(typeWriterEffectTimeout, typingSpeed);
        } else {
            stopTypingAnimations();
        }
    }

    // --- Typewriter Effect using requestAnimationFrame ---
    let lastFrameTime = 0;
    const charsPerSecond = 10;
    const frameInterval = 1000 / charsPerSecond;

    function typeWriterEffectRaf(currentTime) {
        if (!lastFrameTime) lastFrameTime = currentTime;
        const elapsed = currentTime - lastFrameTime;

        if (elapsed > frameInterval) {
            if (charIndex < currentText.length) {
                appendColoredChar(currentText.charAt(charIndex));
                charIndex++;
                lastFrameTime = currentTime;
            } else {
                stopTypingAnimations();
                return;
            }
        }
        animationFrameId = requestAnimationFrame(typeWriterEffectRaf);
    }

    // This function resets everything for a new animation.
    function resetTyping() {
        typewriterOutput.innerHTML = '';
        charIndex = 0;
        isTypingComplete = false;
        // Clear the color-changing interval if it's running.
        if (colorChangeIntervalId) {
            clearInterval(colorChangeIntervalId);
            colorChangeIntervalId = null;
        }
        // Clear the typing animation frame if it's running.
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    // Add an event listener to the "Start Typing" button.
    startTypingButton.addEventListener('click', () => {
        resetTyping();
        currentText = typewriterTextarea.value;
        if (currentText.trim() === '') {
            currentText = "The quick brown fox jumps over the lazy dog.";
        }

        // Start the continuous color-changing loop.
        colorChangeIntervalId = setInterval(updateAllColors, 500);

        if (effectTimeoutRadio.checked) {
            typeWriterEffectTimeout();
        } else if (effectRafRadio.checked) {
            lastFrameTime = 0;
            typeWriterEffectRaf(0);
        }
    });

    // --- Initial Setup ---
    typewriterTextarea.value = "Hello, world! This is a typewriter effect demonstration.";
    startTypingButton.click();
});

