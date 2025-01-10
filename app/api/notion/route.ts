import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import etag from "etag";
import { fetchOutdoorsDBData, fetchTravelDBData } from "@/lib/notion";
import { DISTANCEUNIT } from "@/lib/constants";

export const GET = auth(async function GET(req: NextRequest) {
  const session = req.auth;

  if (!session)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const distanceUnit = DISTANCEUNIT[session.user.userid];

  try {
    const isAdminUser = session.user.userid === 1 || session.user.userid === 2;

    const outdoorsData = await fetchOutdoorsDBData(distanceUnit, isAdminUser);
    const travelData = await fetchTravelDBData(isAdminUser);
    const consolidatedResponse = { outdoorsData, travelData, distanceUnit };

    const generatedETag = etag(JSON.stringify(consolidatedResponse));
    const clientETag = req.headers.get("If-None-Match");

    // Respond with 304 if ETags match (client can use cached version)
    if (clientETag === generatedETag) {
      return new Response(null, {
        status: 304,
      });
    }

    return NextResponse.json(consolidatedResponse, {
      status: 200,
      headers: {
        ETag: generatedETag,
        "Cache-Control": "private, max-age=60, must-revalidate",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}) as any;
