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
    let animationFrameId; // To store the ID returned by requestAnimationFrame, so we can cancel it.

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
        // Return a random color from the palette array.
        return colorPalette[Math.floor(Math.random() * colorPalette.length)];
    }

    // This helper function creates a <span> element for a character, gives it a random color, and appends it to the output display.
    function appendColoredChar(char) {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.color = getRandomColor();
        typewriterOutput.appendChild(span);
    }

    // --- Typewriter Effect using setTimeout ---
    // This function types out the text character by character with a fixed delay.
    function typeWriterEffectTimeout() {
        // Check if there are still characters left to type.
        if (charIndex < currentText.length) {
            // Append the next character with a random color.
            appendColoredChar(currentText.charAt(charIndex));
            // Move to the next character.
            charIndex++;
            // Schedule the next character to be typed after 'typingSpeed' milliseconds.
            setTimeout(typeWriterEffectTimeout, typingSpeed);
        }
    }

    // --- Typewriter Effect using requestAnimationFrame ---
    // This approach is often smoother and more efficient as it syncs with the browser's refresh rate.
    let lastFrameTime = 0; // Timestamp of the last frame.
    const charsPerSecond = 10; // Desired typing speed.
    const frameInterval = 1000 / charsPerSecond; // How many milliseconds should pass between each character.

    function typeWriterEffectRaf(currentTime) {
        // Initialize lastFrameTime on the first run.
        if (!lastFrameTime) lastFrameTime = currentTime;
        
        // Calculate the time elapsed since the last character was typed.
        const elapsed = currentTime - lastFrameTime;

        // If enough time has passed, type the next character.
        if (elapsed > frameInterval) {
            if (charIndex < currentText.length) {
                appendColoredChar(currentText.charAt(charIndex));
                charIndex++;
                lastFrameTime = currentTime; // Update the last frame time.
            } else {
                // Stop the animation when all characters are typed.
                cancelAnimationFrame(animationFrameId);
                return;
            }
        }
        // Request the next animation frame to continue the loop.
        animationFrameId = requestAnimationFrame(typeWriterEffectRaf);
    }

    // This function resets the output area and typing variables before starting a new effect.
    function resetTyping() {
        typewriterOutput.innerHTML = ''; // Clear the display.
        charIndex = 0; // Reset character index to the beginning.
        // If a requestAnimationFrame loop is running, cancel it to prevent conflicts.
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    // Add an event listener to the "Start Typing" button.
    startTypingButton.addEventListener('click', () => {
        // Reset everything first.
        resetTyping();
        // Get the text from the textarea.
        currentText = typewriterTextarea.value;
        // If the textarea is empty, use a default placeholder text.
        if (currentText.trim() === '') {
            currentText = "The quick brown fox jumps over the lazy dog.";
        }

        // Check which radio button is selected and start the corresponding effect.
        if (effectTimeoutRadio.checked) {
            typeWriterEffectTimeout();
        } else if (effectRafRadio.checked) {
            lastFrameTime = 0; // Reset the timer for the RAF effect.
            typeWriterEffectRaf(0); // Start the RAF loop.
        }
    });

    // --- Initial Setup ---
    // Set a default text in the textarea when the page loads.
    typewriterTextarea.value = "Hello, world! This is a typewriter effect demonstration.";
    // Automatically trigger a click on the "Start Typing" button to show the effect on page load.
    startTypingButton.click();
});

