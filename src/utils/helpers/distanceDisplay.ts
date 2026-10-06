import formatNumber from "./formatNumber";

const distanceDisplay = (value: number) => {
  if (value < 1) {
    return "<1km";
  } else {
    return `${formatNumber(Math.floor(value))}km`;
  }
};
export default distanceDisplay;
