// Shim for Expo Router web context to normalize Windows paths to POSIX so Metro can glob routes.
// Mirrors node_modules/expo-router/_ctx.web.js
// NOTE: Metro requires the first argument to be a string literal.
// Use a static relative path from node_modules/expo-router to the project app directory.
export const ctx = require.context(
  '../app',
  true,
  /^(?:\.\/)(?!(?:(?:(?:.*\+api)|(?:\+(html|native-intent))))\.[tj]sx?$).*(?:\.android|\.ios|\.native)?\.[tj]sx?$/,
  process.env.EXPO_ROUTER_IMPORT_MODE
);
