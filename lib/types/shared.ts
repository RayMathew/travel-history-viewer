type OutdoorActivityType = "Hiking" | "Biking";
type TravelActivityType = "Travel";
type TravelStatus = "Idea" | "Not started" | "Planning" | "Booked" | "Visited";
type JournalStatus = "Not started" | "In Progress" | "Complete";
type DateString = `${number}-${number}-${number}`;

export type OutdoorActivity = {
  type: OutdoorActivityType;
  locationName: string;
  instagramLink?: string;
  googlePhotosLink?: string;
  allTrailsLink?: string;
  elevation: number;
  doneBy: string[];
  distance: number;
  date: DateString;
  activityName: string;
};

export type OutdoorsData = {
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  activities: OutdoorActivity[];
};

export type TravelActivity = {
  type: TravelActivityType;
  instagramLink?: string;
  googlePhotosLink?: string;
  journalLink?: string;
  travelStatus: TravelStatus;
  journalStatus: JournalStatus;
  doneBy: string[];
  people?: string;
  places: string[];
  startDate?: DateString;
  endDate?: DateString;
  activityName: string;
};

export type TravelData = {
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  activities: TravelActivity[];
};

export type NotionData = {
  outdoorsData: OutdoorsData[];
  travelData: TravelData[];
  distanceUnit: "km" | "miles";
};

export type FilteredNotionData = {
  outdoorsData: OutdoorsData[];
  travelData: TravelData[];
};
