import { promises as fs } from "fs";
import path from "path";


export type ApprovedProperty = {
  listingId: string | number | null;
  listingName: string | null;
  averageRating: number | null;
  counts: number;
  reviews: {
    id: string;
    guestName?: string | null;
    publicReview?: string | null;
    rating?: number | null;
    categories?: { category: string; rating: number | null }[];
    submittedAt?: string | null;
  }[];
};

/**
 * loads the approved-reviews.json file safely.
 */
export async function getApprovedReviews(): Promise<ApprovedProperty[]> {
  try {
    const filePath = path.join(process.cwd(), "app", "data", "approved-reviews.json");
    const file = await fs.readFile(filePath, "utf8");
    const json = JSON.parse(file);

    if (Array.isArray(json)) {
      return json as ApprovedProperty[];
    }

    if (Array.isArray(json.data)) {
      return json.data as ApprovedProperty[];
    }

    return [];
  } catch (error) {
    console.error("Failed to load approved reviews:", error);
    return [];
  }
};