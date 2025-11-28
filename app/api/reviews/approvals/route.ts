import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "app", "data", "approved-reviews.json");

// GET — return all approvals
export async function GET() {
  try {
    const file = await fs.readFile(filePath, "utf8");
    const json = JSON.parse(file);

    return NextResponse.json({ approvals: json.approvals || {} });
  } catch (error) {
    console.error("GET /approvals error:", error);
    return NextResponse.json({ approvals: {} }, { status: 200 });
  }
}

// POST — persist approval
export async function POST(request: Request) {
  try {
    const { id, approved } = await request.json();

    const file = await fs.readFile(filePath, "utf8");
    const json = JSON.parse(file);

    json.approvals = {
      ...(json.approvals || {}),
      [String(id)]: approved,
    };

    await fs.writeFile(filePath, JSON.stringify(json, null, 2), "utf8");

    return NextResponse.json({ approvals: json.approvals });
  } catch (error) {
    console.error("POST /approvals error:", error);
    return NextResponse.json(
      { error: "Failed to save approval" },
      { status: 500 }
    );
  }
};