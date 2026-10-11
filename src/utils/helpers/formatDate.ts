const formatDate = (date: Date) => {
  const dateValue = new Date(date);
  const day = String(dateValue.getDate()).padStart(2, "0");
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  const year = dateValue.getFullYear();

  return `${day}/${month}/${year}`;
};

export default formatDate;
