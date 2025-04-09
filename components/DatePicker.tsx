import { useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker as Picker } from "@mui/x-date-pickers/DatePicker";
import styles from "@/components/styles/DatePicker.module.css";
import dayjs, { Dayjs } from "dayjs";

interface DatePickerProps {
  onDateChange: (date: Dayjs | null) => void;
  dataLoaded: boolean;
  value: Dayjs | null;
}

function DatePicker({ onDateChange, dataLoaded, value }: DatePickerProps) {
  const handleDateChange = (newValue: Dayjs | null) => {
    onDateChange(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={styles.picker_container}>
        <Picker
          disabled={!dataLoaded}
          value={value}
          onChange={handleDateChange}
          label="Filter by date"
          format="D/M/YYYY"
          slotProps={{
            textField: { size: "small", focused: true, color: "secondary", style: { width: "fit-content" } },
          }}
        />
        <button className={styles.btn} onClick={() => handleDateChange(null)} disabled={!dataLoaded}>
          Clear
        </button>
      </div>
    </LocalizationProvider>
  );
}

export default DatePicker;
