import { NextResponse } from "next/server";

const ACCOUNT_ID = process.env.HOSTAWAY_ACCOUNT_ID;
const API_KEY = process.env.HOSTAWAY_API_KEY;

// fallback mock data (matches your project spec JSON shape)
const fallbackMock = {
  data: [
    {
      listingId: 12345,
      listingName: "2B N1 A - 29 Shoreditch Heights",
      averageRating: 10,
      counts: 1,
      reviews: [
        {
          id: "7453",
          guestName: "Shane Finkelstein",
          publicReview: "Shane and family are wonderful! Would definitely host again :)",
          rating: null,
          categories: [
            { category: "cleanliness", rating: 10 },
            { category: "communication", rating: 10 },
            { category: "respect_house_rules", rating: 10 }
          ],
          submittedAt: "2020-08-21 22:45:14",
          listingName: "2B N1 A - 29 Shoreditch Heights",
        },
      ],
    },
  ],
};

export async function GET() {
  try {
    // if env vars missing → fallback
    if (!ACCOUNT_ID || !API_KEY) {
      console.warn("Missing HOSTAWAY env — using mock reviews");
      return NextResponse.json(fallbackMock, { status: 200 });
    }

    // --- Hostaway API request ---
    const url = `https://api.hostaway.com/v1/reviews?accountId=${ACCOUNT_ID}`;
    const r = await fetch(url, {
      headers: { "Authorization": API_KEY },
      cache: "no-store",
    });

    if (!r.ok) throw new Error("Hostaway API failed");

    const apiJson = await r.json();
    const reviews = apiJson?.result ?? [];

    // group reviews by listing
    const map = new Map();

    reviews.forEach((rev: any) => {
      const name = rev.listingName ?? "Unknown Property";
      if (!map.has(name)) {
        map.set(name, {
          listingId: rev.id ?? null,
          listingName: name,
          averageRating: null,
          counts: 0,
          reviews: [],
        });
      }

      const g = map.get(name);
      g.reviews.push({
        id: String(rev.id),
        guestName: rev.guestName,
        publicReview: rev.publicReview,
        rating: rev.rating,
        categories: rev.reviewCategory,
        submittedAt: rev.submittedAt,
        listingName: rev.listingName,
      });
      g.counts += 1;
    });

    return NextResponse.json({ data: [...map.values()] }, { status: 200 });
  } catch (err) {
    console.error("Fallback to mock due to:", err);
    return NextResponse.json(fallbackMock, { status: 200 });
  }
};