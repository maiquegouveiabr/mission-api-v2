import styles from "@/components/styles/EventDropdown.module.css";
import { ContactAttempt } from "@/interfaces";
import checkTimestampToday from "@/util/checkTimestampToday";
import timestampToDate from "@/util/timestampToDate";

type EventDropdownType = {
  events: ContactAttempt[];
};

export default function EventDropdown({ events }: EventDropdownType) {
  return (
    <div className={styles.mainContainer}>
      <p className={styles.title}>Events ({events.length})</p>
      <div className={styles.container}>
        {events.map((item, index) => (
          <div key={index} className={styles.itemContainer} style={{ backgroundColor: checkTimestampToday(item.itemDate) ? "#ed6c02" : "" }}>
            <p>{item.timelineItemType}</p>
            <p>{timestampToDate(item.itemDate, true)}</p>
            <p>{item.eventStatus ? "✅ Happened" : "❌ Missed"}</p>
            <p>{item.createdByUserName || "Unknown"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
