import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { createCar } from "../api/api";

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const STEPS = [
  {
    number: 1,
    title: "Car details",
  },
  {
    number: 2,
    title: "Price & condition",
  },
  {
    number: 3,
    title: "Photos & publish",
  },
];

export default function SellCar() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

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

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  function handleImageChange(e) {
    const selectedFiles = Array.from(e.target.files || []);

    setError("");

    if (!selectedFiles.length) {
      return;
    }

    if (images.length + selectedFiles.length > MAX_IMAGES) {
      setError(`You can upload a maximum of ${MAX_IMAGES} images.`);
      e.target.value = "";
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) => !file.type.startsWith("image/"),
    );

    if (invalidFile) {
      setError("Please select image files only.");
      e.target.value = "";
      return;
    }

    const oversizedFile = selectedFiles.find(
      (file) => file.size > MAX_FILE_SIZE,
    );

    if (oversizedFile) {
      setError(
        `"${oversizedFile.name}" is larger than 5 MB. Please choose a smaller image.`,
      );
      e.target.value = "";
      return;
    }

    setImages((prev) => [...prev, ...selectedFiles]);

    e.target.value = "";
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, imageIndex) => imageIndex !== index));
  }

  useEffect(() => {
    const nextPreviews = images.map((image) => ({
      url: URL.createObjectURL(image),
      name: image.name,
    }));

    setPreviews(nextPreviews);

    return () => {
      nextPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [images]);

  const formattedPrice = useMemo(() => {
    const price = Number(form.price);

    if (!price || price < 0) {
      return "₹0";
    }

    return `₹${price.toLocaleString("en-IN")}`;
  }, [form.price]);

  const formattedKilometers = useMemo(() => {
    const kilometers = Number(form.kilometersDriven);

    if (!form.kilometersDriven || Number.isNaN(kilometers)) {
      return "—";
    }

    return `${kilometers.toLocaleString("en-IN")} km`;
  }, [form.kilometersDriven]);

  function validateStep(currentStep) {
    setError("");

    if (currentStep === 1) {
      if (!form.brand.trim()) {
        setError("Please enter the car brand.");
        return false;
      }

      if (!form.model.trim()) {
        setError("Please enter the car model.");
        return false;
      }

      if (!form.year) {
        setError("Please enter the manufacturing year.");
        return false;
      }

      const year = Number(form.year);
      const currentYear = new Date().getFullYear();

      if (!Number.isFinite(year) || year < 1900 || year > currentYear) {
        setError(`Please enter a valid year between 1900 and ${currentYear}.`);
        return false;
      }
    }

    if (currentStep === 2) {
      if (!form.price) {
        setError("Please enter the selling price.");
        return false;
      }

      const price = Number(form.price);

      if (!Number.isFinite(price) || price < 0) {
        setError("Please enter a valid selling price.");
        return false;
      }

      if (!form.city.trim()) {
        setError("Please enter the city.");
        return false;
      }

      if (
        form.mileage !== "" &&
        (!Number.isFinite(Number(form.mileage)) || Number(form.mileage) < 0)
      ) {
        setError("Please enter a valid mileage.");
        return false;
      }

      if (
        form.kilometersDriven !== "" &&
        (!Number.isFinite(Number(form.kilometersDriven)) ||
          Number(form.kilometersDriven) < 0)
      ) {
        setError("Please enter valid kilometers driven.");
        return false;
      }
    }

    return true;
  }

  function nextStep() {
    if (!validateStep(step)) {
      return;
    }

    setStep((current) => Math.min(current + 1, 3));
  }

  function previousStep() {
    setError("");
    setStep((current) => Math.max(current - 1, 1));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateStep(1) || !validateStep(2)) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (images.length > MAX_IMAGES) {
        setError(`You can upload a maximum of ${MAX_IMAGES} images.`);
        return;
      }

      const formData = new FormData();

      formData.append("brand", form.brand.trim());
      formData.append("model", form.model.trim());
      formData.append("variant", form.variant.trim());
      formData.append("year", form.year);
      formData.append("price", form.price);
      formData.append("fuelType", form.fuelType);
      formData.append("transmission", form.transmission);
      formData.append("mileage", form.mileage);
      formData.append("kilometersDriven", form.kilometersDriven);
      formData.append("city", form.city.trim());
      formData.append("description", form.description.trim());

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await createCar(formData);

      navigate("/cars");
    } catch (error) {
      console.error("CREATE CAR ERROR:", error);

      setError(error.response?.data?.message || "Failed to create car listing");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
            Sell on MyCarsHub
          </p>

          <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
                List your car
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                Add a few details, upload your photos, and get your listing in
                front of interested buyers.
              </p>
            </div>

            <p className="text-sm text-gray-400">Step {step} of 3</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex items-center">
            {STEPS.map((item, index) => {
              const completed = step > item.number;
              const active = step === item.number;

              return (
                <div
                  key={item.number}
                  className="flex min-w-0 flex-1 items-center"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                        completed || active
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {completed ? "✓" : item.number}
                    </div>

                    <div className="hidden min-w-0 sm:block">
                      <p
                        className={`truncate text-xs font-semibold ${
                          active ? "text-black" : "text-gray-400"
                        }`}
                      >
                        {item.title}
                      </p>
                    </div>
                  </div>

                  {index < STEPS.length - 1 && (
                    <div
                      className={`mx-3 h-px flex-1 ${
                        step > item.number ? "bg-black" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-7">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                  Step 1
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em]">
                  What car are you selling?
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Start with the basic details buyers look for first.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Brand
                  </label>

                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-gray-500 focus:bg-white"
                    placeholder="e.g. Hyundai"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Model
                    </label>

                    <input
                      name="model"
                      value={form.model}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-gray-500 focus:bg-white"
                      placeholder="e.g. Creta"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Variant
                    </label>

                    <input
                      name="variant"
                      value={form.variant}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-gray-500 focus:bg-white"
                      placeholder="e.g. SX (O)"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Manufacturing year
                  </label>

                  <input
                    type="number"
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    required
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-gray-500 focus:bg-white"
                    placeholder="2022"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={nextStep}
                  className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Continue →
                </button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-7">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                  Step 2
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em]">
                  Tell buyers about the car
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Pricing, mileage and location help buyers decide quickly.
                </p>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <label className="block text-sm font-semibold">
                    Selling price
                  </label>

                  <div className="mt-3 flex items-center rounded-xl border border-gray-200 bg-white px-4">
                    <span className="text-lg font-semibold text-gray-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full bg-transparent px-3 py-3 text-xl font-bold outline-none"
                      placeholder="11,25,000"
                    />
                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    Enter the amount you'd like to receive for the car.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Kilometers driven
                    </label>

                    <input
                      type="number"
                      name="kilometersDriven"
                      value={form.kilometersDriven}
                      onChange={handleChange}
                      min="0"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-gray-500 focus:bg-white"
                      placeholder="45,000"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Mileage
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        name="mileage"
                        value={form.mileage}
                        onChange={handleChange}
                        min="0"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-16 outline-none transition focus:border-gray-500 focus:bg-white"
                        placeholder="18"
                      />

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        km/l
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Fuel type
                    </label>

                    <select
                      name="fuelType"
                      value={form.fuelType}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-gray-500 focus:bg-white"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="CNG">CNG</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Transmission
                    </label>

                    <select
                      name="transmission"
                      value={form.transmission}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-gray-500 focus:bg-white"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Location
                  </label>

                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-gray-500 focus:bg-white"
                    placeholder="Delhi"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-semibold">
                      Description
                    </label>

                    <span className="text-xs text-gray-400">
                      {form.description.length}/2000
                    </span>
                  </div>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    maxLength="2000"
                    rows="5"
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-gray-500 focus:bg-white"
                    placeholder="Mention service history, condition, ownership, features or anything else buyers should know..."
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={previousStep}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-black"
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={nextStep}
                  className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Continue →
                </button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                    Step 3
                  </p>

                  <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em]">
                    Add photos
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Good photos make your listing much more attractive to
                    buyers.
                  </p>
                </div>

                {images.length < MAX_IMAGES && (
                  <label
                    htmlFor="car-images"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center transition hover:border-gray-500 hover:bg-gray-100"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl text-gray-500 shadow-sm ring-1 ring-gray-200">
                      +
                    </div>

                    <p className="mt-4 text-sm font-semibold text-gray-800">
                      Add car photos
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Click to browse from your device
                    </p>

                    <p className="mt-3 text-xs text-gray-400">
                      JPG, PNG and other image formats · Up to 5 MB each
                    </p>
                  </label>
                )}

                <input
                  id="car-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />

                {previews.length > 0 && (
                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold">Your photos</p>

                      <p className="text-xs font-medium text-gray-400">
                        {images.length}/{MAX_IMAGES}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {previews.map((preview, index) => (
                        <div
                          key={`${preview.name}-${index}`}
                          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
                        >
                          <img
                            src={preview.url}
                            alt={`Car preview ${index + 1}`}
                            className="aspect-4/3 w-full object-cover"
                          />

                          {index === 0 && (
                            <span className="absolute left-2 top-2 rounded-md bg-black px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                              Cover
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-base font-bold text-gray-600 shadow-md transition hover:bg-red-50 hover:text-red-600"
                            aria-label={`Remove ${preview.name}`}
                          >
                            ×
                          </button>

                          <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1.5">
                            <p className="truncate text-[11px] text-white">
                              {preview.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 text-xs text-gray-400">
                      Your first photo will be used as the cover image.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                    Preview
                  </p>

                  <h2 className="mt-2 text-xl font-bold">Your listing</h2>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  <div className="grid sm:grid-cols-[180px_1fr]">
                    <div className="flex aspect-4/3 items-center justify-center overflow-hidden bg-[#ededeb] sm:aspect-auto">
                      {previews[0] ? (
                        <img
                          src={previews[0].url}
                          alt="Listing cover"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <p className="text-3xl text-gray-300">+</p>

                          <p className="mt-1 text-xs text-gray-400">
                            Add a cover photo
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-bold">
                            {form.brand || "Your brand"}{" "}
                            {form.model || "Your model"}
                          </p>

                          {form.variant && (
                            <p className="mt-1 text-sm text-gray-500">
                              {form.variant}
                            </p>
                          )}
                        </div>

                        <p className="text-lg font-extrabold">
                          {formattedPrice}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                        {form.year && <span>{form.year}</span>}

                        {form.fuelType && <span>{form.fuelType}</span>}

                        {form.transmission && <span>{form.transmission}</span>}

                        {form.kilometersDriven && (
                          <span>{formattedKilometers}</span>
                        )}

                        {form.city && <span>{form.city}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <button
                  type="button"
                  onClick={previousStep}
                  disabled={loading}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-black disabled:opacity-50"
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Publishing..." : "Publish Listing"}
                </button>
              </div>
            </section>
          )}
        </form>
      </div>
    </div>
  );
}