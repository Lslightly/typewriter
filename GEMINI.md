I want to deploy a GitHub Pages site that showcases a typewriter effect. I hope to demonstrate different JavaScript implementations of the typewriter effect using relatively simple code. Ideally, users should be to input custom text, and then see the corresponding typewriter effect. Additionally, it would be even better if the text color could change in a dazzling array of colors as it's being typed.

## DONE
- **Added animation duration control:** Implemented a slider to allow users to dynamically adjust the duration of the color animation.
- **Added typing interval control:** Implemented a slider to allow users to dynamically adjust the typing interval (in ms) of the typewriter effect. Added "Fast" and "Slow" hints for better usability.
- **Implemented a two-stage timer-based gradient effect:** In the first half of the animation duration, each character individually animates from a user-defined start color to an end color. In the second half, it animates from the end color to black.
- **Improve the colorful text effect by:** Limiting the random colors to a curated palette of light, pleasant colors (e.g., red, yellow, light blue, green, pink) to ensure better readability and a more consistent aesthetic.
- **Improve the colorful text effect by:**
  - Implementing a smoother color transition for each character (e.g., using CSS transitions or by animating HSL color values).
- Enhance the user experience by implementing a fade-out animation for the previous typewriter text when a new typing effect is initiated, instead of an abrupt clear. This would involve CSS transitions/animations and JavaScript event listeners to synchronize the fade-out with the start of the new typing.
- **Implement a real-time typewriter effect** that tracks user input (insertions and deletions) in the textarea and updates the animation as they type. This included:
  - Refactoring for Real-time Mode Activation.
  - Implementing an Input Event Listener.
  - Developing a String Diffing Algorithm.
  - Implementing Real-time DOM Updates for insertions and deletions.
  - Integrating the existing color cycling and black-out effects.
  - Managing concurrent effects and UI states between manual and real-time modes.

## Lessons Learned
- **Bug Analysis (Typing Speed-Up):** A bug was discovered where repeatedly clicking "Start Typing" would accelerate the typing speed. The root cause was that new `setTimeout` loops (workers) were being created without clearing the old ones. These multiple concurrent workers all read from and advanced the same shared `charIndex` variable. This meant that within a single `typingSpeed` interval, multiple workers would each write a character, causing the typing speed to multiply.
- **Solution:** The fix was to ensure any active `setTimeout` timer is explicitly cancelled using `clearTimeout()` before a new animation starts. This guarantees that only one "worker" is active at any given time, maintaining a consistent speed. This highlights the importance of managing asynchronous timers properly.
- **Refinement of Random Color Animation:** A challenge was encountered in making the random color mode both dynamic and visually pleasing.
  - **Problem 1: No visible change.** Initially, a CSS transition on the `color` property was preventing the rapid, per-frame color updates from `requestAnimationFrame` from being visible. The transition was always being interrupted and reset.
  - **Problem 2: Flickering too fast.** Disabling the CSS transition fixed the visibility issue but resulted in colors changing too rapidly (at the browser's refresh rate), creating a jarring effect.
  - **Solution: Throttling with CSS Transitions.** The final solution involved two parts:
    1.  Re-enabling the CSS `color` transition in `style.css`.
    2.  Throttling the color change updates in `script.js`. Instead of changing the color on every frame, a `lastColorChangeTime` and a randomized `colorChangeInterval` were introduced for each character. This ensures that the color is only updated after a certain delay, allowing the CSS transition to complete smoothly, resulting in a more pleasant, less frantic color-shifting effect.
