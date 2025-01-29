// eslint-disable-next-line import/no-anonymous-default-export
export default (timestamp: number, timeIncluded: boolean) => {
  const offset = -3 * 60 * 60 * 1000; //(GMT-3)
  const date = new Date(timestamp + offset);
  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = date.getFullYear();
  if (timeIncluded) {
    const minutes = `${date.getMinutes()}`.padStart(2, "0");
    const hour = `${date.getHours()}`.padStart(2, "0");
    return `${month}/${day}/${year} ${hour}:${minutes}`;
  } else {
    return `${month}/${day}/${year}`;
  }
};
