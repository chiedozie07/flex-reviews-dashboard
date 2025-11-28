import PropertyLayout from "@/app/components/PropertyLayout";
import approvedJson from "@/app/data/approved-reviews.json";

// define data types
type ApprovedReview = {
  id: string;
  guestName?: string | null;
  publicReview?: string | null;
  rating?: number | null;
  categories?: { category: string; rating: number }[];
  submittedAt?: string | null;
};

type ApprovedProperty = {
  listingId: number | string | null;
  listingName: string | null;
  averageRating: number | null;
  counts: number;
  reviews: ApprovedReview[];
};


export default async function PropertyPage({ params }: { params: { id: string } }) {
  
  const id = params.id; 

  // type guard the imported JSON data
  const approvedReviews: ApprovedProperty[] = Array.isArray(approvedJson) 
    ? (approvedJson as ApprovedProperty[]) 
    : [];

  // search for the property using the destructured ID
  const property = approvedReviews.find((p) => {
    // Ensure listingId is present and convert it to a string for strict comparison
    const listingIdString = p.listingId !== null ? String(p.listingId) : null;
    return listingIdString === id;
  });

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto my-20 text-center text-gray-500">
        <h2 className="text-2xl font-semibold mb-4">Property Not Found</h2>
        <p>No approved reviews available for this property (ID: {id}).</p>
      </div>
    );
  }

  return (
    <PropertyLayout
      propertyName={property.listingName}
      listingId={property.listingId !== null ? String(property.listingId) : null}
      reviews={property.reviews}
      averageRating={property.averageRating}
      reviewCount={property.counts}
    />
  );
};