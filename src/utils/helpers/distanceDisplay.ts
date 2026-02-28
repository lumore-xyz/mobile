const distanceDisplay = (value: number) => {
  if (value < 1) {
    return "<1km";
  } else {
    return `${Math.floor(value)}km`;
  }
};
export default distanceDisplay;
