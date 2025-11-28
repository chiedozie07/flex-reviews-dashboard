import Link from "next/link";


export default function PropertiesIndex() {
  // eventually fetch real properties here
  // For now, use placeholder guidance
  const sampleProps = [
    { listingId: "12345", listingName: "Modern Apartment in London" },
    { listingId: "67890", listingName: "Cozy Studio in Bristol" }
  ];

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Our Properties</h1>

      <p className="text-gray-600 mb-8">
        Browse our Flex Living property collection. Click any property to view full details and approved guest reviews.
      </p>

      <section className="grid md:grid-cols-2 gap-6">
        {sampleProps.map(p => (
          <Link
            key={p.listingId}
            href={`/dashboard/properties/${p.listingId}`}
            className="block rounded-xl p-6 shadow hover:shadow-md transition bg-white"
          >
            <h2 className="font-semibold text-lg">{p.listingName}</h2>
            <div className="text-gray-500 text-sm mt-1">Listing #{p.listingId}</div>
          </Link>
        ))}
      </section>
    </main>
  );
};