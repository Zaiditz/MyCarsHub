import { useEffect, useState } from "react";
import { getCars } from "../api/api";
import CarCard from "../Components/CarCard";

const initialFilters = { brand: "", city: "", fuelType: "", transmission: "", minPrice: "", maxPrice: "", minYear: "", maxYear: "" };

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = { ...filters, page, limit: 6 };
    Object.keys(params).forEach((key) => { if (params[key] === "") delete params[key]; });
    setLoading(true);
    getCars(params)
      .then((response) => { setCars(response.data.cars); setPagination(response.data.pagination); })
      .catch((err) => setError(err.response?.data?.message || "Failed to load cars"))
      .finally(() => setLoading(false));
  }, [filters, page]);

  function handleChange(e) {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPage(1);
  }

  function clearFilters() { setFilters(initialFilters); setPage(1); }

  return (
    <div className="page-shell"><div className="page-container">
      <div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-400">Marketplace</p><h1 className="section-title mt-2">Browse Cars</h1><p className="section-copy">Find privately listed cars using the filters below.</p></div>
      <div className="surface mb-8 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input name="brand" value={filters.brand} onChange={handleChange} placeholder="Brand" className="field" />
          <input name="city" value={filters.city} onChange={handleChange} placeholder="City" className="field" />
          <select name="fuelType" value={filters.fuelType} onChange={handleChange} className="field"><option value="">All Fuel Types</option><option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option><option>CNG</option></select>
          <select name="transmission" value={filters.transmission} onChange={handleChange} className="field"><option value="">All Transmissions</option><option>Automatic</option><option>Manual</option></select>
          <input type="number" name="minPrice" value={filters.minPrice} onChange={handleChange} placeholder="Minimum price" className="field" />
          <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleChange} placeholder="Maximum price" className="field" />
          <input type="number" name="minYear" value={filters.minYear} onChange={handleChange} placeholder="From year" className="field" />
          <input type="number" name="maxYear" value={filters.maxYear} onChange={handleChange} placeholder="To year" className="field" />
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 border-t border-gray-100 pt-4"><p className="text-sm text-gray-500">{pagination ? `${pagination.totalCars} cars found` : ""}</p><button onClick={clearFilters} className="secondary-button text-sm">Clear filters</button></div>
      </div>
      {loading ? <div className="surface p-10 text-center text-sm text-gray-500">Loading cars...</div> : error ? <div className="surface p-6 text-sm text-red-600">{error}</div> : cars.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{cars.map((car) => <CarCard key={car._id} car={car} />)}</div> : <div className="surface p-12 text-center"><h2 className="font-semibold">No cars found</h2><p className="mt-1 text-sm text-gray-500">Try broadening your filters.</p></div>}
      {pagination && pagination.totalPages > 1 && <div className="mt-10 flex items-center justify-center gap-4"><button disabled={pagination.currentPage === 1} onClick={() => setPage((p) => p - 1)} className="secondary-button text-sm disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="text-sm text-gray-600">Page {pagination.currentPage} of {pagination.totalPages}</span><button disabled={pagination.currentPage === pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="secondary-button text-sm disabled:cursor-not-allowed disabled:opacity-40">Next</button></div>}
    </div></div>
  );
}
