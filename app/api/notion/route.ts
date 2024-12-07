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
    const isAdminUser: boolean =
      session.user.userid === 1 || session.user.userid === 2;

    const outdoorsData = await fetchOutdoorsDBData(distanceUnit, isAdminUser);
    const travelData = await fetchTravelDBData(isAdminUser);

    return NextResponse.json(
      { outdoorsData, travelData, distanceUnit },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}) as any;
