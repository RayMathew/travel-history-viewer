import { RAY, NAMRATA, HIKING, BIKING, TRAVEL } from "@/lib/constants";

const currentYear = new Date().getFullYear();
const defaultFilters = {
  participant: "both",
  years: [currentYear],
  activityTypes: [HIKING, BIKING, TRAVEL],
};

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
  filter = defaultFilters
) => {
  let filteredData;

  console.log("asds", filter);

  const yearFilter = (allData) => {
    const filterYears = filter.years;
    const outdoorsData = allData.outdoorsData.filter((activityData) => {
      return filterYears.includes(new Date(activityData.date).getFullYear());
    });

    const travelData = allData.travelData.filter((activityData) => {
      if (!activityData.startDate) return false;

      return filterYears.includes(
        new Date(activityData.startDate).getFullYear()
      );
    });

    return { outdoorsData, travelData };
  };

  const participantFilter = (allData) => {
    const filterByDoneBy = (data) => {
      return data.filter((activityData) => {
        if (filter.participant == "both") {
          return (
            activityData.doneBy.includes(RAY) ||
            activityData.doneBy.includes(NAMRATA)
          );
        } else {
          return activityData.doneBy.includes(filter.participant);
        }
      });
    };
    const outdoorsData = filterByDoneBy(allData.outdoorsData);
    const travelData = filterByDoneBy(allData.travelData);

    return { outdoorsData, travelData };
  };

  const activityFilter = (allData) => {
    const filterByActivityType = (data) => {
      return data.filter((activityData) => {
        return filter.activityTypes.includes(activityData.type);
      });
    };

    const outdoorsData = filterByActivityType(allData.outdoorsData);
    const travelData = filterByActivityType(allData.travelData);

    return { outdoorsData, travelData };
  };

  const distanceFilter = (allData) => {
    const filterYear = filter.year;
    const outdoorsData = allData.outdoorsData.filter((activityData) => {
      return new Date(activityData.date).getFullYear() === filterYear;
    });

    const travelData = allData.travelData.filter((activityData) => {
      if (!activityData.startDate) return false;

      return new Date(activityData.startDate).getFullYear() === filterYear;
    });

    return { outdoorsData, travelData };
  };

  filteredData = yearFilter(notionData);
  console.log("asds", filteredData);
  // recursive function that runs the initial load filter again with the previous year if current year data is empty
  if (
    filteredData.outdoorsData.length === 0 &&
    filteredData.travelData.length === 0 &&
    initialLoad
  ) {
    return applyFiltersToMap(true, allData, {
      ...filter,
      year: filterYear - 1,
    });
  } else {
    filteredData = participantFilter(filteredData);
    console.log("asds", filteredData);
    filteredData = activityFilter(filteredData);
    console.log("asds", filteredData);
  }

  console.log("asds", filteredData);
  return filteredData;
  //   return notionData;
};
