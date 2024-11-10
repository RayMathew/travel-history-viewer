import { Client } from "@notionhq/client";
import { OUTDOOR_PROPERTIES, TRAVEL, TRAVEL_PROPERTIES } from "./constants";

let notionClient: Client | null = null;

function getNotionClient(): Client {
  if (!notionClient) {
    notionClient = new Client({ auth: process.env.NOTION_API_KEY });
  }
  return notionClient;
}

export const fetchNotionData = async () => {
  const listUsersResponse = await getNotionClient().users.list({});

  return listUsersResponse;
};

export const fetchOutdoorsDBData = async () => {
  const outdoorsData = [];
  //   console.time("outdoors data");
  const dbData = await getNotionClient().databases.query({
    database_id: process.env.NOTION_OUTDOORSDB_KEY!,
  });

  //   console.log(dbData);
  try {
    dbData.results.forEach((page) => {
      const { properties } = page;
      const type = getActivityType(
        properties[OUTDOOR_PROPERTIES.TAGS].multi_select
      );
      const { lat, lng } = getOutdoorCoordinates(
        properties[OUTDOOR_PROPERTIES.COORDINATES]
      );
      const date = properties[OUTDOOR_PROPERTIES.DATE].date.start;
      const distance = properties[OUTDOOR_PROPERTIES.DISTANCE].number;
      const doneBy = getPeople(properties[OUTDOOR_PROPERTIES.DONE_BY].people);
      const elevation = properties[OUTDOOR_PROPERTIES.ELEVATION].number;
      const name = properties[OUTDOOR_PROPERTIES.NAME].title[0].plain_text;
      const allTrailsLink = properties[OUTDOOR_PROPERTIES.ALL_TRAILS].url;
      const googlePhotosLink = properties[OUTDOOR_PROPERTIES.PHOTOS].url;
      const instagramLink = properties[OUTDOOR_PROPERTIES.INSTAGRAM].url;

      outdoorsData.push({
        type,
        coordinates: { lat, lng },
        date,
        distance,
        doneBy,
        elevation,
        name,
        allTrailsLink,
        googlePhotosLink,
        instagramLink,
      });
    });

    // console.timeEnd("outdoors data");
    // console.log(outdoorsData.toString());
  } catch (error) {
    console.log("error", error);
  }
  return outdoorsData;
};

export const fetchTravelDBData = async () => {
  const travelData = [];
  //   console.time("outdoors data");
  const dbData = await getNotionClient().databases.query({
    database_id: process.env.NOTION_TRAVELDB_KEY!,
  });

  //   console.log(dbData);
  try {
    dbData.results.forEach((page) => {
      const { properties } = page;
      //   console.log(properties);
      const startDate = properties[TRAVEL_PROPERTIES.DATE].date?.start;
      const endDate = properties[TRAVEL_PROPERTIES.DATE].date?.end;
      const people =
        properties[TRAVEL_PROPERTIES.PEOPLE].rich_text[0]?.plain_text;
      const travelStatus =
        properties[TRAVEL_PROPERTIES.TRAVEL_STATUS].status.name;
      const journalStatus =
        properties[TRAVEL_PROPERTIES.JOURNAL_STATUS].status.name;
      const coordinatesArray = getTravelCoordinates(
        properties[TRAVEL_PROPERTIES.COORDINATES].rich_text[0]
      );
      const googlePhotosLink = properties[TRAVEL_PROPERTIES.PHOTOS].url;
      const name = getDescriptiveTravelName(
        properties[TRAVEL_PROPERTIES.NAME].title[0].plain_text,
        startDate
      );
      const type = TRAVEL;

      travelData.push({
        name,
        startDate,
        endDate,
        people,
        travelStatus,
        journalStatus,
        coordinatesArray,
        googlePhotosLink,
        type,
      });
    });

    // console.timeEnd("outdoors data");
    // console.log(outdoorsData.toString());
  } catch (error) {
    console.log("error", error);
  }
  return travelData;
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
  //   console.log("peopleObjArray", peopleObjArray);
  peopleObjArray.forEach((peopleObj) => people.push(peopleObj.name));

  return people;
};

const getDescriptiveTravelName = (name, startDateString) => {
  if (!startDateString) return name;

  const dateOfTravel = new Date(startDateString);
  const travelMonth = dateOfTravel.toLocaleString("default", { month: "long" });
  const traveYear = dateOfTravel.getFullYear();

  return `${name} ${travelMonth} ${traveYear}`;
};
