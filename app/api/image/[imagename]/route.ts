import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import fs from "fs/promises";
import path from "path";

export const GET = auth(async function GET(req: NextRequest) {
  const session = req.auth;

  if (!session)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const pathSegments = req.nextUrl.pathname.split("/");
  const imagename = path.basename(pathSegments[pathSegments.length - 1]);
  try {
    // Define the path to the image
    const imagePath = path.join(
      process.cwd(),
      "private",
      "images",
      `${imagename}.jpg`
    );

    const stats = await fs.stat(imagePath);
    const file = await fs.readFile(imagePath);

    return new Response(file, {
      status: 200,
      headers: {
        "content-type": "image/jpg",
        "content-length": stats.size.toString(),
      },
    });
  } catch (err) {
    // Return a 500 status if there's an error reading the file
    return NextResponse.json(
      { error: "Error reading the image file" },
      { status: 500 }
    );
  }
});
