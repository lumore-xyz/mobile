const formatDate = (date: Date) => {
  const day = String(new Date(date)?.getDate()).padStart(2, "0"); // Day with leading zero
  const month = String(new Date(date)?.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = new Date(date)?.getFullYear();

  return `${day}/${month}/${year}`;
};

export default formatDate;
