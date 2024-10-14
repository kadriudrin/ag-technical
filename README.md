# Card Stacking Scene

In this scene, 144 cards move smoothly from the left stack to the right one.

## Challenges

- **Optimization for Low-End Devices:** Running Manjaro Linux with software rendering by default was a hiccup at first since I wasn't understanding why I wasn't getting ideal performance, but testing on Windows showed smooth performance even with CPU throttling.

## Solutions

- **Using `isRenderGroup: true`:** While `ParticleContainer` with `Particle` is the most optimized approach, I found that using a regular `Container` with `isRenderGroup: true` was performant enough and worked great on with CPU throttling too!

---

# Text and Images Scene

This scene randomly displays a combination of text and images/emoticons, updating every two seconds.

## Challenges

- **Positioning Text and Images Together:** Aligning text and images so they appear as a single unit.

## Solutions

- **Calculating Exact Widths:** By using the exact widths of text and image elements, I could position them precisely next to each other.

---

# Fire Particle Scene 🔥

I created a custom fire particle effect without relying on external libraries.

## Challenges

- **PixiJS v8.5 Compatibility:** Most existing particle emitter libraries were built for older PixiJS versions and didn't work with the newest PixiJS version.
- **Dynamic Properties with `ParticleContainer`:** Initially, I couldn't get dynamic properties like `alpha` and `tint` to update over time when using `ParticleContainer` with `Particle`.

## Solutions

- **Building a Custom Particle System:** I developed my own simple particle emitter using `Container` and `Sprite`.
- **Optimizing for Low Particle Count:** Since there are at most 10 sprites on the screen, using `Container` doesn't impact performance and runs smoothly with maximum CPU throttling as well.

---

# Learning Qwik

As a bonus, this was my first time using Qwik during this technical assessment!

## Challenges

- **Client-Side State Management:** Qwik is SSR by default and serializes all component state, which caused some initial hiccups.

## Solutions

- **Using `noSerialize` and `useVisibleTask`:** I overcame the state management issues by using `noSerialize` to prevent certain objects from being serialized and `useVisibleTask` for handling client-side tasks logic.

