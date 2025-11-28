"use client";
import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle, ListFilter, MessageSquare, Home, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import PageHeader from "../components/PageHeader";
import ApproveToggle from "../components/ApproveToggle";
import ReviewDetailsModal from "../components/ReviewDetailsModal";


export type ReviewFlat = {
  id: string;
  guestName?: string;
  listingName?: string;
  rating?: number | null;
  publicReview?: string;
  categories?: { category: string; rating: number }[];
  submittedAt?: string | null;
  channel?: string | null;
  raw?: unknown;
};
type ListingGroup = {
  listingId?: string | null;
  listingName?: string | null;
  reviews: ReviewFlat[];
  counts?: number;
  averageRating?: number | null;
};
type SortOption = "newest" | "oldest" | "highest" | "lowest";
//  Client-side normalization helper
/**
 * accepts either:
 * - { status, data: ListingGroup[] } (our API)
 * - or Hostaway payload { status, result: HostawayReviewRaw[] }
 * produces ListingGroup[]
 */
type HostawayCategory = { category: string; rating?: number | null };
type HostawayReviewRaw = {
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
  [k: string]: unknown;
};
type HostawayResponse = { status?: string; result?: HostawayReviewRaw[] | null };
// Convert Hostaway raw payload into ListingGroup[]
function normalizeHostawayClient(payload: unknown): ListingGroup[] {
  // If payload already matches { status, data: ListingGroup[] } - use it
  if (typeof payload === "object" && payload !== null && "data" in (payload as any)) {
    const maybe = (payload as any).data;
    if (Array.isArray(maybe)) {
      return maybe as ListingGroup[];
    }
  }
  // if payload is Hostaway response with `result` array
  if (
    typeof payload === "object" &&
    payload !== null &&
    Array.isArray((payload as HostawayResponse).result)
  ) {
    const rawReviews = (payload as HostawayResponse).result as HostawayReviewRaw[];
    // normalize each review to ReviewFlat
    const normalizedReviews: ReviewFlat[] = rawReviews.map((r) => {
      // compute rating if null by averaging reviewCategory ratings (client-side)
      let rating: number | null = typeof r.rating === "number" ? r.rating : null;
      if ((rating === null || rating === undefined) && Array.isArray(r.reviewCategory)) {
        const vals = r.reviewCategory.map((c) => c?.rating).filter((v): v is number => typeof v === "number");
        if (vals.length) {
          rating = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
        }
      }
      return {
        id: String(r.id),
        guestName: r.guestName ?? undefined,
        listingName: r.listingName ?? undefined,
        rating,
        publicReview: r.publicReview ?? undefined,
        categories: Array.isArray(r.reviewCategory)
          ? r.reviewCategory.map((c) => ({ category: c.category, rating: c.rating ?? 0 }))
          : undefined,
        submittedAt: r.submittedAt ? new Date(r.submittedAt).toISOString() : undefined,
        channel: r.type ?? undefined,
        raw: r as unknown,
      };
    });
    // group by listingId/listingName
    const byListing = new Map<string, { listingId?: string | null; listingName?: string | null; reviews: ReviewFlat[] }>();
    for (const rv of normalizedReviews) {
      const key = rv.listingName ?? rv.listingName ?? "unknown";
      const listingId = (rv.raw as any)?.listingId ?? null;
      const groupKey = listingId != null ? String(listingId) : rv.listingName ?? "unknown";
      const existing = byListing.get(groupKey);
      if (!existing) {
        byListing.set(groupKey, {
          listingId: listingId != null ? String(listingId) : null,
          listingName: rv.listingName ?? null,
          reviews: [rv],
        });
      } else {
        existing.reviews.push(rv);
      }
    }
    const groups: ListingGroup[] = Array.from(byListing.values()).map((g) => {
      const nums = g.reviews.map((r) => r.rating).filter((v): v is number => typeof v === "number");
      const avg = nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : null;
      return { listingId: g.listingId ?? null, listingName: g.listingName ?? null, reviews: g.reviews, counts: g.reviews.length, averageRating: avg };
    });
    return groups;
  }
  // return empty for unknown shape
  return [];
};


// dashboard page (client) 
export default function DashboardPage() {
  const [listings, setListings] = useState<ListingGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // approvals map from server
  const [approvals, setApprovals] = useState<Record<string, boolean>>({});
  // filters + sort + pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);
  // modal
  const [selectedReview, setSelectedReview] = useState<ReviewFlat | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  // fetch normalized reviews from API with fallback to public mock JSON
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      // helper to update state if not cancelled
      const setResult = (groups: ListingGroup[]) => {
        if (!cancelled) setListings(groups);
      };
      try {
        // first: try the API route
        const r = await fetch("/api/reviews/hostaway");
        if (r.ok) {
          const json = await r.json();
          // accept either { status, data: ListingGroup[] } or Hostaway raw
          const groups = normalizeHostawayClient(json);
          setResult(groups);
        } else {
          // try fallback to public mock file (under public/mock/hostaway-reviews.json)
          console.warn("API /api/reviews/hostaway returned non-OK:", r.status);
          const fallback = await fetch("/mock/hostaway-reviews.json");
          if (!fallback.ok) throw new Error(`Fallback mock fetch failed (${fallback.status})`);
          const fallbackJson = await fallback.json();
          const groups = normalizeHostawayClient(fallbackJson);
          setResult(groups);
        }
      } catch (fetchErr) {
        console.error("load reviews error", fetchErr);
        // final attempt: try direct public mock path too (in case domain differences)
        try {
          const fallback2 = await fetch("/mock/hostaway-reviews.json");
          if (fallback2.ok) {
            const fallbackJson = await fallback2.json();
            const groups = normalizeHostawayClient(fallbackJson);
            if (!cancelled) setListings(groups);
          } else {
            if (!cancelled) setError(String((fetchErr as Error)?.message ?? "Failed to load reviews"));
          }
        } catch {
          if (!cancelled) setError(String((fetchErr as Error)?.message ?? "Failed to load reviews"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  // fetch approvals from server
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/reviews/approvals");
        if (!r.ok) return;
        const json = await r.json();
        setApprovals(json.approvals || {});
      } catch (e) {
        // ignore
      }
    })();
  }, []);
  // helper to set approval locally & on server (optimistic)
  const setApproval = async (id: string | number, approved: boolean) => {
    setApprovals((prev) => ({ ...prev, [String(id)]: approved }));
    try {
      await fetch("/api/reviews/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved }),
      });
      // server returns approvals on success (not strictly required)
    } catch (e) {
      console.error("persist approval failed", e);
    }
  };
  const handleToggle = (reviewId: string | number) => {
    const id = String(reviewId);
    const next = !approvals[id];
    void setApproval(id, next);
  };
  // flatten reviews across listings for simple list view
  const flatReviews = useMemo(() => {
    const arr: ReviewFlat[] = [];
    listings.forEach((l) => {
      (l.reviews || []).forEach((r) => {
        arr.push({
          id: String(r.id),
          guestName: r.guestName,
          listingName: r.listingName,
          rating: r.rating,
          publicReview: r.publicReview,
          categories: r.categories,
          submittedAt: r.submittedAt,
          channel: r.channel,
          raw: r.raw,
        });
      });
    });
    return arr;
  }, [listings]);
  // computed merged reviews (applies approvals override)
  const merged = useMemo(() => {
    return flatReviews.map((r) => ({ ...r, approved: approvals[String(r.id)] ?? false }));
  }, [flatReviews, approvals]);
  // filters and sorting
  const filteredSorted = useMemo(() => {
    let list = merged.slice();
    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (x) =>
          x.id.toLowerCase().includes(q) ||
          (x.guestName || "").toLowerCase().includes(q) ||
          (x.listingName || "").toLowerCase().includes(q) ||
          (x.publicReview || "").toLowerCase().includes(q)
      );
    }
    // status filter
    if (statusFilter === "approved") list = list.filter((r) => (r as any).approved);
    if (statusFilter === "pending") list = list.filter((r) => !(r as any).approved);
    // min rating
    if (minRating !== null) list = list.filter((r) => typeof r.rating === "number" && (r.rating ?? 0) >= minRating);
    // sorting
    list.sort((a, b) => {
      if (sortBy === "newest") return Number(new Date(b.submittedAt ?? 0)) - Number(new Date(a.submittedAt ?? 0));
      if (sortBy === "oldest") return Number(new Date(a.submittedAt ?? 0)) - Number(new Date(b.submittedAt ?? 0));
      if (sortBy === "highest") return (b.rating ?? 0) - (a.rating ?? 0);
      if (sortBy === "lowest") return (a.rating ?? 0) - (b.rating ?? 0);
      return 0;
    });
    return list;
  }, [merged, search, statusFilter, minRating, sortBy]);
  // pagination
  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, page, pageSize]);
  // UI helpers
  const openDetails = (r: ReviewFlat) => {
    setSelectedReview(r);
    setModalOpen(true);
  };
  const closeDetails = () => {
    setSelectedReview(null);
    setModalOpen(false);
  };
  return (
    <div className="min-h-full shadow mx-5">
      <PageHeader title="Manager Dashboard" subtitle="Review, normalize, approve, and manage guest feedback." icon={<CheckCircle className="w-6 h-6 text-black" />} />
      <section className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20">Loading reviews…</div>
        ) : error ? (
          <div className="text-red-600 py-6">Error loading reviews: {error}</div>
        ) : (
          <>
            {/* stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-20">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-500">Properties</div>
                <div className="mt-1 text-2xl font-semibold">{listings.length}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-500">Total Reviews</div>
                <div className="mt-1 text-2xl font-semibold">{merged.length}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-500">Approved</div>
                <div className="mt-1 text-2xl font-semibold text-green-700">{Object.values(approvals).filter(Boolean).length}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-500">Avg Rating</div>
                <div className="mt-1 text-2xl font-semibold">
                  {merged.reduce((s, r) => s + (r.rating ?? 0), 0) / (merged.length || 1) === 0 ? "—" : Math.round((merged.reduce((s, r) => s + (r.rating ?? 0), 0) / (merged.length || 1)) * 10) / 10}
                </div>
              </div>
            </div>
            {/* filter row */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between mb-10">
              {/* left side: Ssarch and primary filters */}
              <div className="flex items-center gap-3 w-full md:w-3/4">
                {/* search Input (No extra margin needed) */}
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search guest, property, id, or comment..."
                  className="flex-1 border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-black"
                />

                {/* Filter Button (Visually groups the following dropdowns) */}
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-100 transition ml-10 shadow-2xs"
                >
                  <ListFilter className="w-5 h-5" />
                  Filters
                </button>

                {/* status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="all">All</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>

                {/* min rating filter */}
                <select
                  value={minRating ?? ""}
                  onChange={(e) => { const v = e.target.value; setMinRating(v === "" ? null : Number(v)); setPage(1); }}
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="">Min rating</option>
                  <option value="1">1+</option>
                  <option value="3">3+</option>
                  <option value="5">5+</option>
                  <option value="7">7+</option>
                </select>
              </div>

              {/* right side: Sort and Clear */}
              <div className="flex items-center gap-3">
                {/* sort by */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest">Highest rating</option>
                  <option value="lowest">Lowest rating</option>
                </select>

                {/* clear button */}
                <button
                  type="button"
                  onClick={() => { setSearch(""); setStatusFilter("all"); setMinRating(null); setSortBy("newest"); setPage(1); }}
                  className="px-3 py-2 rounded-lg bg-white border hover:bg-red-50 hover:border-red-300 transition"
                >
                  Clear
                </button>
              </div>
            </div>
            {/* table */}
            <div className="overflow-x-auto bg-white shadow-sm rounded-xl border">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="py-3 px-4">Review ID</th>
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 px-4 text-center text-gray-600">No reviews found.</td>
                    </tr>
                  )}
                  {paged.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-gray-50 align-top">
                      <td className="py-3 px-4 font-medium">{r.id}</td>
                      <td className="py-3 px-4">{r.guestName ?? "Guest"}</td>
                      <td className="py-3 px-4 flex items-start gap-3">
                        <Home className="w-4 h-4 text-gray-500 mt-1" />
                        <div>
                          <div className="font-medium">{r.listingName}</div>
                          {r.publicReview && <div className="text-sm text-gray-500 truncate max-w-xs">{r.publicReview}</div>}
                        </div>
                      </td>
                      <td className="py-3 px-4">{r.rating ?? "0"} ⭐</td>
                      <td className="py-3 px-4">{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "—"}</td>
                      <td className="py-3 px-4">{(approvals[String(r.id)] ?? false) ? <span className="px-3 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700">Approved</span> : <span className="px-3 py-1 rounded-md text-xs font-semibold bg-yellow-100 text-yellow-700">Pending</span>}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openDetails(r)} className="px-3 py-1 rounded border bg-white hover:bg-gray-50 text-sm">View</button>
                          <ApproveToggle reviewId={r.id} approved={!!approvals[String(r.id)]} onToggle={handleToggle} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50" disabled={page === 1}><ChevronLeft className="w-4 h-4" /></button>
                <div className="text-sm">Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span></div>
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50" disabled={page === totalPages}><ChevronRight className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">Per page</label>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="border rounded-md px-2 py-1">
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={10}>10</option>
                </select>
              </div>
            </div>
          </>
        )}
      </section>
      {/* details modal */}
      <ReviewDetailsModal review={selectedReview} open={modalOpen} onClose={closeDetails} onToggle={handleToggle} approved={selectedReview ? !!approvals[String(selectedReview.id)] : false} />
    </div>
  );
};