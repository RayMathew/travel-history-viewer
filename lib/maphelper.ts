import { RAY, NAMRATA, HIKING, BIKING, TRAVEL } from "@/lib/constants";

const currentYear = new Date().getFullYear();
const defaultFilters = {
  participant: "both",
  years: [currentYear],
  activityTypes: [HIKING, BIKING, TRAVEL],
  distance: {
    operator: ">",
    value: 0,
  },
  elevation: {
    operator: ">",
    value: 0,
  },
};

const milestones = {
  [HIKING]: {
    longest: 0,
    longestInCurrentYear: 0,
    mostElevationGained: 0,
    mostElevationGainedPerUnitDistance: 0,
  },
  [BIKING]: {
    longest: 0,
    longestInCurrentYear: 0,
    mostElevationGained: 0,
    mostElevationGainedPerUnitDistance: 0,
  },
};

let milestoneData;

const operatorTranslation = {
  ">": (x: number, y: number) => x > y,
  "<": (x: number, y: number) => x < y,
};

export const getActivityImgSrc = (activityData) => {
  if (activityData.type == TRAVEL) return "/airplane.png";

  if (activityData.doneBy.includes(RAY)) {
    if (activityData.type == HIKING) return "/malewalk.png";
    return "/malebicycle.png";
  } else if (activityData.type == HIKING) return "/femalewalk.png";
  return "/femalebicycle.png";
};

export const humanReadableDate = (dateString: string): string => {
  const date = new Date(dateString);

  // Get the day, month, and year
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();

  // Add ordinal suffix to the day
  const ordinalSuffix = (n: number) => {
    const lastDigit = n % 10;
    const lastTwoDigits = n % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return `${n}th`;
    if (lastDigit === 1) return `${n}st`;
    if (lastDigit === 2) return `${n}nd`;
    if (lastDigit === 3) return `${n}rd`;
    return `${n}th`;
  };

  const dayWithSuffix = ordinalSuffix(day);

  // Return formatted date
  return `${dayWithSuffix} ${month}, ${year}`;
};

export const countActivities = (filteredData) => {
  let count = 0;
  filteredData.outdoorsData.forEach(
    (locationData) => (count += locationData.activities.length)
  );
  filteredData.travelData.forEach(
    (locationData) => (count += locationData.activities.length)
  );
  return count;
};

export const applyFiltersToMap = (
  initialLoad,
  notionData,
  filter = defaultFilters
) => {
  let filteredData;

  console.log("asds", filter);
  console.log("start filter", notionData);

  const yearFilter = (allData) => {
    const filterYears = filter.years;

    // filter activities that were done in the current year
    let outdoorsData = allData.outdoorsData.map((outdoorLocation) => {
      const filteredActivities = outdoorLocation.activities.filter(
        (activity) => {
          return filterYears.includes(new Date(activity.date).getFullYear());
        }
      );

      return {
        ...outdoorLocation,
        activities: filteredActivities,
      };
    });

    // if a location has zero activities for the filter years, remove the location from the results.

    outdoorsData = outdoorsData.filter(
      (outdoorLocation) => outdoorLocation.activities.length > 0
    );
    // console.log("modified", outdoorsData);

    let travelData = allData.travelData.map((travelLocation) => {
      const filteredTrips = travelLocation.activities.filter((activity) => {
        if (!activity.startDate) return false;

        return filterYears.includes(new Date(activity.startDate).getFullYear());
      });

      return {
        ...travelLocation,
        activities: filteredTrips,
      };
    });

    travelData = travelData.filter(
      (travelLocation) => travelLocation.activities.length > 0
    );

    // console.log("modified", travelData);

    return { outdoorsData, travelData };
  };

  const participantFilter = (allData) => {
    const filterByDoneBy = (data) => {
      const modifiedData = data.map((activityData) => {
        const filteredActivities = activityData.activities.filter(
          (activity) => {
            if (filter.participant == "both") {
              return (
                activity.doneBy.includes(RAY) ||
                activity.doneBy.includes(NAMRATA)
              );
            } else {
              return activity.doneBy.includes(filter.participant);
            }
          }
        );
        return {
          ...activityData,
          activities: filteredActivities,
        };
      });
      const filteredData = modifiedData.filter(
        (activityData) => activityData.activities.length > 0
      );
      return filteredData;
    };
    const outdoorsData = filterByDoneBy(allData.outdoorsData);
    const travelData = filterByDoneBy(allData.travelData);

    return { outdoorsData, travelData };
  };

  const activityFilter = (allData) => {
    const filterByActivityType = (data) => {
      const modifiedData = data.map((activityData) => {
        const filteredActivities = activityData.activities.filter((activity) =>
          filter.activityTypes.includes(activity.type)
        );
        return {
          ...activityData,
          activities: filteredActivities,
        };
      });
      const filteredData = modifiedData.filter(
        (activityData) => activityData.activities.length > 0
      );
      return filteredData;
    };

    const outdoorsData = filterByActivityType(allData.outdoorsData);
    const travelData = filterByActivityType(allData.travelData);

    return { outdoorsData, travelData };
  };

  const distanceFilter = (allData) => {
    if (filter.distance.operator === ">" && filter.distance.value === 0)
      return allData;
    if (filter.distance.operator === "<" && filter.distance.value === 0)
      return { outdoorsData: {}, travelData: allData.travelData };

    const distanceThreshold = filter.distance.value;
    let outdoorsData = allData.outdoorsData.map((outdoorLocation) => {
      const filteredActivities = outdoorLocation.activities.filter(
        (activity) => {
          return operatorTranslation[filter.distance.operator](
            activity.distance,
            distanceThreshold
          );
        }
      );
      return {
        ...outdoorLocation,
        activities: filteredActivities,
      };
    });

    outdoorsData = outdoorsData.filter(
      (outdoorLocation) => outdoorLocation.activities.length > 0
    );

    return { outdoorsData, travelData: allData.travelData };
  };

  const elevationFilter = (allData) => {
    if (filter.elevation.operator === ">" && filter.elevation.value === 0)
      return allData;
    if (filter.elevation.operator === "<" && filter.elevation.value === 0)
      return { outdoorsData: {}, travelData: {} };

    const elevationThreshold = filter.elevation.value;
    let outdoorsData = allData.outdoorsData.map((outdoorLocation) => {
      const filteredActivities = outdoorLocation.activities.filter(
        (activity) => {
          return operatorTranslation[filter.elevation.operator](
            activity.elevation,
            elevationThreshold
          );
        }
      );
      return {
        ...outdoorLocation,
        activities: filteredActivities,
      };
    });

    outdoorsData = outdoorsData.filter(
      (outdoorLocation) => outdoorLocation.activities.length > 0
    );

    return { outdoorsData, travelData: allData.travelData };
  };

  filteredData = yearFilter(notionData);
  // recursive function that runs the initial load filter again with the previous year if current year data is empty
  if (
    filteredData.outdoorsData.length === 0 &&
    filteredData.travelData.length === 0 &&
    initialLoad
  ) {
    return applyFiltersToMap(true, notionData, {
      ...filter,
      years: [filter.years[0] - 1],
    });
  } else {
    filteredData = participantFilter(filteredData);
    // console.log("asds", filteredData);
    filteredData = activityFilter(filteredData);
    // console.log("activityFilter", filteredData);
    filteredData = distanceFilter(filteredData);
    // console.log("distanceFilter", filteredData);
    filteredData = elevationFilter(filteredData);
    // console.log("elevationFilter", filteredData);
  }

  // console.log("asds", filteredData);
  return filteredData;
  //   return notionData;
};

export const applyMilestoneFilters = (notionData, distanceUnit: string) => {
  // we do not need to recompute the milestones every time the user asks for it.
  // the milestones also remain the same no matter who the user is.

  if (milestoneData) {
    console.log("no recompute");
    return { outdoorsData: milestoneData, travelData: [] };
  }

  if (distanceUnit === "miles") distanceUnit = "Mile";

  const outdoorsData = [];

  // get milestone numbers
  notionData.outdoorsData.forEach((outdoorLocation) => {
    outdoorLocation.activities.forEach((activityData) => {
      const typeOfActivity: typeof HIKING | typeof BIKING = activityData.type;

      if (activityData.distance > milestones[typeOfActivity].longest) {
        milestones[typeOfActivity].longest = activityData.distance;
      }
      if (
        new Date(activityData.date).getFullYear() === currentYear &&
        activityData.distance > milestones[typeOfActivity].longestInCurrentYear
      ) {
        milestones[typeOfActivity].longestInCurrentYear = activityData.distance;
      }
      if (
        activityData.elevation > milestones[typeOfActivity].mostElevationGained
      ) {
        milestones[typeOfActivity].mostElevationGained = activityData.elevation;
      }
      if (
        activityData.elevation / activityData.distance >
        milestones[typeOfActivity].mostElevationGainedPerUnitDistance
      ) {
        milestones[typeOfActivity].mostElevationGainedPerUnitDistance =
          activityData.elevation / activityData.distance;
      }
    });
  });

  const milestoneLabels = {
    [HIKING]: {
      longest: "Longest Hike",
      longestInCurrentYear: "Longest Hike This Year",
      mostElevationGained: "Most Elevation Gained Hike",
      mostElevationGainedPerUnitDistance: `Most Elevation Gained Hike Per ${distanceUnit}`,
    },
    [BIKING]: {
      longest: "Longest Bike Ride",
      longestInCurrentYear: "Longest Bike Ride This Year",
      mostElevationGained: "Most Elevation Gained Bike Ride",
      mostElevationGainedPerUnitDistance: `Most Elevation Gained Bike Ride Per ${distanceUnit}`,
    },
  };

  // get all activities that match milestone numbers
  notionData.outdoorsData.forEach((outdoorLocation) => {
    const outdoorLocationClone = {
      coordinates: outdoorLocation.coordinates,
      locationName: outdoorLocation.locationName,
      activities: [],
    };
    outdoorLocation.activities.forEach((activityData) => {
      const labels = [];
      if (activityData.type === HIKING) {
        if (activityData.distance === milestones[HIKING].longest)
          labels.push(
            `${milestoneLabels[HIKING].longest} (${milestones[
              HIKING
            ].longest.toFixed(1)}${distanceUnit === "Mile" ? " miles" : " km"})`
          );

        if (activityData.distance === milestones[HIKING].longestInCurrentYear)
          labels.push(
            `${milestoneLabels[HIKING].longestInCurrentYear} (${milestones[
              HIKING
            ].longestInCurrentYear.toFixed(1)}${
              distanceUnit === "Mile" ? " miles" : " km"
            })`
          );

        if (activityData.elevation === milestones[HIKING].mostElevationGained)
          labels.push(
            `${milestoneLabels[HIKING].mostElevationGained} (${milestones[HIKING].mostElevationGained} ft)`
          );

        if (
          activityData.elevation / activityData.distance ===
          milestones[HIKING].mostElevationGainedPerUnitDistance
        )
          labels.push(
            `${
              milestoneLabels[HIKING].mostElevationGainedPerUnitDistance
            } (${milestones[HIKING].mostElevationGainedPerUnitDistance.toFixed(
              1
            )} ft /${distanceUnit === "Mile" ? " mile" : " km"})`
          );
      } else if (activityData.type === BIKING) {
        if (activityData.distance === milestones[BIKING].longest)
          labels.push(
            `${milestoneLabels[BIKING].longest} (${milestones[
              BIKING
            ].longest.toFixed(1)}${distanceUnit === "Mile" ? " miles" : " km"})`
          );

        if (activityData.distance === milestones[BIKING].longestInCurrentYear)
          labels.push(
            `${milestoneLabels[BIKING].longestInCurrentYear} (${milestones[
              BIKING
            ].longestInCurrentYear.toFixed(1)}${
              distanceUnit === "Mile" ? " miles" : " km"
            })`
          );

        if (activityData.elevation === milestones[BIKING].mostElevationGained)
          labels.push(
            `${milestoneLabels[BIKING].mostElevationGained} (${milestones[BIKING].mostElevationGained} ft)`
          );

        if (
          activityData.elevation / activityData.distance ===
          milestones[BIKING].mostElevationGainedPerUnitDistance
        )
          labels.push(
            `${
              milestoneLabels[BIKING].mostElevationGainedPerUnitDistance
            } (${milestones[BIKING].mostElevationGainedPerUnitDistance.toFixed(
              1
            )} ft /${distanceUnit === "Mile" ? " mile" : " km"})`
          );
      }

      // check if the activity has any of the milestones
      if (labels.length) {
        //Special case where one activity has multiple milestones
        const namePrefix =
          labels.length === 1 ? labels[0] : labels.join(" AND ");

        const data = structuredClone(activityData);
        // data.locationName = `${namePrefix} - ${data.locationName} ${new Date(
        //   activityData.date
        // ).getFullYear()}`;

        data.locationName = namePrefix;

        outdoorLocationClone.activities.push(data);
      }
    });
    if (outdoorLocationClone.activities.length) {
      outdoorsData.push(outdoorLocationClone);
    }
  });

  milestoneData = outdoorsData;

  // milestones are applicable for hikes and bikes only
  return { outdoorsData, travelData: [] };
};
