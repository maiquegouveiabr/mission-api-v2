import HeaderButton from "./HeaderButton";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { TitleOption } from "@/interfaces";
import styles from "@/components/styles/HeaderButtonGroup.module.css";

interface HeaderButtonGroupProps {
  dataLoaded: boolean;
  onLoadData: () => void;
  onSetDateOrder: () => void;
  onThreePlusEvents: () => void;
  onNoEventsThreeDays: () => void;
}

function HeaderButtonGroup({ dataLoaded, onLoadData, onSetDateOrder, onThreePlusEvents, onNoEventsThreeDays }: HeaderButtonGroupProps) {
  return (
    <div className={styles.btn_container}>
      {!dataLoaded && <HeaderButton label="Load" onClick={onLoadData} upperCase />}
      {dataLoaded && <HeaderButton label={TitleOption.OPTION_4} onClick={onNoEventsThreeDays} />}
      {dataLoaded && <HeaderButton label={TitleOption.OPTION_3} onClick={onThreePlusEvents} />}
      <HeaderButton label={<SwapVertIcon />} onClick={onSetDateOrder} />
    </div>
  );
}

export default HeaderButtonGroup;
