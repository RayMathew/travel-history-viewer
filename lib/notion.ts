import { Client } from "@notionhq/client";
import {
  BIKING,
  DISTANCEUNIT,
  HIKING,
  OUTDOOR_PROPERTIES,
  TRAVEL,
  TRAVEL_PROPERTIES,
} from "./constants";
import { removeNullValues } from "./datahelper";
import { OutdoorsData, TravelData } from "./types/shared";

let notionClient: Client | null = null;

function getNotionClient(): Client {
  if (!notionClient) {
    notionClient = new Client({ auth: process.env.NOTION_API_KEY });
  }
  return notionClient;
}

export const fetchOutdoorsDBData = async (
  distanceUnit: string,
  isAdminUser: boolean
): Promise<OutdoorsData[]> => {
  //   const outdoorsData = [];
  const groupedData = new Map();
  //   console.time("outdoors data");

  try {
    const dbData = await getNotionClient().databases.query({
      database_id: process.env.NOTION_OUTDOORSDB_KEY!,
    });

    //   console.log(dbData);

    dbData.results.forEach((page) => {
      const { properties } = page;
      const type = getActivityType(
        properties[OUTDOOR_PROPERTIES.TAGS].multi_select
      );
      const { lat, lng } = getOutdoorCoordinates(
        properties[OUTDOOR_PROPERTIES.COORDINATES]
      );
      const date = properties[OUTDOOR_PROPERTIES.DATE].date.start;
      const distance = getDistance(
        properties[OUTDOOR_PROPERTIES.DISTANCE].number,
        distanceUnit
      );
      const doneBy = getPeople(properties[OUTDOOR_PROPERTIES.DONE_BY].people);
      const elevation = properties[OUTDOOR_PROPERTIES.ELEVATION].number;
      const locationName =
        properties[OUTDOOR_PROPERTIES.NAME].title[0].plain_text;
      const allTrailsLink = properties[OUTDOOR_PROPERTIES.ALL_TRAILS].url;
      const instagramLink = properties[OUTDOOR_PROPERTIES.INSTAGRAM].url;
      const activityName = getDescriptiveActivityName(type, date);

      let googlePhotosLink = null;
      if (isAdminUser) {
        googlePhotosLink = properties[OUTDOOR_PROPERTIES.PHOTOS].url;
      }
      // const googlePhotosLink = properties[OUTDOOR_PROPERTIES.PHOTOS].url;

      const coordinateKey = `${lat},${lng}`;

      const activity = removeNullValues({
        type,
        date,
        distance,
        doneBy,
        elevation,
        locationName,
        allTrailsLink,
        googlePhotosLink,
        instagramLink,
        activityName,
      });

      // group data if they are in same location
      if (groupedData.has(coordinateKey)) {
        groupedData.get(coordinateKey).activities.push(activity);
      } else {
        groupedData.set(coordinateKey, {
          coordinates: { lat, lng },
          locationName,
          activities: [activity],
        });
      }
    });
  } catch (error) {
    console.log("error", error);
  }

  // convert map to array
  return [...groupedData.values()];
};

export const fetchTravelDBData = async (
  isAdminUser: boolean
): Promise<TravelData[]> => {
  //   const travelData = [];
  const groupedData = new Map();

  try {
    const dbData = await getNotionClient().databases.query({
      database_id: process.env.NOTION_TRAVELDB_KEY!,
    });

    dbData.results.forEach((page) => {
      const { properties, url } = page;
      const startDate = properties[TRAVEL_PROPERTIES.DATE].date?.start;
      const endDate = properties[TRAVEL_PROPERTIES.DATE].date?.end;
      const people =
        properties[TRAVEL_PROPERTIES.PEOPLE].rich_text[0]?.plain_text;
      const doneBy = getPeople(properties[TRAVEL_PROPERTIES.DONE_BY].people);
      const travelStatus =
        properties[TRAVEL_PROPERTIES.TRAVEL_STATUS].status.name;
      const journalStatus =
        properties[TRAVEL_PROPERTIES.JOURNAL_STATUS].status.name;
      const places = getAllPlaces(
        properties[TRAVEL_PROPERTIES.PLACES].rich_text[0]
      );
      const coordinatesArray = getTravelCoordinates(
        properties[TRAVEL_PROPERTIES.COORDINATES].rich_text[0]
      );
      const instagramLink = properties[OUTDOOR_PROPERTIES.INSTAGRAM].url;
      const activityName = getDescriptiveActivityName(
        properties[TRAVEL_PROPERTIES.NAME].title[0].plain_text,
        startDate
      );

      let googlePhotosLink = null;
      let journalLink = null;
      if (isAdminUser) {
        googlePhotosLink = properties[OUTDOOR_PROPERTIES.PHOTOS].url;
        journalLink = url;
      }
      // const googlePhotosLink = properties[TRAVEL_PROPERTIES.PHOTOS].url;

      const type = TRAVEL;

      const activity = removeNullValues({
        startDate,
        endDate,
        people,
        doneBy,
        travelStatus,
        journalStatus,
        googlePhotosLink,
        instagramLink,
        journalLink,
        activityName,
        places,
        type,
      });

      // Add this trip to the list for the current coordinate
      coordinatesArray.forEach(({ lat, lng }, index) => {
        const coordinateKey = `${lat},${lng}`;

        if (groupedData.has(coordinateKey)) {
          groupedData.get(coordinateKey).activities.push(activity);
        } else {
          groupedData.set(coordinateKey, {
            coordinates: { lat, lng },
            locationName: places[index], // Notion data was set to match the location name and the places array index
            activities: [activity],
          });
        }
      });

      //If a trip doesn't have a coordinate, it is still a plan. Add it separately.
      if (coordinatesArray.length === 0) {
        const coordinateKey = `(no coordinates)`;
        if (groupedData.has(coordinateKey)) {
          groupedData.get(coordinateKey).activities.push(activity);
        } else {
          groupedData.set(coordinateKey, {
            locationName: "Future Trips",
            activities: [activity],
          });
        }
      }
    });
  } catch (error) {
    console.log("error", error);
  }
  return [...groupedData.values()];
};

const getDistance = (value: number, distanceUnit: string) => {
  if (distanceUnit === DISTANCEUNIT[2]) return value;

  return parseFloat((value * 1.6).toFixed(1)); // convert default miles value to km
};

const getActivityType = (tagArray): string => {
  const tag = tagArray.find(
    (tagObject) => tagObject.name == "Hiking" || tagObject.name == "Biking"
  );
  return tag.name;
};

const getOutdoorCoordinates = (coordinatesObj) => {
  const lat = parseFloat(coordinatesObj.rich_text[0].plain_text.split(",")[0]);
  const lng = parseFloat(
    coordinatesObj.rich_text[0].plain_text.split(",")[1].trim()
  );

  return { lat, lng };
};

const getAllPlaces = (placesObj) => {
  if (!placesObj) return [];

  return placesObj.plain_text.split(", ");
};

const getTravelCoordinates = (coordinatesObj) => {
  const coordinatesArray = [];

  if (!coordinatesObj) return coordinatesArray;

  const coordinatesStringArray = coordinatesObj.plain_text.split("\n");

  coordinatesStringArray.forEach((coordinatesString) => {
    const lat = parseFloat(coordinatesString.split(",")[0]);
    const lng = parseFloat(coordinatesString.split(",")[1].trim());
    coordinatesArray.push({ lat, lng });
  });

  return coordinatesArray;
};

const getPeople = (peopleObjArray) => {
  const people: string[] = [];
  peopleObjArray.forEach((peopleObj) => people.push(peopleObj.name));

  return people;
};

const getDescriptiveActivityName = (
  name: string,
  startDateString: string
): string => {
  if (!startDateString) return name;

  const dateOfTravel = new Date(startDateString);
  const day = dateOfTravel.getDate();
  const travelMonth = dateOfTravel.toLocaleString("default", { month: "long" });
  const traveYear = dateOfTravel.getFullYear();

  if (name === HIKING || name === BIKING) {
    return `${name} (${day} ${travelMonth.slice(0, 3)} ${traveYear})`;
  }

  return `${name} (${travelMonth.slice(0, 3)} ${traveYear})`;
};
