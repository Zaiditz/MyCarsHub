export function getRecommendedCars(currentCar, cars, limit = 4) {
  if (!currentCar || !cars?.length) {
    return [];
  }

  const scoredCars = cars
    .filter((car) => car._id !== currentCar._id)
    .map((car) => {
      let score = 0;
      if (
        car.fuelType &&
        currentCar.fuelType &&
        car.fuelType === currentCar.fuelType
      ) {
        score += 3;
      }
      if (
        car.transmission &&
        currentCar.transmission &&
        car.transmission === currentCar.transmission
      ) {
        score += 2;
      }
      if (
        car.city &&
        currentCar.city &&
        car.city.toLowerCase() === currentCar.city.toLowerCase()
      ) {
        score += 2;
      }
      if (currentCar.price && car.price) {
        const priceDifference =
          Math.abs(car.price - currentCar.price) / currentCar.price;

        if (priceDifference <= 0.1) {
          score += 3;
        } else if (priceDifference <= 0.2) {
          score += 2;
        } else if (priceDifference <= 0.3) {
          score += 1;
        }
      }
      if (currentCar.year && car.year) {
        const yearDifference = Math.abs(car.year - currentCar.year);

        if (yearDifference === 0) {
          score += 2;
        } else if (yearDifference === 1) {
          score += 1;
        }
      }
      if (
        car.brand &&
        currentCar.brand &&
        car.brand.toLowerCase() === currentCar.brand.toLowerCase()
      ) {
        score += 1;
      }

      return {
        car,
        score,
      };
    });

  return scoredCars
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.car);
}