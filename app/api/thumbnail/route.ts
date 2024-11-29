import { NextResponse, NextRequest } from "next/server";
import ogs from "open-graph-scraper";

export async function GET(req: NextRequest) {
  const googlePhotosLink = req.nextUrl.searchParams.get("glink");
  try {
    const data = await ogs({
      //   url: "https://www.alltrails.com/trail/us/oregon/tom-dick-and-harry-mountain-via-mirror-lake-trail-664",
      url: googlePhotosLink,
    });
    const { result } = data;
    // console.log("backend thumbnail", result.ogImage[0].url);
    return NextResponse.json(
      {
        thumbnailLink: result.ogImage[0].url,
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    return NextResponse.json({ error: err.result.error }, { status: 500 });
  }
}
