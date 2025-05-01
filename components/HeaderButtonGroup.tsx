import SwapVertIcon from "@mui/icons-material/SwapVert";
import { TitleOption } from "@/interfaces";
import { Button } from "./ui/button";

interface HeaderButtonGroupProps {
  dataLoaded: boolean;
  onLoadData: () => void;
  onSetDateOrder: () => void;
  onThreePlusEvents: () => void;
  onNoEventsThreeDays: () => void;
}

function HeaderButtonGroup({ dataLoaded, onLoadData, onSetDateOrder, onThreePlusEvents, onNoEventsThreeDays }: HeaderButtonGroupProps) {
  return (
    <div className="w-fit flex flex-col gap-1 items-end">
      {!dataLoaded && (
        <Button
          className="min-w-[80px] p-1 bg-white text-[#364153] font-semibold rounded-sm hover:bg-white hover:text-[#364153] transition-none"
          onClick={onLoadData}
          variant="ghost"
        >
          LOAD
        </Button>
      )}
      {dataLoaded && (
        <Button
          className="w-fit text-xs p-1 bg-white text-[#364153] font-semibold rounded-sm hover:bg-white hover:text-[#364153] transition-none"
          onClick={onNoEventsThreeDays}
          variant="ghost"
        >
          {TitleOption.OPTION_4}
        </Button>
      )}
      {dataLoaded && (
        <Button
          className="w-fit text-xs p-1 bg-white text-[#364153] font-semibold rounded-sm hover:bg-white hover:text-[#364153] transition-none"
          onClick={onThreePlusEvents}
          variant="ghost"
        >
          {TitleOption.OPTION_3}
        </Button>
      )}
      <Button
        className="w-fit p-1 bg-white text-[#364153] font-semibold rounded-sm hover:bg-white hover:text-[#364153] transition-none"
        onClick={onSetDateOrder}
        variant="ghost"
      >
        <SwapVertIcon />
      </Button>
    </div>
  );
}

export default HeaderButtonGroup;
