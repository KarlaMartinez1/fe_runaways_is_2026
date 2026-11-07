import Link from "next/link";
import type { Property } from "@/lib/api/types";
import { categoryLabels, formatPrice, propertyMessages } from "@/lib/messages/properties";

const categoryStyles = {
  PROPIEDAD: "bg-[#E5EBFB] text-[#2449c6]",
  EQUIPO: "bg-[#EEF0E2] text-zinc-800",
};

export function PropertyCard({ property }: { property: Property }) {
  const cover = property.images[0];

  return (
    <Link
      href={`/properties/${property.id}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-md"
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt={property.title} className="h-[170px] w-full object-cover" />
      ) : (
        <div className="h-[170px] w-full bg-[#DCE2F4]" aria-hidden="true" />
      )}

      <div className="flex flex-col gap-1.5 p-4">
        <span
          className={`self-start rounded-md px-2.5 py-0.5 text-xs font-semibold ${categoryStyles[property.category]}`}
        >
          {categoryLabels[property.category]}
        </span>
        <h3 className="text-[17px] font-semibold text-zinc-900">{property.title}</h3>
        <p className="text-sm text-zinc-500">
          {property.municipality}, {property.department}
        </p>
        <p className="font-bold text-zinc-900">
          {formatPrice(property.pricePerDay)} {propertyMessages.perDay}
        </p>

        {property.averageRating !== undefined && (
          <span className="self-start rounded-md bg-[#EEF0E2] px-2.5 py-0.5 text-sm text-zinc-700">
            {property.averageRating === null
              ? propertyMessages.noRating
              : `★ ${property.averageRating.toFixed(1)}`}
          </span>
        )}
      </div>
    </Link>
  );
}