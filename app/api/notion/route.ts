import { NextRequest, NextResponse } from "next/server";
import { fetchOutdoorsDBData, fetchTravelDBData } from "@/lib/notion";
import { auth } from "@/auth";
import { DISTANCEUNIT } from "@/lib/constants";

export const GET = auth(async function GET(req: NextRequest) {
  const session = req.auth;

  if (!session)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const distanceUnit = DISTANCEUNIT[session.user.userid];

  try {
    const outdoorsData = await fetchOutdoorsDBData(distanceUnit);
    const travelData = await fetchTravelDBData();

    return NextResponse.json(
      { outdoorsData, travelData, distanceUnit },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
