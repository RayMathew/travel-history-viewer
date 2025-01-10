import { CheckboxChangeEvent } from "primereact/checkbox";
import {
  OutdoorActivity,
  TravelActivity,
  NotionData,
  FilteredNotionData,
  Coordinates,
} from "./shared";
import { TooltipOptions } from "primereact/tooltip/tooltipoptions";

// Note: NDA - Notion Data Assumption. I'm going to write NDA in all the places where I assume I haven't made a mistake while creating Notion data.

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

export type OnMarkerClick = (
  event: google.maps.MapMouseEvent,
  activities: OutdoorActivity[] | TravelActivity[] | null,
  locationName: string
) => void;

export interface CustomMapProps {
  displayData: FilteredNotionData | null;
  onMarkerClick: OnMarkerClick;
  isMilestoneMode: boolean;
}

export interface MarkerWithInfoWindowProps {
  activities: OutdoorActivity[] | TravelActivity[] | null;
  locationName: string;
  position: Coordinates;
  onMarkerClick: OnMarkerClick;
  isMobile: boolean;
  isMilestoneMode: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export type Operator = " < " | " > ";
export type OperatorNoSpaces = "<" | ">";

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
}

export interface ExternalLinkButtonProps {
  ariaLabel: string;
  link?: string;
  imgSrc: string;
  tooltipPosition?: TooltipOptions["position"];
  tooltipFallback: string;
}

export interface YearOption {
  name: number;
  value: number;
}

export type FilterOptionsPrep = {
  participant?: string;
  years?: number[];
  activityTypes?: string[];
  distance?: { operator: string; value: number };
  elevation?: { operator: string; value: number };
};

export type FilterOptions = {
  participant: string;
  years: number[];
  activityTypes: string[];
  distance: { operator: OperatorNoSpaces; value: number };
  elevation: { operator: OperatorNoSpaces; value: number };
};

export interface UserContextType {
  userName: string;
  unitOfDistance: NotionData["distanceUnit"];
  setUnitOfDistance: React.Dispatch<
    React.SetStateAction<NotionData["distanceUnit"]>
  >;
}
