// Metro configuration with aliases to shim Expo Router context on Windows
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Ensure Metro can bundle WebAssembly used by expo-sqlite on web
config.resolver.assetExts = Array.from(new Set([...(config.resolver.assetExts || []), 'wasm']));

const aliasMap = {
  'expo-router/_ctx': path.join(__dirname, 'shims', 'expo-router-ctx.js'),
  'expo-router/_ctx.web': path.join(__dirname, 'shims', 'expo-router-ctx.web.js'),
};

const previousResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (aliasMap[moduleName]) {
    return {
      type: 'sourceFile',
      filePath: aliasMap[moduleName],
    };
  }
  if (typeof previousResolveRequest === 'function') {
    return previousResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
