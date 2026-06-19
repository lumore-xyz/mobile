const {
  AndroidConfig,
  withAndroidColors,
  withAndroidColorsNight,
} = require("@expo/config-plugins");

const LIGHT_CROP_COLORS = {
  expoCropToolbarColor: "#ffffff",
};

const DARK_CROP_COLORS = {
  expoCropToolbarColor: "#ffffff",
  expoCropToolbarIconColor: "#000000",
  expoCropToolbarActionTextColor: "#000000",
  expoCropBackButtonIconColor: "#000000",
};

function assignColors(resources, colors) {
  return Object.entries(colors).reduce(
    (result, [name, value]) =>
      AndroidConfig.Colors.assignColorValue(result, { name, value }),
    resources,
  );
}

module.exports = function withExpoImagePickerCropTheme(config) {
  config = withAndroidColors(config, (androidConfig) => {
    androidConfig.modResults = assignColors(
      androidConfig.modResults,
      LIGHT_CROP_COLORS,
    );
    return androidConfig;
  });

  return withAndroidColorsNight(config, (androidConfig) => {
    androidConfig.modResults = assignColors(
      androidConfig.modResults,
      DARK_CROP_COLORS,
    );
    return androidConfig;
  });
};
