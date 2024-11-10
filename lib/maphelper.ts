import { RAY, NAMRATA, HIKING, BIKING, TRAVEL } from "@/lib/constants";

const currentYear = new Date().getFullYear();

export const getActivityImgSrc = (activityData) => {
  if (activityData.type == TRAVEL) return "/airplane.png";

  if (activityData.doneBy.includes(RAY)) {
    if (activityData.type == HIKING) return "/malewalk.png";
    return "/malebicycle.png";
  } else if (activityData.type == HIKING) return "/femalewalk.png";
  return "/femalebicycle.png";
};

export const applyFiltersToMap = (
  initialLoad,
  notionData,
  filter = { year: currentYear }
) => {
  const filterYear = filter.year;
  const outdoorsData = notionData.outdoorsData.filter((activityData) => {
    return new Date(activityData.date).getFullYear() === filterYear;
  });

  const travelData = notionData.outdoorsData.filter((activityData) => {
    if (!activityData.startDate) return false;

    return new Date(activityData.startDate).getFullYear() === filterYear;
  });

  // recursive function that runs the initial load filter again with the previous year if current year data is empty
  if (outdoorsData.length === 0 && travelData.length === 0 && initialLoad) {
    return applyFiltersToMap(true, notionData, { year: filterYear - 1 });
  }

  //   return { outdoorsData, travelData };
  return notionData;
};
