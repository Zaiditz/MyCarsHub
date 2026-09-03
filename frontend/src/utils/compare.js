function resolveUserId(userId) {
  if (userId) return userId;

  const user = JSON.parse(localStorage.getItem("user") || "null");
  return user?.id || null;
}

export function getCompareCars(userId) {
  const resolvedUserId = resolveUserId(userId);

  if (!resolvedUserId) return [];

  return JSON.parse(
    localStorage.getItem(`compareCars_${resolvedUserId}`) || "[]",
  );
}

export function addToCompare(carId, userId) {
  const resolvedUserId = resolveUserId(userId);

  if (!resolvedUserId) return false;

  const key = `compareCars_${resolvedUserId}`;
  const compareCars = getCompareCars(resolvedUserId);

  if (compareCars.includes(carId)) return false;

  localStorage.setItem(key, JSON.stringify([...compareCars, carId]));
  return true;
}

export function removeFromCompare(carId, userId) {
  const resolvedUserId = resolveUserId(userId);

  if (!resolvedUserId) return;

  const key = `compareCars_${resolvedUserId}`;
  const updatedCars = getCompareCars(resolvedUserId).filter(
    (id) => id !== carId,
  );

  localStorage.setItem(key, JSON.stringify(updatedCars));
}
