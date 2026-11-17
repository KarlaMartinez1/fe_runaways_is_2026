import Link from "next/link";
import type { Property, PropertyStatus } from "@/lib/api/types";
import { propertyStatusLabels } from "@/lib/messages/my-properties";
import { categoryLabels, formatPrice, propertyMessages } from "@/lib/messages/properties";

const categoryStyles = {
  PROPIEDAD: "bg-[#E5EBFB] text-[#2449c6]",
  EQUIPO: "bg-[#EEF0E2] text-zinc-800",
};

const statusStyles: Record<PropertyStatus, string> = {
  DISPONIBLE: "bg-[#d9f5e3] text-[#14532d]",
  PAUSADO: "bg-[#ece4fb] text-[#5b3aa8]",
  ELIMINADO: "bg-zinc-200 text-zinc-600",
};

type PropertyCardProps = {
  property: Property;
  // H4: en "Mis publicaciones" la tarjeta lleva a la pantalla de gestión y muestra el estado.
  href?: string;
  showStatus?: boolean;
};

export function PropertyCard({ property, href, showStatus = false }: PropertyCardProps) {
  const cover = property.images[0];

  return (
    <Link
      href={href ?? `/properties/${property.id}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-md"
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt={property.title} className="aspect-[3/2] w-full object-cover" />
      ) : (
        <div className="aspect-[3/2] w-full bg-[#DCE2F4]" aria-hidden="true" />
      )}

      <div className="flex flex-col gap-1 p-3">
        <div className="flex flex-wrap gap-1.5">
          <span
            className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${categoryStyles[property.category]}`}
          >
            {categoryLabels[property.category]}
          </span>
          {showStatus && (
            <span
              className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${statusStyles[property.status]}`}
            >
              {propertyStatusLabels[property.status]}
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 text-[15px] font-semibold text-zinc-900">{property.title}</h3>
        <p className="truncate text-sm text-zinc-500">
          {property.municipality}, {property.department}
        </p>
        <p className="text-[15px] font-bold text-zinc-900">
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