const { AndroidConfig, withAndroidManifest } = require('@expo/config-plugins');

const withAndroidSingleTask = (config) =>
  withAndroidManifest(config, (config) => {
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(config.modResults);
    mainActivity.$['android:launchMode'] = 'singleTask';
    return config;
  });

module.exports = withAndroidSingleTask;
