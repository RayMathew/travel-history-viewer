import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import ogs from "open-graph-scraper";

export const GET = auth(async function GET(req: NextRequest) {
  const session = req.auth;

  if (!session)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const googlePhotosLink = req.nextUrl.searchParams.get("glink");
  if (!googlePhotosLink) {
    return NextResponse.json({ error: "missing glink" }, { status: 400 });
  }

  try {
    const data = await ogs({
      url: googlePhotosLink,
    });
    const { result } = data;

    return NextResponse.json(
      {
        thumbnailLink: result?.ogImage[0]?.url,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}) as any;
