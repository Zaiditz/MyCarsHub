import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getMyCars, deleteCar } from "../api/api";
import CarCard from "../Components/CarCard";

export default function MyListings() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyCars()
      .then((response) => setCars(response.data.cars))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load your listings"),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(carId) {
    if (!window.confirm("Are you sure you want to delete this car listing?"))
      return;
    try {
      await deleteCar(carId);
      setCars((prev) => prev.filter((car) => car._id !== carId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete car");
    }
  }

  if (loading)
    return (
      <div className="page-shell flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading your listings...</p>
      </div>
    );
  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-400">
              Seller dashboard
            </p>
            <h1 className="section-title mt-2">My Listings</h1>
            <p className="section-copy">
              Manage the cars you currently have on the marketplace.
            </p>
          </div>
          <Link to="/sell" className="primary-button">
            Sell a Car
          </Link>
        </div>
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {!cars.length ? (
          <div className="surface p-12 text-center">
            <h2 className="text-xl font-bold">You haven't listed any cars</h2>
            <p className="mt-2 text-sm text-gray-500">
              List your first car to see it here.
            </p>
            <Link to="/sell" className="primary-button mt-6">
              Sell Your Car
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <div key={car._id}>
                <CarCard car={car} />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    to={`/cars/${car._id}/edit`}
                    className="secondary-button py-2.5 text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(car._id)}
                    className="rounded-[10px] border border-gray-200 py-2.5 text-sm font-semibold text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}