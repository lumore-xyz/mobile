module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      ...(process.env.GOOGLE_MAPS_ANDROID_KEY ? {
        googleMaps: {
          ...config.android?.config?.googleMaps,
          apiKey: process.env.GOOGLE_MAPS_ANDROID_KEY,
        },
      } : {}),
    },
  },
  extra: {
    ...config.extra,
    googleMapsConfigured: Boolean(process.env.GOOGLE_MAPS_ANDROID_KEY),
  },
});
