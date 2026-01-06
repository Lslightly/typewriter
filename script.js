// Wait for the entire HTML document to be loaded and parsed before running the script.
document.addEventListener('DOMContentLoaded', () => {
    // Get references to all the necessary HTML elements.
    const typewriterTextarea = document.getElementById('typewriter-text');
    const startTypingButton = document.getElementById('start-typing');
    const typewriterOutput = document.getElementById('typewriter-output');
    const effectTimeoutRadio = document.getElementById('effect-timeout');
    const effectRafRadio = document.getElementById('effect-raf');
    const realtimeModeCheckbox = document.getElementById('realtime-mode'); // New checkbox reference
    const effectSelectionDiv = document.querySelector('.effect-selection'); // Div containing radio buttons

    // Initialize variables to manage the typing process.
    let currentText = ''; // The full string to be typed out.
    let previousText = ''; // Stores the text content from the textarea in the previous step (for diffing).
    let charIndex = 0; // The index of the character to be typed next.
    let typingSpeed = 100; // Delay in milliseconds between characters for the setTimeout effect.
    let typingTimeoutId; // To store the ID for the typing setTimeout loop.
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

    // This helper function creates a <span> for a character, used by both manual and real-time modes.
    function createCharSpan(char) {
        const span = document.createElement('span');
        span.className = 'type-char';
        span.textContent = char;
        span.dataset.createdAt = Date.now();
        span.style.color = getRandomColor();
        return span;
    }

    // This helper function creates a <span> for a character and appends it to the output.
    function appendColoredChar(char) {
        const span = createCharSpan(char);
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
            // Store the ID so we can cancel it if the user restarts the animation.
            typingTimeoutId = setTimeout(typeWriterEffectTimeout, typingSpeed);
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
        
        // Clear all running timers and intervals to prevent conflicts.
        if (colorChangeIntervalId) {
            clearInterval(colorChangeIntervalId);
            colorChangeIntervalId = null;
        }
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        if (typingTimeoutId) {
            clearTimeout(typingTimeoutId);
            typingTimeoutId = null;
        }
    }

    // This function contains the logic to start a new typing animation.
    function startNewTypingAnimation() {
        // Prevent starting if real-time mode is active, as it will handle typing.
        if (realtimeModeCheckbox.checked) {
            return;
        }

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
    }

    // This function compares the old and new text and updates the DOM precisely.
    function processRealtimeInput(newText, oldText) {
        // 1. Find the first index where the strings differ.
        let start = 0;
        while (start < oldText.length && start < newText.length && oldText[start] === newText[start]) {
            start++;
        }

        // 2. Find the last index where the strings differ.
        let oldEnd = oldText.length - 1;
        let newEnd = newText.length - 1;
        while (oldEnd >= start && newEnd >= start && oldText[oldEnd] === newText[newEnd]) {
            oldEnd--;
            newEnd--;
        }

        // 3. Get the list of child nodes (the character spans).
        const children = Array.from(typewriterOutput.childNodes);

        // 4. Handle removals: Remove the differing part of the old text.
        for (let i = start; i <= oldEnd; i++) {
            if (children[i]) {
                children[i].remove();
            }
        }

        // 5. Handle additions: Insert the differing part of the new text.
        const addedText = newText.substring(start, newEnd + 1);
        const referenceNode = typewriterOutput.children[start] || null; // Node to insert before.

        for (const char of addedText) {
            const span = createCharSpan(char);
            typewriterOutput.insertBefore(span, referenceNode);
        }
    }

    // Function to toggle the state of UI elements based on real-time mode.
    function toggleRealtimeMode(isEnabled) {
        startTypingButton.disabled = isEnabled;
        effectSelectionDiv.querySelectorAll('input').forEach(radio => radio.disabled = isEnabled);
        
        if (isEnabled) {
            // If entering real-time mode, stop any ongoing manual animation.
            resetTyping();
            previousText = typewriterTextarea.value;
            if (!colorChangeIntervalId) {
                colorChangeIntervalId = setInterval(updateAllColors, 500);
            }
            // Immediately populate the display with the current text.
            for (const char of previousText) {
                appendColoredChar(char);
            }
        } else {
            if (colorChangeIntervalId) {
                clearInterval(colorChangeIntervalId);
                colorChangeIntervalId = null;
            }
            resetTyping();
        }
    }

    // Add event listener for the real-time mode checkbox.
    realtimeModeCheckbox.addEventListener('change', (event) => {
        toggleRealtimeMode(event.target.checked);
    });

    // Add event listener for real-time input in the textarea.
    typewriterTextarea.addEventListener('input', () => {
        if (realtimeModeCheckbox.checked) {
            const newText = typewriterTextarea.value;
            processRealtimeInput(newText, previousText); // Call the diffing function
            previousText = newText; // Update previousText for the next input event
        }
    });

    // Add an event listener to the "Start Typing" button.
    startTypingButton.addEventListener('click', () => {
        // If the output area is already empty, start immediately.
        if (typewriterOutput.textContent.trim() === '') {
            startNewTypingAnimation();
            return;
        }

        // Function to run after the fade-out completes.
        const onFadeOutComplete = () => {
            typewriterOutput.classList.remove('fading-out');
            startNewTypingAnimation();
        }

        // Wait for the CSS transition to finish before starting the new animation.
        setTimeout(onFadeOutComplete, 300); // 300ms matches the opacity transition in style.css
        
        // Add the class to trigger the fade-out on the child .type-char elements.
        typewriterOutput.classList.add('fading-out');
    });


    // --- Initial Setup ---
    typewriterTextarea.value = "Hello, world! This is a typewriter effect demonstration.";
    startTypingButton.click();
    
    // Initial state setup for real-time mode.
    toggleRealtimeMode(realtimeModeCheckbox.checked);
});
