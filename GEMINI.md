我想部署一个github pages，这个pages用来展示打字机效果，希望用比较简单的代码展示打字机的不同JS实现，最好可以让用户自定义输入，然后就展示相应的打字机效果。此外，打字的时候如果可以让字体的颜色发生五彩斑斓的变化就更好了。



## Future Plan
1. Implement a real-time typewriter effect that tracks user input (insertions and deletions) in the textarea and updates the animation as they type.
2. Enhance the user experience by implementing a fade-out animation for the previous typewriter text when a new typing effect is initiated, instead of an abrupt clear. This would involve CSS transitions/animations and JavaScript event listeners to synchronize the fade-out with the start of the new typing.
3. Improve the colorful text effect by:
  1. Implementing a smoother color transition for each character (e.g., using CSS transitions or by animating HSL color values).
  2. Limiting the random colors to a curated palette of light, pleasant colors (e.g., red, yellow, light blue, green, pink) to ensure better readability and a more consistent aesthetic.
