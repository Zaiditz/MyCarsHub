import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getMyCarById, updateCar } from "../api/api";

export default function EditCar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    brand: "",
    model: "",
    variant: "",
    year: "",
    price: "",
    fuelType: "Petrol",
    transmission: "Manual",
    mileage: "",
    kilometersDriven: "",
    city: "",
    description: "",
    status: "active",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await getMyCarById(id);
        const car = response.data.car;

        setForm({
          brand: car.brand || "",
          model: car.model || "",
          variant: car.variant || "",
          year: car.year || "",
          price: car.price || "",
          fuelType: car.fuelType || "Petrol",
          transmission: car.transmission || "Manual",
          mileage: car.mileage ?? "",
          kilometersDriven: car.kilometersDriven ?? "",
          city: car.city || "",
          description: car.description || "",
          status: car.status || "active",
        });
      } catch (error) {
        console.error("GET CAR ERROR:", error);

        setError(error.response?.data?.message || "Failed to load car");
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await updateCar(id, {
        ...form,
        year: Number(form.year),
        price: Number(form.price),
        mileage: form.mileage ? Number(form.mileage) : undefined,
        kilometersDriven: form.kilometersDriven
          ? Number(form.kilometersDriven)
          : undefined,
      });

      navigate("/my-listings");
    } catch (error) {
      console.error("UPDATE CAR ERROR:", error);

      setError(error.response?.data?.message || "Failed to update car");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading car...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/my-listings"
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back to My Listings
        </Link>

        <h1 className="text-3xl font-bold mt-6">Edit Car</h1>

        <p className="text-gray-500 mt-2 mb-8">Update your car listing.</p>

        {error && <p className="text-red-500 mb-6">{error}</p>}

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6"
        >
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">Brand</label>

              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Model</label>

              <input
                name="model"
                value={form.model}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Variant</label>

              <input
                name="variant"
                value={form.variant}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Year</label>

              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price</label>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">City</label>

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Fuel Type
              </label>

              <select
                name="fuelType"
                value={form.fuelType}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="CNG">CNG</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Transmission
              </label>

              <select
                name="transmission"
                value={form.transmission}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              >
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mileage</label>

              <input
                type="number"
                name="mileage"
                value={form.mileage}
                onChange={handleChange}
                min="0"
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Kilometers Driven
              </label>

              <input
                type="number"
                name="kilometersDriven"
                value={form.kilometersDriven}
                onChange={handleChange}
                min="0"
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              maxLength="2000"
              rows="5"
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}