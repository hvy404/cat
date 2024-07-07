import { init } from "@paralleldrive/cuid2";

/**
 * Generates a unique identifier using the cuid library.
 * @returns {string} The generated unique identifier.
 */
const createId = init({
  random: () => {
    const buffer = new Uint8Array(1);
    if (typeof crypto !== "undefined") {
      crypto.getRandomValues(buffer);
    } else {
      // This won't not happen in Next.js, but it's here as a safeguard
      console.warn(
        "Crypto API not available. Using Math.random as fallback. Review environment changes immediately."
      );
      buffer[0] = Math.floor(Math.random() * 256);
    }
    return buffer[0] / 255;
  },
  length: 24,
});

export default createId;

// Example usage
// const newId = createId();
