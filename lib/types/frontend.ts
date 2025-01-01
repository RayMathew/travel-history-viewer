import { CheckboxChangeEvent } from "primereact/checkbox";
import { OutdoorActivity, TravelActivity } from "./shared";

export interface ImageWithRadioButtonsProps {
  onChange: (value: string) => void;
  disabled: boolean;
}

export interface ImageWithCheckBoxProps {
  value: string;
  onChange: (event: CheckboxChangeEvent) => void;
  checked: boolean;
  disabled: boolean;
  imgSrc: string;
  title: string;
  inputId: string;
  size: number;
  margin: string;
}

export type Operator = " < " | " > ";

export interface ThresholdFilterProps {
  name: string;
  operator: Operator;
  onOperatorChange: (value: Operator) => void;
  operatorOptions: Operator[];
  disabled: boolean;
  threshold: number;
  onThresholdChange: (value: number) => void;
  placeholder: string | null;
  step: number;
}

export interface DetailslistProps {
  activities: OutdoorActivity[] | TravelActivity[] | null;
  milestoneMode: boolean;
  setDetailsInnerShadows: (state: string) => void;
}

export interface YearOption {
  name: number;
  value: number;
}

export type FilterOptions = {
  participant?: string;
  years?: number[];
  activityTypes?: string[];
  distance?: { operator: string; value: number };
  elevation?: { operator: string; value: number };
};
