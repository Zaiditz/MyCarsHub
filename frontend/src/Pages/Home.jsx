import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getCars } from "../api/api";
import CarCard from "../Components/CarCard";

export default function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCars({ limit: 6 })
      .then((response) => setCars(response.data.cars))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load cars"),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell">
      <section className="border-b border-gray-200 bg-[#171717] text-white">
        <div className="mx-auto grid max-w-295 gap-10 px-5 py-20 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:px-0 lg:py-24">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
              MyCarsHub marketplace
            </p>

            <h1 className="max-w-2xl text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Find a car you actually want.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-gray-300 sm:text-lg">
              Browse cars listed by everyday owners, compare your options, and
              talk directly with sellers.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/cars"
                className="rounded-[10px] bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
              >
                Browse Cars
              </Link>

              <Link
                to="/sell"
                className="rounded-[10px] border border-gray-600 px-5 py-3 text-sm font-semibold text-white transition hover:border-gray-400 hover:bg-white/5"
              >
                Sell a Car
              </Link>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-2xl border border-white/10 bg-white/4 p-6">
              <p className="text-sm font-medium text-gray-400">
                A simpler way to shop used cars
              </p>

              <div className="mt-6 space-y-4">
                {[
                  "Search by what matters to you",
                  "Compare shortlisted cars",
                  "Message the seller directly",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-4 border-t border-white/10 pt-4 first:border-0 first:pt-0"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-black">
                      {index + 1}
                    </span>

                    <span className="text-sm text-gray-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-[#f7f7f5]">
        <div className="page-container py-12 lg:py-16">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-400">
              Built for direct deals
            </p>

            <h2 className="section-title mt-2">
              A marketplace with a little more trust.
            </h2>

            <p className="section-copy">
              MyCarsHub keeps the important first steps of a used-car deal in
              one place: clear vehicle details, account-based listings and
              private buyer-seller chat.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              [
                "Clear listings",
                "Standard vehicle details make it easier to understand what is actually being offered.",
              ],
              [
                "Private contact",
                "Buyers and sellers can talk through MyCarsHub without publishing personal email addresses.",
              ],
              [
                "Account-based marketplace",
                "Every listing is tied to a registered account, with ownership checks for seller actions.",
              ],
            ].map(([title, copy]) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-200 bg-white p-6"
              >
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white">
        <div className="page-container py-12 lg:py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="section-title">Recently listed</h2>

              <p className="section-copy">
                A few cars currently available on the marketplace.
              </p>
            </div>

            <Link
              to="/cars"
              className="hidden text-sm font-semibold text-gray-600 hover:text-black sm:block"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading cars...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : cars.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          ) : (
            <div className="surface p-10 text-center">
              <p className="font-semibold">No cars available yet.</p>
              <p className="mt-1 text-sm text-gray-500">
                Be the first to list a car.
              </p>
            </div>
          )}

          <div className="mt-8 sm:hidden">
            <Link
              to="/cars"
              className="text-sm font-semibold text-gray-600 hover:text-black"
            >
              View all cars →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}