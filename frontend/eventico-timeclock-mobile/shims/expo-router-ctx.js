// Shim for Expo Router context to normalize Windows paths to POSIX so Metro can glob routes.
// Mirrors node_modules/expo-router/_ctx.js
// NOTE: Metro requires the first argument to be a string literal.
// Use a static relative path from node_modules/expo-router to the project app directory.
// node_modules/expo-router -> project root -> app
export const ctx = require.context(
  '../app',
  true,
  /^(?:\.\/)(?!(?:(?:(?:.*\+api)|(?:\+html)))\.[tj]sx?$).*\.[tj]sx?$/
);
