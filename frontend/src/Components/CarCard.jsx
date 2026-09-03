import { useState } from "react";
import { Link } from "react-router";
import { addToCompare, getCompareCars } from "../utils/compare";

export default function CarCard({ car }) {
  const [isCompared, setIsCompared] = useState(() => getCompareCars().includes(car._id));

  function handleCompare() {
    if (isCompared) return;
    if (addToCompare(car._id)) setIsCompared(true);
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow duration-200 hover:shadow-md">
      <Link to={`/cars/${car._id}`} className="block">
        <div className="flex h-56 items-center justify-center overflow-hidden bg-[#f1f1ef]">
          {car.images?.length ? (
            <img
              src={car.images[0]}
              alt={`${car.brand} ${car.model}`}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.025]"
            />
          ) : (
            <span className="text-sm text-gray-400">No image available</span>
          )}
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-lg font-bold tracking-[-0.015em]">
                {car.brand} {car.model}
              </p>
              {car.seller?.verificationStatus === "verified" && (
                <span className="shrink-0 text-[11px] font-semibold text-gray-500" title="Verified seller">✓ Verified</span>
              )}
              {car.seller?.subscriptionPlan === "pro" && car.seller?.subscriptionStatus === "active" && (
                <span className="shrink-0 text-[11px] font-semibold text-gray-400" title="Pro seller">Pro</span>
              )}
            </div>
            {car.variant && <p className="mt-1 truncate text-sm text-gray-500">{car.variant}</p>}
          </div>
          <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
            {car.city}
          </span>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          {car.year} · {car.fuelType} · {car.transmission}
        </p>

        <p className="mt-3 text-xl font-bold tracking-[-0.02em]">
          ₹{car.price.toLocaleString("en-IN")}
        </p>

        <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
          <Link to={`/cars/${car._id}`} className="primary-button w-full py-2.5 text-sm">
            View Details
          </Link>
          <button
            type="button"
            onClick={handleCompare}
            disabled={isCompared}
            className="secondary-button px-3 py-2.5 text-sm disabled:cursor-default disabled:bg-gray-100 disabled:text-gray-500"
          >
            {isCompared ? "Compared" : "Compare"}
          </button>
        </div>
      </div>
    </article>
  );
}
