import { Client } from "@notionhq/client";

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
      const type = getActivityType(properties["Tags"].multi_select);
      const { lat, lng } = getCoordinates(properties["Coordinates"]);
      const date = properties["Date"].date.start;
      const distance = properties["Distance (miles)"].number;
      const doneBy = getPeople(properties["Done by"].people);
      const elevation = properties["Elevation (ft)"].number;
      const name = properties["Name"].title[0].plain_text;
      const allTrailsLink = properties["All Trails"].url;
      const googlePhotosLink = properties["Google Photos Album"].url;
      const instagramLink = properties["Instagram"].url;

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

const getActivityType = (tagArray): string => {
  const tag = tagArray.find(
    (tagObject) => tagObject.name == "Hiking" || tagObject.name == "Biking"
  );
  return tag.name;
};

const getCoordinates = (coordinatesObj) => {
  const lat = parseFloat(coordinatesObj.rich_text[0].plain_text.split(",")[0]);
  const lng = parseFloat(
    coordinatesObj.rich_text[0].plain_text.split(",")[1].trim()
  );

  return { lat, lng };
};

const getPeople = (peopleObjArray) => {
  const people: string[] = [];
  //   console.log("peopleObjArray", peopleObjArray);
  peopleObjArray.forEach((peopleObj) => people.push(peopleObj.name));

  return people;
};
