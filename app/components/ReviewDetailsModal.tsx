"use client";

import React from "react";
import { X } from "lucide-react";
import ApproveToggle from "./ApproveToggle";


type Category = { category: string; rating: number };
type Review = {
  id: string | number;
  guestName?: string;
  publicReview?: string;
  categories?: Category[];
  rating?: number | null;
  submittedAt?: string | null;
  channel?: string | null;
  listingName?: string | null;
};

export default function ReviewDetailsModal({
  review,
  open,
  onClose,
  onToggle,
  approved,
}: {
  review: Review | null;
  open: boolean;
  onClose: () => void;
  onToggle: (id: string | number) => void;
  approved: boolean;
}) {
  if (!open || !review) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <div className="text-lg font-semibold">{review.listingName ?? "Review details"}</div>
            <div className="text-sm text-gray-500">{review.guestName ?? "Guest"}</div>
          </div>

          <div className="flex items-center gap-2">
            <ApproveToggle reviewId={String(review.id)} approved={approved} onToggle={onToggle} />
            <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="text-sm text-gray-500 mb-3">
            {review.submittedAt ? new Date(review.submittedAt).toLocaleString() : ""}
            {review.channel ? ` • ${review.channel}` : ""}
          </div>

          <div className="prose max-w-none text-gray-800 mb-4">
            {review.publicReview ?? "No public review text provided."}
          </div>

          <div>
            <h4 className="font-semibold mb-2">Category ratings</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.isArray(review.categories) && review.categories.length > 0 ? (
                review.categories.map((c) => (
                  <div key={c.category} className="p-3 border rounded">
                    <div className="text-sm text-gray-600">{c.category}</div>
                    <div className="mt-1 font-medium">{c.rating} / 10</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No category ratings available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};