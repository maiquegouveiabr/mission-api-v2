// eslint-disable-next-line import/no-anonymous-default-export
export default (timestamp: number): boolean => {
  const inputDate = new Date(timestamp);
  const today = new Date();

  return (
    inputDate.getFullYear() === today.getFullYear() && inputDate.getMonth() === today.getMonth() && inputDate.getDate() === today.getDate()
  );
};
