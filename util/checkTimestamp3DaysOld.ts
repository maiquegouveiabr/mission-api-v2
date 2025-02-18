export default function (timestamp: Date | string | number): boolean {
  const givenDate = new Date(timestamp);
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  return givenDate <= threeDaysAgo;
}
