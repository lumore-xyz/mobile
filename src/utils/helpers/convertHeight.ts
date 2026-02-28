const convertHeight = (cm?: number) => {
  if (!cm) return "N/A";
  const inches = Math.round(cm / 2.54);
  const feet = Math.floor(inches / 12);
  const remainderInches = inches % 12;
  return `${feet}'${remainderInches}"`;
};
export default convertHeight;
