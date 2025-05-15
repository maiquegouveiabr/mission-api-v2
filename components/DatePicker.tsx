import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker as Picker } from "@mui/x-date-pickers/DatePicker";
import styles from "@/components/styles/DatePicker.module.css";
import { Dayjs } from "dayjs";
import { Button } from "./ui/button";

interface DatePickerProps {
  onClear: () => void;
  onDateChange: (date: Dayjs | null) => void;
  dataLoaded: boolean;
  value: Dayjs | null;
}

function DatePicker({ onClear, onDateChange, dataLoaded, value }: DatePickerProps) {
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
        <Button
          className="rounded-sm font-bold text-[#FFFFFF] bg-[#6e4d1d] hover:bg-[#6e4d1d] hover:text-[#FFFFFF] p-3 mt-3 transition-none font-['Poppins',Helvetica]"
          onClick={onClear}
          variant="ghost"
        >
          Clear
        </Button>
      </div>
    </LocalizationProvider>
  );
}

export default DatePicker;
