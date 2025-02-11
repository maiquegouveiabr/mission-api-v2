import * as React from "react";
import { Theme, useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name: string, personName: string[], theme: Theme) {
  return {
    fontWeight: personName.includes(name) ? theme.typography.fontWeightMedium : theme.typography.fontWeightRegular,
  };
}

interface SelectorProps {
  inputLabel: string;
  data: any[];
  currentValue: number;
  onChange: (event: SelectChangeEvent<number>) => void;
}

export default function Selector({ onChange, inputLabel, data, currentValue }: SelectorProps) {
  const theme = useTheme();

  return (
    <div>
      <FormControl sx={{ width: "100%" }}>
        <InputLabel required id="demo-multiple-name-label">
          {inputLabel}
        </InputLabel>
        <Select
          labelId="demo-multiple-name-label"
          id="demo-multiple-name"
          value={currentValue}
          onChange={onChange}
          input={<OutlinedInput label="Name" />}
          MenuProps={MenuProps}
        >
          {data.map((area) => (
            <MenuItem
              key={area.id}
              value={area.id}
              style={getStyles(
                area.name,
                data.map((area) => area.name),
                theme
              )}
            >
              {area.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
