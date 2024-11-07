import { NextResponse } from "next/server";
import { fetchNotionData } from "@/lib/notion";

export async function GET() {
  try {
    const data = await fetchNotionData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
