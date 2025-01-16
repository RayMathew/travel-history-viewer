export const APPDESC =
  "An interactive map of all the hikes, bike rides, and travels that my wife and I have done.";
export const GITHUBID = "RayMathew";
export const TWITTERID = "@RayMathew_";
export const openGraphImages = [
  {
    url: "https://cdn.jsdelivr.net/gh/RayMathew/travel-history-viewer@main/imagehosting/640x335.png",
    width: 640,
    height: 335,
  },
  {
    url: "https://cdn.jsdelivr.net/gh/RayMathew/travel-history-viewer@main/imagehosting/1280x640.png",
    width: 1280,
    height: 640,
  },
  {
    url: "https://cdn.jsdelivr.net/gh/RayMathew/travel-history-viewer@main/imagehosting/200x200.png",
    width: 200,
    height: 200,
  },
  {
    url: "https://cdn.jsdelivr.net/gh/RayMathew/travel-history-viewer@main/imagehosting/600x315.png",
    width: 600,
    height: 314,
  },
  {
    url: "https://cdn.jsdelivr.net/gh/RayMathew/travel-history-viewer@main/imagehosting/1490x1490.png",
    width: 1490,
    height: 1490,
  },
  {
    url: "https://cdn.jsdelivr.net/gh/RayMathew/travel-history-viewer@main/imagehosting/2560x1280.png",
    width: 2560,
    height: 1280,
  },
];
export const RAY = "Ray Mathew";
export const NAMRATA = "Namrata Date";
export const HIKING = "Hiking";
export const BIKING = "Biking";
export const TRAVEL = "Travel";
export const APPNAME = "Memoir Map";

export const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

export const OUTDOOR_PROPERTIES = {
  TAGS: "Tags",
  COORDINATES: "Coordinates",
  DATE: "Date",
  DISTANCE: "Distance (miles)",
  DONE_BY: "Done by",
  ELEVATION: "Elevation (ft)",
  NAME: "Name",
  ALL_TRAILS: "All Trails",
  PHOTOS: "Google Photos Album",
  INSTAGRAM: "Instagram",
} as const;

export const TRAVEL_PROPERTIES = {
  NAME: "Name",
  DATE: "Date",
  PEOPLE: "People",
  DONE_BY: "Done by",
  TRAVEL_STATUS: "Travel Status",
  JOURNAL_STATUS: "Journal Status",
  PHOTOS: "Google Photos Album",
  PLACES: "Places",
  COORDINATES: "Coordinates",
  INSTAGRAM: "Instagram",
} as const;

export const SECTIONS = {
  FILTER_SECTION: 0,
  DETAILS_SECTION: 1,
} as const;

export const DISTANCEUNIT = {
  1: "km",
  2: "miles",
  3: "km",
} as const;
