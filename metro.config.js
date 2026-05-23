const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Strip console.log/info/debug in preview/production builds
config.transformer.minifierConfig = {
  compress: {
    drop_debugger: true,
    pure_funcs: ['console.log', 'console.info', 'console.debug'],
  },
};

module.exports = config;
