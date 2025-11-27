"use client";

import { CheckCircle, ListFilter, MessageSquare, Home } from "lucide-react";
import PageHeader from "../components/PageHeader";
import ApproveToggle from "../components/ApproveToggle";


export type Review = {
  id: string;
  guest: string;
  property: string;
  rating: number;
  comment: string;
  approved: boolean;
  date: string;
};

const sampleReviews: Review[] = [
  {
    id: "RVW-001",
    guest: "John Doe",
    property: "Flex Soho Apartment",
    rating: 4,
    comment: "Great stay! Clean and peaceful.",
    approved: true,
    date: "2025-01-08",
  },
  {
    id: "RVW-002",
    guest: "Sarah Johnson",
    property: "Flex Canary Wharf",
    rating: 5,
    comment: "Amazing location and comfortable bed!",
    approved: false,
    date: "2025-01-12",
  },
  {
    id: "RVW-003",
    guest: "Ahmed Musa",
    property: "Flex Camden Studio",
    rating: 3,
    comment: "Nice place but the Wi-Fi was slow.",
    approved: false,
    date: "2025-01-10",
  },
];

const DashboardPage = () => {

// handle toggle
  const handleToggle = (reviewId: string | number) => {
  console.log("Toggled review:", reviewId);
};


  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* page header */}
      <PageHeader
        title="Manager Dashboard"
        subtitle="Review, approve, and manage guest feedback for Flex Living properties."
        icon={<CheckCircle className="w-6 h-6 text-black" />}
      />

      {/* content */}
      <section className="max-w-7xl mx-auto px-6 py-10 w-full">
        {/* filter bar */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-gray-700" />
            Guest Reviews
          </h2>

          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-white border hover:bg-gray-100 transition"
          >
            <ListFilter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* reviews table */}
        <div className="overflow-x-auto bg-white shadow-sm rounded-xl border">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4">Review ID</th>
                <th className="py-3 px-4">Guest</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {sampleReviews.map((review: Review) => (
                <tr key={review.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{review.id}</td>
                  <td className="py-3 px-4">{review.guest}</td>

                  <td className="py-3 px-4 flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-500" />
                    {review.property}
                  </td>

                  <td className="py-3 px-4">{review.rating} ⭐</td>

                  {/* status badge */}
                  <td className="py-3 px-4">
                    {review.approved ? (
                      <span className="px-3 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700">
                        Approved
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-md text-xs font-semibold bg-yellow-100 text-yellow-700">
                        Pending
                      </span>
                    )}
                  </td>

                  {/* approve toggle */}
                  <td className="py-3 px-4">
                    <ApproveToggle
                      reviewId={review.id}
                      approved={review.approved}
                      onToggle={handleToggle}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default DashboardPage;