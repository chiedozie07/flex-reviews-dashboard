import fs from "fs";
import path from "path";


// path to my approval storage file
const approvalsFile = path.join(process.cwd(), "data", "approved-reviews.json");

export type ApprovedReviewRecord = {
  listingId: string | number;
  listingName?: string;
  reviews: any[];
  counts: number;
  averageRating: number | null;
};

// ensure file exists
function ensureFile() {
  if (!fs.existsSync(approvalsFile)) {
    fs.writeFileSync(approvalsFile, JSON.stringify([]));
  }
}

// read the approved reviews store
export async function getApprovedReviews(): Promise<ApprovedReviewRecord[]> {
  try {
    ensureFile();
    const raw = fs.readFileSync(approvalsFile, "utf8");
    return JSON.parse(raw) as ApprovedReviewRecord[];
  } catch (err) {
    console.error("Error reading approved reviews:", err);
    return [];
  }
}

// save updated approvals
export async function saveApprovedReviews(data: ApprovedReviewRecord[]) {
  try {
    ensureFile();
    fs.writeFileSync(approvalsFile, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing approved reviews:", err);
  }
};