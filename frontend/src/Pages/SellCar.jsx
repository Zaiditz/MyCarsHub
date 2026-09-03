import { useState } from "react";
import { useNavigate } from "react-router";
import { createCar } from "../api/api";

export default function SellCar() {
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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);

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
    setLoading(true);
    setError("");

    if (images.length > 6) {
      setError("You can upload a maximum of 6 images");
      return;
    }

    const formData = new FormData();

    formData.append("brand", form.brand);
    formData.append("model", form.model);
    formData.append("variant", form.variant);
    formData.append("year", form.year);
    formData.append("price", form.price);
    formData.append("fuelType", form.fuelType);
    formData.append("transmission", form.transmission);
    formData.append("mileage", form.mileage);
    formData.append("kilometersDriven", form.kilometersDriven);
    formData.append("city", form.city);
    formData.append("description", form.description);

    images.forEach((image) => {
      formData.append("images", image);
    });

    const response = await createCar(formData);

    console.log("CAR CREATED:", response.data);

    navigate("/cars");
  } catch (error) {
    console.error("CREATE CAR ERROR:", error);

    setError(error.response?.data?.message || "Failed to create car listing");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">Sell Your Car</h1>

        <p className="text-gray-500 mt-2 mb-8">
          Add your car details to create a listing.
        </p>

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
                placeholder="BMW"
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
                placeholder="3 Series"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Variant</label>

              <input
                name="variant"
                value={form.variant}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
                placeholder="320d"
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
                placeholder="2022"
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
                placeholder="450000"
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
                placeholder="Delhi"
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
                placeholder="18"
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
                placeholder="45000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Car Images</label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files))}
              className="w-full border rounded-lg px-4 py-3"
            />

            <p className="text-sm text-gray-500 mt-2">
              You can upload up to 6 images. Maximum 5 MB each.
            </p>
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
              placeholder="Describe the condition of your car..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Listing Car..." : "List Car"}
          </button>
        </form>
      </div>
    </div>
  );
}