import Image from "next/image";
import React from "react";

export type ReviewCategory = {
  category: string;
  rating?: number | null;
};

export type PropertyReview = {
  id: string;
  guestName?: string | null;
  publicReview?: string | null;
  rating?: number | null;
  categories?: ReviewCategory[];
  submittedAt?: string | null;
};

type PropertyLayoutProps = {
  propertyName?: string | null;
  listingId?: string | number | null;
  reviews: PropertyReview[];
  averageRating?: number | null;
  reviewCount?: number;
};

/**
 * Server component: renders property hero, KPIs and list of approved reviews.
 * Expectation: `reviews` contains only approved reviews (dashboard responsibility).
 */
export default function PropertyLayout({
  propertyName,
  listingId,
  reviews,
  averageRating,
  reviewCount,
}: PropertyLayoutProps) {
  // safe date formatting on the server
  const formatDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString() : "—";

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      {/* hero */}
      <section className="mb-8">
        <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-md bg-gray-100">
          <Image
            src="/property-placeholder.jpg"
            alt={propertyName ?? "Property image"}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold leading-tight">
              {propertyName ?? "Property"}
            </h1>
            {listingId && (
              <div className="text-sm text-gray-500 mt-1">Listing ID: {listingId}</div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center bg-white p-3 rounded-lg shadow-sm border">
              <div className="text-xs text-gray-500">Avg. Rating</div>
              <div className="mt-1 font-semibold text-xl text-yellow-600">
                {averageRating ?? "—"} ⭐
              </div>
            </div>

            <div className="text-center bg-white p-3 rounded-lg shadow-sm border">
              <div className="text-xs text-gray-500">Reviews</div>
              <div className="mt-1 font-semibold text-xl">{reviewCount ?? reviews.length}</div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-gray-600 max-w-3xl">
          This page displays guest feedback approved by the manager. Only reviews
          marked as approved will appear here.
        </p>
      </section>

      {/* reviews */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Approved Guest Reviews</h2>

        {(!reviews || reviews.length === 0) ? (
          <div className="py-8 px-6 bg-white border rounded-lg text-center text-gray-600">
            No approved reviews yet.
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((r) => (
              <article key={r.id} className="bg-white border rounded-xl p-6 shadow-sm">
                <header className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold">
                      {r.guestName ?? "Anonymous Guest"}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(r.submittedAt)} {r.rating ? ` • ${r.rating} ⭐` : ""}
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 text-right">
                    <div>Review ID</div>
                    <div className="font-mono text-xs mt-1">{r.id}</div>
                  </div>
                </header>

                <div className="mt-4 text-gray-800 leading-relaxed">
                  {r.publicReview ?? "No written feedback provided."}
                </div>

                {Array.isArray(r.categories) && r.categories.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {r.categories.map((c) => (
                      <div key={c.category} className="p-3 border rounded">
                        <div className="text-sm text-gray-600 capitalize">{c.category}</div>
                        <div className="mt-1 font-medium">{c.rating ?? "N/A"} / 10</div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};