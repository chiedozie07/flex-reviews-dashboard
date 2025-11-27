import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";


 // hostaway raw types 
interface HostawayCategory {
  category: string;
  rating?: number | null;
};

interface HostawayReviewRaw {
  id: number | string;
  type?: string;
  status?: string;
  rating?: number | null;
  publicReview?: string | null;
  reviewCategory?: HostawayCategory[] | null;
  submittedAt?: string | null;
  guestName?: string | null;
  listingName?: string | null;
  listingId?: number | string | null;
  [key: string]: unknown;
};

interface HostawayResponse {
  status?: string;
  result?: HostawayReviewRaw[] | null;
};

// normalized types 
type NormalizedReview = {
  id: string;
  listingName?: string | null;
  listingId?: string | null;
  type?: string | null;
  status?: string | null;
  rating?: number | null;
  categories: HostawayCategory[];
  submittedAt?: string | null;
  guestName?: string | null;
  publicReview?: string | null;
  channel: string;
  raw: HostawayReviewRaw;
};

type GroupedListing = {
  listingId?: string | null;
  listingName?: string | null;
  reviews: NormalizedReview[];
  counts: number;
  averageRating: number | null;
};

//  helpers
function deriveChannel(type?: string): string {
  if (!type) return "unknown";
  const t = type.toLowerCase();
  if (t.includes("host-to-guest")) return "host";
  if (t.includes("guest-to-host")) return "guest";
  if (t.includes("google")) return "google";
  return t;
}

function safeAverage(values: number[]): number | null {
  if (!Array.isArray(values) || values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

//  normalization 
function normalizeHostaway(payload: HostawayResponse): GroupedListing[] {
  if (!payload || !Array.isArray(payload.result)) return [];

  const normalized: NormalizedReview[] = payload.result.map((r) => {
    // rating resolution: if rating is null/undefined, average category ratings
    let rating: number | null =
      typeof r.rating === "number" ? r.rating : null;

    if ((rating === null || rating === undefined) && Array.isArray(r.reviewCategory)) {
      const vals = r.reviewCategory
        .map((c) => c?.rating)
        .filter((v): v is number => typeof v === "number");
      if (vals.length > 0) rating = safeAverage(vals);
    }

    const categories = Array.isArray(r.reviewCategory)
      ? r.reviewCategory.map((c) => ({ category: c.category, rating: c.rating ?? null }))
      : [];

    return {
      id: String(r.id),
      listingName: r.listingName ?? null,
      listingId: r.listingId != null ? String(r.listingId) : null,
      type: r.type ?? null,
      status: r.status ?? null,
      rating,
      categories,
      submittedAt: r.submittedAt ? new Date(r.submittedAt).toISOString() : null,
      guestName: r.guestName ?? null,
      publicReview: r.publicReview ?? null,
      channel: deriveChannel(r.type),
      raw: r,
    };
  });

  // group by listing key
  const byListing = new Map<string, { listingId?: string | null; listingName?: string | null; reviews: NormalizedReview[] }>();

  normalized.forEach((rev) => {
    const key = rev.listingId ?? rev.listingName ?? "unknown";
    const existing = byListing.get(key);
    if (!existing) {
      byListing.set(key, { listingId: rev.listingId, listingName: rev.listingName, reviews: [rev] });
    } else {
      existing.reviews.push(rev);
    }
  });

  const result: GroupedListing[] = Array.from(byListing.values()).map((group) => {
    const nums = group.reviews
      .map((r) => r.rating)
      .filter((v): v is number => typeof v === "number");
    const avg = safeAverage(nums);
    return {
      listingId: group.listingId ?? null,
      listingName: group.listingName ?? null,
      reviews: group.reviews,
      counts: group.reviews.length,
      averageRating: avg,
    };
  });

  return result;
};

// API handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
    const apiKey = process.env.HOSTAWAY_API_KEY;
    let payload: HostawayResponse | null = null;

    if (accountId && apiKey) {
      // TODO: this is a placeholder re[lace later with the actual sandbox endpoint
      const sandboxUrl = process.env.HOSTAWAY_SANDBOX_URL ?? "https://sandbox.hostaway.io/api/v1/reviews";
      try {
        const r = await fetch(sandboxUrl, {
          method: "GET",
          headers: {
            "Account-Id": accountId,
            "Api-Key": apiKey,
            "Content-Type": "application/json",
          },
        });
        if (r.ok) {
          // attempt to parse; guard with unknown
          const json = (await r.json()) as unknown;
          if (typeof json === "object" && json !== null) {
            payload = json as HostawayResponse;
          }
        } else {
          payload = null;
        }
      } catch (fetchError) {
        console.log('fetchError =>', fetchError)
        // ignore and fall back to mock file
        payload = null;
      }
    };

    if (!payload) {
      // read local mock
      const filePath = path.join(process.cwd(), "public", "mock", "hostaway-reviews.json");
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      if (typeof parsed === "object" && parsed !== null) {
        payload = parsed as HostawayResponse;
      } else {
        payload = { status: "error", result: [] };
      }
    }

    const normalized = normalizeHostaway(payload);
    return res.status(200).json({ status: "ok", data: normalized });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("hostaway handler error:", message);
    res.status(500).json({ status: "error", message });
  };
};