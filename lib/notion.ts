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
