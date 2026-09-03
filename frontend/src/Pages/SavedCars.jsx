import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getCars } from "../api/api";
import CarCard from "../Components/CarCard";

export default function SavedCars() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const key = user?.id ? `savedCars_${user.id}` : null;
  const [savedIds, setSavedIds] = useState(() =>
    key ? JSON.parse(localStorage.getItem(key) || "[]") : [],
  );
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCars() {
      try {
        const response = await getCars({ limit: 50 });
        const availableCars = response.data.cars;
        setCars(availableCars);

        if (key) {
          const availableIds = new Set(availableCars.map((car) => car._id));
          const cleanedIds = savedIds.filter((id) => availableIds.has(id));

          if (cleanedIds.length !== savedIds.length) {
            localStorage.setItem(key, JSON.stringify(cleanedIds));
            setSavedIds(cleanedIds);
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

  const savedCars = cars.filter((car) => savedIds.includes(car._id));

  function removeSaved(carId) {
    const updatedIds = savedIds.filter((id) => id !== carId);

    if (key) {
      localStorage.setItem(key, JSON.stringify(updatedIds));
    }

    setSavedIds(updatedIds);
  }

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading saved cars...</p>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-400">
              Your shortlist
            </p>
            <h1 className="section-title mt-2">Saved Cars</h1>
            <p className="section-copy">
              Keep interesting listings here while you decide.
            </p>
          </div>

          <Link
            to="/cars"
            className="text-sm font-semibold text-gray-600 hover:text-black"
          >
            Browse Cars →
          </Link>
        </div>

        {!savedCars.length ? (
          <div className="surface p-12 text-center">
            <h2 className="text-xl font-bold">No saved cars yet</h2>
            <p className="mt-2 text-sm text-gray-500">
              Save a car from its details page to see it here.
            </p>
            <Link to="/cars" className="primary-button mt-6">
              Browse Cars
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedCars.map((car) => (
              <div key={car._id}>
                <CarCard car={car} />
                <button
                  onClick={() => removeSaved(car._id)}
                  className="mt-2 w-full rounded-[10px] border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  Remove from saved
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
