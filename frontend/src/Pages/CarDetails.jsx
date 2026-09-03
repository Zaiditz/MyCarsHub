import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  getCarById,
  getCars,
  reportCar,
} from "../api/api";
import { getRecommendedCars } from "../utils/recommendations";
import { addToCompare, getCompareCars } from "../utils/compare";
import CarCard from "../Components/CarCard";

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchCar() {
      try {
        setLoading(true);
        const [carResponse, carsResponse] = await Promise.all([
          getCarById(id),
          getCars({ limit: 20 }),
        ]);

        if (!active) return;

        setCar(carResponse.data.car);
        setCars(carsResponse.data.cars);
      } catch (error) {
        console.error("GET CAR ERROR:", error);
        if (active) setCar(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchCar();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!car) return;

    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user?.id) {
      setIsSaved(false);
      setIsCompared(false);
      return;
    }

    const savedCars = JSON.parse(
      localStorage.getItem(`savedCars_${user.id}`) || "[]",
    );

    setIsSaved(savedCars.includes(car._id));
    setIsCompared(getCompareCars(user.id).includes(car._id));
  }, [car]);

  function toggleSave() {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user?.id) {
      alert("Please login to save cars.");
      return;
    }

    const key = `savedCars_${user.id}`;
    const savedCars = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = savedCars.includes(car._id)
      ? savedCars.filter((savedId) => savedId !== car._id)
      : [...savedCars, car._id];

    localStorage.setItem(key, JSON.stringify(updated));
    setIsSaved(updated.includes(car._id));
  }

  function handleCompare() {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user?.id) {
      alert("Please login to compare cars.");
      return;
    }

    if (isCompared) return;

    if (addToCompare(car._id, user.id)) {
      setIsCompared(true);
    }
  }

  async function handleReport() {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user?.id) {
      alert("Please login to report a listing.");
      return;
    }

    const reason = window.prompt(
      "Why are you reporting this listing?",
      "",
    );

    if (!reason?.trim()) return;

    try {
      setReporting(true);
      await reportCar(car._id, reason.trim());
      alert("Thanks. The listing has been reported for review.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to report listing");
    } finally {
      setReporting(false);
    }
  }

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading car...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="page-shell flex flex-col items-center justify-center px-5">
        <h1 className="text-3xl font-bold">Car not found</h1>
        <p className="mt-2 text-gray-500">
          This listing may no longer be available.
        </p>
        <Link to="/cars" className="primary-button mt-6">
          Back to Cars
        </Link>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isOwner = user?.id === car.seller?._id;
  const recommendedCars = getRecommendedCars(car, cars, 4);
  const memberSince = car.seller?.createdAt
    ? new Date(car.seller.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="page-shell">
      <div className="page-container">
        <Link
          to="/cars"
          className="text-sm font-medium text-gray-500 hover:text-black"
        >
          ← Back to Cars
        </Link>

        <div className="surface mt-5 overflow-hidden">
          <div className="grid lg:grid-cols-[1.05fr_.95fr]">
            <div className="flex min-h-[360px] items-center justify-center bg-[#f1f1ef] p-5 sm:min-h-[500px]">
              {car.images?.length ? (
                <img
                  src={car.images[0]}
                  alt={`${car.brand} ${car.model}`}
                  className="max-h-[500px] w-full object-contain"
                />
              ) : (
                <span className="text-sm text-gray-400">
                  No image available
                </span>
              )}
            </div>

            <div className="p-6 sm:p-9">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-400">
                    {car.brand}
                  </p>
                  <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
                    {car.model}
                  </h1>
                  {car.variant && (
                    <p className="mt-2 text-gray-500">{car.variant}</p>
                  )}
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                  {car.city}
                </span>
              </div>

              <p className="mt-7 text-3xl font-extrabold tracking-[-0.03em]">
                ₹{car.price.toLocaleString("en-IN")}
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  ["Year", car.year],
                  ["Fuel", car.fuelType],
                  ["Transmission", car.transmission],
                  [
                    "Kilometers",
                    car.kilometersDriven != null
                      ? `${car.kilometersDriven.toLocaleString("en-IN")} km`
                      : "Not specified",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-gray-200 bg-gray-50/70 p-4"
                  >
                    <p className="text-xs font-medium text-gray-500">{label}</p>
                    <p className="mt-1 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                  Seller
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{car.seller?.name || "Seller"}</p>
                  {car.seller?.verificationStatus === "verified" && (
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-600">✓ Verified Seller</span>
                  )}
                </div>
                {memberSince && (
                  <p className="mt-1 text-sm text-gray-500">
                    Member since {memberSince}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  Contact stays private through MyCarsHub chat.
                </p>
              </div>

              {car.description && (
                <div className="mt-7 border-t border-gray-100 pt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                    About this car
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                    {car.description}
                  </p>
                </div>
              )}

              {!isOwner && (
                <div className="mt-8 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                  <button
                    onClick={() =>
                      navigate(`/chat/car/${car._id}`)
                    }
                    className="primary-button"
                  >
                    Chat with Seller
                  </button>
                  <button
                    onClick={toggleSave}
                    className="secondary-button"
                  >
                    {isSaved ? "Saved" : "Save"}
                  </button>
                  <button
                    onClick={handleCompare}
                    disabled={isCompared}
                    className="secondary-button disabled:cursor-default disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    {isCompared ? "Compared" : "Compare"}
                  </button>
                </div>
              )}

              {isOwner && (
                <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                  This is your listing. Manage it from My Listings.
                </div>
              )}

              {!isOwner && (
                <button
                  onClick={handleReport}
                  disabled={reporting}
                  className="mt-5 text-xs font-medium text-gray-400 hover:text-red-600 disabled:opacity-50"
                >
                  {reporting ? "Reporting..." : "Report this listing"}
                </button>
              )}
            </div>
          </div>
        </div>

        {recommendedCars.length > 0 && (
          <section className="mt-14">
            <div className="mb-7">
              <h2 className="section-title text-2xl">You might also like</h2>
              <p className="section-copy">
                A few similar listings based on this car.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {recommendedCars.map((item) => (
                <CarCard key={item._id} car={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
