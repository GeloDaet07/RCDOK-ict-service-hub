// types/css.d.ts
// Tells TypeScript that CSS files are valid side-effect imports.
// This silences the "Cannot find module for side-effect import of './globals.css'" error.

declare module '*.css' {
  const content: Record<string, string>
  export default content
}
