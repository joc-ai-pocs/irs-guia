/**
 * Ambient declarations for non-TS imports.
 */

/** Side-effect CSS imports — Vite handles bundling. */
declare module '*.css';

/** Vite ?raw suffix — file contents as a string. */
declare module '*.md?raw' {
  const content: string;
  export default content;
}
