import { NextResponse } from "next/server";
import { fetchOutdoorsDBData, fetchTravelDBData } from "@/lib/notion";

export async function GET() {
  try {
    const outdoorsData = await fetchOutdoorsDBData();
    const travelData = await fetchTravelDBData();

    return NextResponse.json({ outdoorsData, travelData }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
