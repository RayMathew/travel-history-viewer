import { NextResponse, NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";

// export async function GET() {
//   try {
//     const outdoorsData = await fetchOutdoorsDBData();
//     const travelData = await fetchTravelDBData();

//     return NextResponse.json({ outdoorsData, travelData }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

export async function GET(req: NextRequest) {
  const pathSegments = req.nextUrl.pathname.split("/");
  const imagename = path.basename(pathSegments[pathSegments.length - 1]);
  // let fileHandle;
  // console.log("moo", imagename);
  try {
    // Define the path to the image
    const imagePath = path.join(
      process.cwd(),
      "private",
      "images",
      `${imagename}.jpg`
    );

    console.log("moooo", imagePath);
    // Read the image file
    // const data = fs.readFileSync(imagePath);
    // console.log("test");
    // console.log("mooooooo", data);

    const stats = await fs.stat(imagePath);
    // fileHandle = await fs.open(imagePath);
    // const stream = fileHandle.readableWebStream();
    const file = await fs.readFile(imagePath);

    // Create a response with the image data and set the appropriate content-type header
    // return NextResponse.json(data, {
    //   headers: {
    //     "Content-Type": "image/jpeg",
    //   },
    // });

    return new Response(file, {
      status: 200,
      headers: {
        "content-type": "image/jpg",
        "content-length": stats.size.toString(),
        // "Cache-Control":
        //   "no-store, no-cache, must-revalidate, proxy-revalidate",
        // Pragma: "no-cache",
        // Expires: "0",
      },
    });

    // return res;
  } catch (err) {
    // Return a 500 status if there's an error reading the file
    return NextResponse.json(
      { error: "Error reading the image file" },
      { status: 500 }
    );
  } finally {
    // if (fileHandle) {
    //   await fileHandle.close();
    // }
  }
}
