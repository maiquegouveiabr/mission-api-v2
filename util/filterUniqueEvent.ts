import { ContactAttempt } from "@/interfaces";

// eslint-disable-next-line import/no-anonymous-default-export
export default (events: ContactAttempt[]) => {
  const eventDays = new Set();
  return events.filter(({ itemDate }) => {
    const date = new Date(itemDate);
    const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (eventDays.has(dayKey)) return false;
    eventDays.add(dayKey);
    return true;
  });
};
