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
    const colorRandomRadio = document.getElementById('color-random');
    const colorGradientRadio = document.getElementById('color-gradient');
    const gradientColorPickersDiv = document.getElementById('gradient-color-pickers');
    const gradientStartColorInput = document.getElementById('gradient-start-color');
    const gradientEndColorInput = document.getElementById('gradient-end-color');
    const typingSpeedSlider = document.getElementById('typing-speed');
    const typingSpeedDisplay = document.getElementById('typing-speed-display');

    // Initialize variables to manage the typing process.
    let currentText = ''; // The full string to be typed out.
    let previousText = ''; // Stores the text content from the textarea in the previous step (for diffing).
    let charIndex = 0; // The index of the character to be typed next.
    let typingSpeed = typingSpeedSlider.value; // Delay in milliseconds between characters for the setTimeout effect.
    let typingTimeoutId; // To store the ID for the typing setTimeout loop.
    let animationFrameId; // To store the ID returned by requestAnimationFrame.
    let colorAnimationId; // To store the ID for the color animation loop.
    let isTypingComplete = false; // Flag to indicate if the typing animation has finished.
    const changeColorDuration = 1500; // Duration for character to change its color.
    let gradientStartColor; // Gradient start color specified by gradientStartColorInput initially.
    let gradientEndColor; // Gradient end color specified by gradientStartColorInput initially.

    // Update typing speed when slider changes
    typingSpeedSlider.addEventListener('input', (event) => {
        const sliderValue = parseInt(event.target.value, 10);
        typingSpeed = sliderValue;
        typingSpeedDisplay.textContent = sliderValue;
    });

    // Helper function to convert HSL to RGB.
    function hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    // This function now picks a random color from a predefined palette or generates a gradient color.
    function getRandomColor(charIdx, totalChars) {
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

    // Function to get a color from a gradient based on a progress value (0 to 1).
    function getGradientColor(startColor, endColor, progress) {
        const h = startColor[0] + progress * (endColor[0] - startColor[0]);
        const s = startColor[1] + progress * (endColor[1] - startColor[1]);
        const l = startColor[2] + progress * (endColor[2] - startColor[2]);

        const [r, g, b] = hslToRgb(h, s, l);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // Function to determine the character color based on the selected mode
    function getCharacterColor(charIdx, totalChars) {
        if (colorRandomRadio.checked) {
            return getRandomColor();
        } else if (colorGradientRadio.checked) {
            // For gradient mode, the initial color is always the start of the gradient.
            const [r, g, b] = hslToRgb(...gradientStartColor);
            return `rgb(${r}, ${g}, ${b})`;
        }
        return 'black'; // Default to black
    }

    // This helper function creates a <span> for a character, used by both manual and real-time modes.
    function createCharSpan(char, charIdx, doneColoring) {
        const span = document.createElement('span');
        span.className = 'type-char';
        span.textContent = char;
        span.dataset.createdAt = Date.now();
        if (doneColoring) {
            span.style.color = 'black';
            span.classList.add('done-coloring');
        } else {
            // Use the new getCharacterColor function
            span.style.color = getCharacterColor(charIdx, currentText.length);
        }
        return span;
    }

    // This helper function creates a <span> for a character and appends it to the output.
    function appendColoredChar(char, charIdx, doneColoring) {
        const span = createCharSpan(char, charIdx, doneColoring);
        typewriterOutput.appendChild(span);
    }
    
    // This function updates character colors based on their age.
    function updateAllColors() {
        const now = Date.now();
        const chars = typewriterOutput.querySelectorAll('.type-char:not(.done-coloring)');
        const blackHsl = [0, 0, 0]; // HSL for black

        chars.forEach(char => {
            const createdAt = parseInt(char.dataset.createdAt, 10);
            const elapsedTime = now - createdAt;

            if (elapsedTime > changeColorDuration) {
                // If changeColorDuration has passed, turn it black and mark it as done.
                char.style.color = 'black';
                char.classList.add('done-coloring');
            } else {
                // Otherwise, update its color based on the mode.
                if (colorRandomRadio.checked) {
                    // Random color flickers on each frame
                    char.style.color = getRandomColor();
                } else if (colorGradientRadio.checked) {
                    const stage1Duration = changeColorDuration * 0.4;
                    const stage2Duration = changeColorDuration * 0.2;
                    const stage3Duration = changeColorDuration * 0.4;

                    if (elapsedTime <= stage1Duration) {
                        // Stage 1: from start color to end color
                        const progress = elapsedTime / stage1Duration;
                        char.style.color = getGradientColor(gradientStartColor, gradientEndColor, progress);
                    } else if (elapsedTime <= stage1Duration + stage2Duration) {
                        // Stage 2: hold end color
                        char.style.color = getGradientColor(gradientEndColor, gradientEndColor, 1);
                    } else {
                        // Stage 3: from end color to black
                        const progress = (elapsedTime - (stage1Duration + stage2Duration)) / stage3Duration;
                        char.style.color = getGradientColor(gradientEndColor, blackHsl, progress);
                    }
                }
            }
        });
    }

    // New animation loop using requestAnimationFrame
    function animateColors() {
        updateAllColors();

        const allChars = typewriterOutput.querySelectorAll('.type-char');
        const doneChars = typewriterOutput.querySelectorAll('.done-coloring');

        // Continue the animation if not all characters are done coloring, or if typing is still in progress.
        if (allChars.length === 0 || doneChars.length < allChars.length) {
            colorAnimationId = requestAnimationFrame(animateColors);
        } else {
            colorAnimationId = null;
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
            appendColoredChar(currentText.charAt(charIndex), charIndex, false);
            charIndex++;
            // Store the ID so we can cancel it if the user restarts the animation.
            typingTimeoutId = setTimeout(typeWriterEffectTimeout, typingSpeed);
        } else {
            stopTypingAnimations();
        }
    }

    // --- Typewriter Effect using requestAnimationFrame ---
    let lastFrameTime = 0;

    function typeWriterEffectRaf(currentTime) {
        if (!lastFrameTime) lastFrameTime = currentTime;
        const elapsed = currentTime - lastFrameTime;
        const frameInterval = typingSpeed; // Directly use typingSpeed as frameInterval

        if (elapsed > frameInterval) {
            if (charIndex < currentText.length) {
                appendColoredChar(currentText.charAt(charIndex), charIndex, false);
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
        if (colorAnimationId) {
            cancelAnimationFrame(colorAnimationId);
            colorAnimationId = null;
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
        if (!colorAnimationId) {
            colorAnimationId = requestAnimationFrame(animateColors);
        }

        if (effectTimeoutRadio.checked) {
            typeWriterEffectTimeout();
        } else { // Use requestAnimationFrame if not timeout
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

        let tempCharIndex = start;
        for (const char of addedText) {
            const span = createCharSpan(char, tempCharIndex, false);
            typewriterOutput.insertBefore(span, referenceNode);
            tempCharIndex++;
        }

        // After making changes, ensure the color animation is running.
        if (!colorAnimationId) {
            colorAnimationId = requestAnimationFrame(animateColors);
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
            // Immediately populate the display with the current text.
            for (const [i, char] of Array.from(previousText).entries()) {
                appendColoredChar(char, i, true);
            }
            // Start the color animation loop if it's not already running.
            if (!colorAnimationId) {
                colorAnimationId = requestAnimationFrame(animateColors);
            }
        } else {
            // If exiting real-time mode, clear any running animations.
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

    // Add event listeners for color mode selection
    colorRandomRadio.addEventListener('change', () => {
        gradientColorPickersDiv.style.display = 'none';
    });

    colorGradientRadio.addEventListener('change', () => {
        gradientColorPickersDiv.style.display = 'block';
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

    // Helper function to convert Hex to HSL
    function hexToHsl(hex) {
        let r = 0, g = 0, b = 0;
        // 3-digit hex
        if (hex.length == 4) {
            r = "0x" + hex[1] + hex[1];
            g = "0x" + hex[2] + hex[2];
            b = "0x" + hex[3] + hex[3];
        }
        // 6-digit hex
        else if (hex.length == 7) {
            r = "0x" + hex[1] + hex[2];
            g = "0x" + hex[3] + hex[4];
            b = "0x" + hex[5] + hex[6];
        }
        r /= 255;
        g /= 255;
        b /= 255;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h * 360, s * 100, l * 100];
    }

    // Initialize gradient colors on page load
    gradientStartColor = hexToHsl(gradientStartColorInput.value);
    gradientEndColor = hexToHsl(gradientEndColorInput.value);

    // Update gradient colors when color pickers change
    gradientStartColorInput.addEventListener('input', (event) => {
        gradientStartColor = hexToHsl(event.target.value);
    });

    gradientEndColorInput.addEventListener('input', (event) => {
        gradientEndColor = hexToHsl(event.target.value);
    });
});
