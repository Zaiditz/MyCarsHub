import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getCars } from "../api/api";
import { getCompareCars, removeFromCompare } from "../utils/compare";

export default function Compare() {
  const [compareIds, setCompareIds] = useState(getCompareCars);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCars() {
      try {
        const response = await getCars({ limit: 50 });
        const availableCars = response.data.cars;
        setCars(availableCars);

        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (user?.id) {
          const availableIds = new Set(availableCars.map((car) => car._id));
          const cleanedIds = compareIds.filter((id) => availableIds.has(id));

          if (cleanedIds.length !== compareIds.length) {
            localStorage.setItem(
              `compareCars_${user.id}`,
              JSON.stringify(cleanedIds),
            );
            setCompareIds(cleanedIds);
          }
        }
      } catch (error) {
        console.error("GET CARS ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCars();
  }, []);

  const compareCars = cars.filter((car) => compareIds.includes(car._id));

  function remove(carId) {
    removeFromCompare(carId);
    setCompareIds((prev) => prev.filter((id) => id !== carId));
  }

  function clear() {
    compareIds.forEach((carId) => removeFromCompare(carId));
    setCompareIds([]);
  }

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading comparison...</p>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-400">
              Shortlist
            </p>
            <h1 className="section-title mt-2">Compare Cars</h1>
            <p className="section-copy">
              Put your shortlisted cars side by side.
            </p>
          </div>
          <Link
            to="/cars"
            className="text-sm font-semibold text-gray-600 hover:text-black"
          >
            Browse Cars →
          </Link>
        </div>

        {!compareCars.length ? (
          <div className="surface p-12 text-center">
            <h2 className="text-xl font-bold">No cars selected</h2>
            <p className="mt-2 text-sm text-gray-500">
              Add cars to comparison while browsing listings.
            </p>
            <Link to="/cars" className="primary-button mt-6">
              Browse Cars
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-end">
              <button
                onClick={clear}
                className="text-sm font-medium text-gray-500 hover:text-red-600"
              >
                Clear all
              </button>
            </div>

            <div className="surface overflow-x-auto">
              <table className="w-full min-w-[650px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    <th className="p-5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Specification
                    </th>
                    {compareCars.map((car) => (
                      <th key={car._id} className="min-w-48 p-5 align-top">
                        <p className="font-bold">
                          {car.brand} {car.model}
                        </p>
                        {car.variant && (
                          <p className="mt-1 text-sm font-normal text-gray-500">
                            {car.variant}
                          </p>
                        )}
                        <button
                          onClick={() => remove(car._id)}
                          className="mt-3 text-xs font-semibold text-gray-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Price", (car) => `₹${car.price.toLocaleString("en-IN")}`],
                    ["Year", (car) => car.year],
                    ["Fuel", (car) => car.fuelType],
                    ["Transmission", (car) => car.transmission],
                    ["City", (car) => car.city],
                    [
                      "Kilometers",
                      (car) =>
                        car.kilometersDriven != null
                          ? `${car.kilometersDriven.toLocaleString("en-IN")} km`
                          : "Not specified",
                    ],
                  ].map(([label, value], index) => (
                    <tr
                      key={label}
                      className={
                        index % 2
                          ? "border-b border-gray-100 bg-gray-50/40"
                          : "border-b border-gray-100"
                      }
                    >
                      <td className="p-5 text-sm font-semibold">{label}</td>
                      {compareCars.map((car) => (
                        <td key={car._id} className="p-5 text-sm text-gray-600">
                          {value(car)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
