import fs from "fs";
import path from "path";
import Link from "next/link";
import type { ReactNode } from "react";

type HostawayCategory = {
  category: string;
  rating?: number | null;
};

type HostawayReviewRaw = {
  id: number | string;
  listingName?: string | null;
  listingId?: number | string | null;
  reviewCategory?: HostawayCategory[] | null;
  rating?: number | null;
  submittedAt?: string | null;
  guestName?: string | null;
  publicReview?: string | null;
  type?: string | null;
  status?: string | null;
  [key: string]: unknown;
};

type HostawayResponse = {
  status?: string;
  result?: HostawayReviewRaw[] | null;
};

type ListingSummary = {
  key: string; // listingId || listingName || 'unknown'
  listingId?: string | null;
  listingName?: string | null;
  counts: number;
  averageRating: number | null;
};

/**
 * read mock Hostaway JSON server-side and produce a list of listing summaries.
 * this keeps the layout server-only (no hydration concerns) while showing a useful sidebar.
 */
function readMockListings(): ListingSummary[] {
  try {
    const filePath = path.join(process.cwd(), "public", "mock", "hostaway-reviews.json");
    if (!fs.existsSync(filePath)) return [];

    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as HostawayResponse).result)) {
      return [];
    }

    const reviews = (parsed as HostawayResponse).result as HostawayReviewRaw[];

    // normalize and group by listing key
    const map = new Map<string, { listingId?: string | null; listingName?: string | null; ratings: (number)[]; count: number }>();

    reviews.forEach((r) => {
      const listingId = r.listingId != null ? String(r.listingId) : null;
      const listingName = r.listingName ?? null;
      const key = listingId ?? listingName ?? "unknown";

      const rating =
        typeof r.rating === "number"
          ? r.rating
          : Array.isArray(r.reviewCategory)
            ? r.reviewCategory.map((c) => c?.rating).filter((v): v is number => typeof v === "number").reduce((a, b) => a + b, 0) / (r.reviewCategory!.length || 1)
            : null;

      const entry = map.get(key) ?? { listingId, listingName, ratings: [], count: 0 };
      if (typeof rating === "number" && !Number.isNaN(rating)) entry.ratings.push(rating);
      entry.count += 1;
      map.set(key, entry);
    });

    // build summaries
    const summaries: ListingSummary[] = Array.from(map.entries()).map(([key, v]) => {
      const avg = v.ratings.length ? Math.round((v.ratings.reduce((a, b) => a + b, 0) / v.ratings.length) * 10) / 10 : null;
      return {
        key,
        listingId: v.listingId ?? null,
        listingName: v.listingName ?? null,
        counts: v.count,
        averageRating: avg,
      };
    });

    // sort alphabetically by listingName (fallback to key)
    summaries.sort((a, b) => {
      const aName = (a.listingName ?? a.key ?? "").toLowerCase();
      const bName = (b.listingName ?? b.key ?? "").toLowerCase();
      if (aName < bName) return -1;
      if (aName > bName) return 1;
      return 0;
    });

    return summaries;
  } catch (err) {
    console.log('Error Reading Mock Listings:', err)
    // on any error, return an empty list to avoid crashing the layout
    return [];
  }
};

export const revalidate = 0; // always fresh in dev; change if you'd like ISR

export default function PropertiesLayout({ children }: { children: ReactNode }) {
  const listings = readMockListings();

  return (
    <div className="min-h-screen bg-gray-50 mx-10 shadow">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="bg-white rounded-xl p-4 drop-shadow-md h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Properties</h3>
              <Link href="/dashboard/properties">
                <span className="text-sm text-gray-500 hover:underline">View all</span>
              </Link>
            </div>

            {listings.length === 0 ? (
              <div className="text-sm text-gray-500">No properties found.</div>
            ) : (
              <ul className="space-y-2">
                {listings.map((l) => {
                  // build route id: prefer listingId, else use url-encoded listingName
                  const id = l.listingId ?? encodeURIComponent(String(l.listingName ?? l.key));
                  const display = l.listingName ?? l.key;
                  return (
                    <li key={l.key}>
                      <Link
                        href={`/dashboard/properties/${encodeURIComponent(String(id))}`}
                        className="flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-gray-50 transition"
                      >
                        <div className="text-sm">
                          <div className="font-medium">{display}</div>
                          <div className="text-xs text-gray-500">{l.counts} reviews • {l.averageRating ?? "—"} avg</div>
                        </div>
                        <div className="text-sm text-gray-400">›</div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          {/* main content (dynamic property page will render here) */}
          <div className="min-h-[60vh]">
            {/* page children here renders the property details */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};