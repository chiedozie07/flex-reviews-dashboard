"use client";
import React from "react";


interface ApproveToggleProps {
  reviewId: string | number;
  approved: boolean;
  onToggle: (reviewId: string | number) => void;
};

export default function ApproveToggle({reviewId, approved, onToggle}: ApproveToggleProps) {
  return (
    <button
      onClick={() => onToggle(reviewId)}
      className={`px-3 py-1 rounded text-white transition ${approved ? "bg-green-600 hover:bg-green-700" : "bg-gray-800 hover:bg-black"}`}
      aria-pressed={approved}
    >
      {approved ? "Approved" : "Approve"}
    </button>
  );
};
