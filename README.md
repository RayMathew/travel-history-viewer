<img width="100" alt="Screenshot" src="https://cdn.jsdelivr.net/gh/RayMathew/travel-history-viewer@main/imagehosting/200x200.png" align="right" style="margin-left:20px">

<br>

# Memoir Map (travel-history-viewer)

A web app showcasing all the places my wife and I have hiked, biked and traveled to over the years. Built with Next.js, Notion API, Google Maps API, and TailwindCSS. Deployed on Vercel.

### Links

- [Live app](https://travel-history-viewer.vercel.app) (login as a Guest)
- [How I built it] Medium link
- [Discussions](https://github.com/RayMathew/travel-history-viewer/discussions)

## Features

- **Interactive Map**: Visual representation of our activities using Google Maps, with filters like distance hiked / biked,  elevation gained and year(s).
- **Notion Integration**: The data comes from 2 Notion databases (templates linked below), fetched in the backend using Notion API, and sent as an aggregrated result to the UI.
- **Caching**: The web app makes aggressive use of 3 types of caching (browser local storage, Etag, and cache-control) to reduce network load and server cost, given that the data is updated only a couple dozen times a year.
- **External Links**: Each activity card has links to other platforms - Google Photos, AllTrails, a Notion journal entry and Instagram.

- **Security**: The web app uses Auth.js for authentication and session validation. Since there are only 3 users (my wife, me and 'Guest'), the username and password are stored as encrypted environment variables, as opposed to in a database.

## Notion Templates

I'm an avid user of Notion. I had already created two databases for recording our travels and outdoor activities before the idea of this app came to  mind. I added a few properties like 'Coordinates' to make them work with Google Maps.

Why **two**? I felt that travelling and sight-seeing are higher value and rarer experiences than activities like a half-day hike, and so, they deserved their own database. Also, the latter activities have unique stats that we wanted to track. E.g.: steepest hike, cumulative distance biked in a year, etc.

Feel free to reuse the templates for your own purposes as well:
- [Travel DB Template](https://raymathew.notion.site/Travel-Database-Template-17b8f10128468039b99cec9ada58cdd9?pvs=4)
- [Outdoors DB Template](https://raymathew.notion.site/Outdoors-Template-17b8f101284680fa8a9cc4d8d5be5707?pvs=4)

## Tech stack

|                     |               |
|---------------------|---------------|
| Language            | TypeScript    |
| Framework           | [Next.js v15.1.4](https://nextjs.org/docs) |
| Data                | [Notion API (client v2.2)](https://developers.notion.com)    |
|Security|[Auth.js (a.k.a next-auth.js v5 beta)](https://authjs.dev/)|
| Styling Framework   | [Tailwind CSS v3.4.1](https://tailwindcss.com/)  |
| UI Components   | [PrimeReact v10.8.4](https://primereact.org/)  |
| Hosting Platform    | [Vercel](https://vercel.com/)        |

## Running locally

An easy setup - install with package.json and add a few environment variables.

    git clone https://github.com/RayMathew/travel-history-viewer.git
    cd travel-history-viewer
    npm install 

Create a `.env.local` file in the root directory with the following keys:

- `NOTION_API_KEY`.
  - Get it from [here](https://www.notion.so/profile/integrations). You'll need a Notion account. Most of its features needed for personal use are free. If you don't already have an account, consider using my referral (https://affiliate.notion.so/ray-notion-referral). It reduces my subscription cost.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
  - Get it from [here](https://cloud.google.com/). 
  - You'll need to create a project, enable Google Maps API, and allow the website 'http://localhost:3000" while creating the API key.
  - If you want to run it on your computer and test it from your phone add Websites -> `http://<your computer IP>:3000`, or IP Addresses -> CIDR format, for multiple devices and rotating IPs.
- `NOTION_OUTDOORSDB_KEY`, `NOTION_TRAVELDB_KEY`.
  - Assuming you have imported the two Notion templates into your account, go to one of them -> Click on context menu of the table (the 6 dots when you over hover over the top of the table) -> Open as page -> Share (top right of page) -> Copy link.
  - Get the DB key from the link, which is in the format `https://www.notion.so/<notion_username>/<name_of_db>-<YOUR_DB_KEY>?v=...&pvs=4`
- `AUTH_SECRET`.
  - This is needed by Auth.js. You can generate your own, or use [this](https://generate-secret.vercel.app/32).
- `USERNAME1`.
  - The primary user. Use email or random characters.
- `PASSWORD1`
  - Use a bcrypt generator like [this one](https://bcrypt-generator.com/).
  - I have accounted for 2 primary users (my wife and me). All other users are 'Guests' and don't require a password. If you want more than 2 primary users you'll need to modify the code in _root -> auth.ts_.

Finally, run `npm run dev`.

## Roadmap

1. Add a 'Stats' screen that gives details like "lifetime distance hiked", "highest peak summited", bar charts of bike rides per year, etc.
2. Add a screen to show planned trips. The Travel DB already has this data.
3. Add a fuzzy search feature to find an activity by name or year instead of sifting through all the data with filters.
4. Add other activities. e.g.: multiple day treks, snowshoeing.

## License

This project is licensed under the terms of the [GNU General Public License](https://www.gnu.org/licenses/gpl-3.0.en.html).
