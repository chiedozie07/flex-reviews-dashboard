import { notFound } from "next/navigation";
import PropertyLayout from "@/app/components/PropertyLayout";
import { getApprovedReviews } from "@/lib/reviews";


interface PropertyPageProps {
  params: {
    id: string;
  };
};

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = params;

  // load approved reviews (server-side)
  const approvedReviews = await getApprovedReviews();

  // pull property reviews by listingId
  const property = approvedReviews.find(
    (p) => p.listingId?.toString() === id.toString()
  );

  if (!property) {
    return notFound();
  }

  return (
    <PropertyLayout
      propertyName={property.listingName}
      listingId={property.listingId ? String(property.listingId) : null}
      reviews={property.reviews}
      averageRating={property.averageRating}
      reviewCount={property.counts}
    />
  );
};