I want to deploy a GitHub Pages site that showcases a typewriter effect. I hope to demonstrate different JavaScript implementations of the typewriter effect using relatively simple code. Ideally, users should be able to input custom text, and then see the corresponding typewriter effect. Additionally, it would be even better if the text color could change in a dazzling array of colors as it's being typed.

## DONE
- **Improve the colorful text effect by:** Limiting the random colors to a curated palette of light, pleasant colors (e.g., red, yellow, light blue, green, pink) to ensure better readability and a more consistent aesthetic.
- **Improve the colorful text effect by:**
  - Implementing a smoother color transition for each character (e.g., using CSS transitions or by animating HSL color values).

## Future Plan
1. Implement a real-time typewriter effect that tracks user input (insertions and deletions) in the textarea and updates the animation as they type.
2. Enhance the user experience by implementing a fade-out animation for the previous typewriter text when a new typing effect is initiated, instead of an abrupt clear. This would involve CSS transitions/animations and JavaScript event listeners to synchronize the fade-out with the start of the new typing.
